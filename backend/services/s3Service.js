const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Check if credentials exist to avoid immediate crash on require, but methods will fail
const isConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

if (!isConfigured) {
    console.warn("⚠️ AWS S3 credentials missing. Document storage will fail.");
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "casexpert-documents";

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer 
 * @param {string} key - Full path in bucket
 * @param {string} mimeType 
 */
async function uploadFile(fileBuffer, key, mimeType) {
    if (!isConfigured) throw new Error("AWS credentials not configured");

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType
    });
    return await s3Client.send(command);
}

/**
 * Get a presigned URL for downloading/viewing
 * @param {string} key 
 * @param {number} expiresIn - Seconds (default 1 hour)
 */
async function getPresignedDownloadUrl(key, expiresIn = 3600) {
    if (!isConfigured) throw new Error("AWS credentials not configured");

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3
 * @param {string} key 
 */
async function deleteFile(key) {
    if (!isConfigured) throw new Error("AWS credentials not configured");

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    return await s3Client.send(command);
}

module.exports = { uploadFile, getPresignedDownloadUrl, deleteFile };
