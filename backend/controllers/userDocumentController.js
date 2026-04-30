const Document = require("../models/Document");
const s3Service = require("../services/s3Service");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs").promises;

const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    const { title, documentType = "uploaded" } = req.body;

    if (!file) return res.status(400).json({ success: false, message: "No file provided" });

    const fileExt = path.extname(file.originalname).toLowerCase();
    const s3Key = `documents/${userId}/uploads/${uuidv4()}${fileExt}`;

    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      fileBuffer = await fs.readFile(file.path);
    } else {
      return res.status(500).json({ success: false, message: "File upload failed internally" });
    }

    await s3Service.uploadFile(fileBuffer, s3Key, file.mimetype);

    if (file.path) {
      try { await fs.unlink(file.path); } catch (e) { console.warn("Failed to cleanup temp file", e); }
    }

    const doc = await Document.create({
      user: userId,
      file_name: title || file.originalname,
      file_url: s3Key,
      file_type: fileExt.replace(".", ""),
      file_size: file.size,
      description: documentType,
    });

    return res.json({ success: true, message: "Document uploaded successfully", documentId: doc._id, s3Key });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const saveDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content required" });

    const s3Key = `documents/${userId}/drafts/${uuidv4()}.txt`;
    const buffer = Buffer.from(content, "utf-8");
    await s3Service.uploadFile(buffer, s3Key, "text/plain");

    const doc = await Document.create({
      user: userId,
      file_name: title,
      file_url: s3Key,
      file_type: "txt",
      file_size: buffer.length,
      description: "draft",
    });

    return res.json({ success: true, message: "Draft saved", documentId: doc._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    const filter = { user: userId };
    if (type) filter.description = type;

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const doc = await Document.findOne({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    if (doc.file_url) {
      try { await s3Service.deleteFile(doc.file_url); } catch (e) { console.warn("S3 delete failed:", e); }
    }

    await Document.findByIdAndDelete(id);
    return res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDocumentUrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const doc = await Document.findOne({ _id: id, user: userId });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    if (!doc.file_url) return res.status(400).json({ success: false, message: "File not found in storage" });

    const url = await s3Service.getPresignedDownloadUrl(doc.file_url);
    return res.json({ success: true, url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadDocument, saveDraft, listDocuments, deleteDocument, getDocumentUrl };
