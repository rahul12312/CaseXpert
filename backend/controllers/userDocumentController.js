const { getDatabase } = require("../config/database");
const s3Service = require("../services/s3Service");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require('fs').promises;

const uploadDocument = async (req, res) => {
    const db = getDatabase();
    try {
        const userId = req.user.id;
        const file = req.file;
        const { title, documentType = "uploaded" } = req.body;

        if (!file) return res.status(400).json({ success: false, message: "No file provided" });

        const fileExt = path.extname(file.originalname).toLowerCase();
        // Structure: /documents/{userId}/uploads/{uuid}{ext}
        const s3Key = `documents/${userId}/uploads/${uuidv4()}${fileExt}`;

        // Handle file buffer (Multer disk storage vs memory storage)
        let fileBuffer;
        if (file.buffer) {
            fileBuffer = file.buffer;
        } else if (file.path) {
            fileBuffer = await fs.readFile(file.path);
        } else {
            return res.status(500).json({ success: false, message: "File upload failed internally" });
        }

        console.log(`Uploading ${file.originalname} to S3 keys: ${s3Key}`);
        await s3Service.uploadFile(fileBuffer, s3Key, file.mimetype);

        // If using disk storage, clean up local file
        if (file.path) {
            try {
                await fs.unlink(file.path);
            } catch (e) { console.warn("Failed to cleanup temp file", e); }
        }

        // Save metadata
        const [result] = await db.execute(
            `INSERT INTO user_documents 
            (user_id, title, document_type, file_type, mime_type, file_size, s3_key) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title || file.originalname, documentType, fileExt.replace('.', ''), file.mimetype, file.size, s3Key]
        );

        res.json({ success: true, message: "Document uploaded successfully", documentId: result.insertId, s3Key });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const saveDraft = async (req, res) => {
    // Only metadata save for now, or text content upload
    // For now assuming we just save metadata or maybe a text file to S3
    const db = getDatabase();
    try {
        const userId = req.user.id;
        const { title, content } = req.body; // Content is draft text

        if (!title || !content) return res.status(400).json({ message: "Title and content required" });

        const s3Key = `documents/${userId}/drafts/${uuidv4()}.txt`;
        const buffer = Buffer.from(content, 'utf-8');

        await s3Service.uploadFile(buffer, s3Key, 'text/plain');

        const [result] = await db.execute(
            `INSERT INTO user_documents 
            (user_id, title, document_type, file_type, mime_type, file_size, s3_key) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, 'draft', 'txt', 'text/plain', buffer.length, s3Key]
        );

        res.json({ success: true, message: "Draft saved", documentId: result.insertId });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listDocuments = async (req, res) => {
    const db = getDatabase();
    try {
        const userId = req.user.id;
        const { type } = req.query; // 'draft' or 'uploaded'

        let query = "SELECT * FROM user_documents WHERE user_id = ? AND is_archived = FALSE";
        const params = [userId];

        if (type) {
            query += " AND document_type = ?";
            params.push(type);
        }

        query += " ORDER BY created_at DESC";

        const [documents] = await db.execute(query, params);
        res.json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDocument = async (req, res) => {
    const db = getDatabase();
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [docs] = await db.execute("SELECT * FROM user_documents WHERE id = ? AND user_id = ?", [id, userId]);
        if (docs.length === 0) return res.status(404).json({ success: false, message: "Document not found" });

        const doc = docs[0];

        if (doc.s3_key) {
            try {
                await s3Service.deleteFile(doc.s3_key);
            } catch (e) {
                console.warn("S3 delete failed:", e);
            }
        }

        await db.execute("DELETE FROM user_documents WHERE id = ?", [id]);

        res.json({ success: true, message: "Document deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDocumentUrl = async (req, res) => {
    const db = getDatabase();
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [docs] = await db.execute("SELECT * FROM user_documents WHERE id = ? AND user_id = ?", [id, userId]);
        if (docs.length === 0) return res.status(404).json({ success: false, message: "Document not found" });

        const doc = docs[0];
        if (!doc.s3_key) return res.status(400).json({ success: false, message: "File not found in storage" });

        const url = await s3Service.getPresignedDownloadUrl(doc.s3_key);
        res.json({ success: true, url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadDocument,
    saveDraft,
    listDocuments,
    deleteDocument,
    getDocumentUrl
};
