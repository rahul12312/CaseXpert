// ============================================================================
// Document Controller - Business logic for document generation
// ============================================================================

const path = require('path');
const fs = require('fs').promises;
const PDFDocument = require('pdfkit');
const { askAiLegalAssistant } = require('../services/aiLegalAssistantGroq');
// No database required for document generation

/**
 * Document templates and types
 */
const DOCUMENT_TYPES = {
    agreement: {
        name: 'Agreement',
        description: 'General agreement between parties',
        sampleFile: 'sample_agreement.pdf'
    },
    affidavit: {
        name: 'Affidavit',
        description: 'Sworn statement of facts',
        sampleFile: 'sample_affidavit.pdf'
    },
    notice: {
        name: 'Legal Notice',
        description: 'Formal legal notice',
        sampleFile: 'sample_notice.pdf'
    },
    will: {
        name: 'Will',
        description: 'Last will and testament',
        sampleFile: 'sample_will.pdf'
    },
    nda: {
        name: 'Non-Disclosure Agreement',
        description: 'Confidentiality agreement',
        sampleFile: 'sample_nda.pdf'
    },
    custom: {
        name: 'Custom Document',
        description: 'Custom legal document',
        sampleFile: 'sample_custom.pdf'
    },
    power_of_attorney: {
        name: 'Power of Attorney',
        description: 'Authority to act on behalf of another',
        sampleFile: 'sample_poa.pdf'
    }
};

/**
 * Generate a legal document draft using AI
 */
exports.generateDraft = async (req, res) => {
    try {
        console.log('\n📄 GENERATE DRAFT REQUEST');
        console.log('   User ID:', req.user?.id);
        console.log('   Body:', JSON.stringify(req.body, null, 2));

        const { documentType, userInputs } = req.body;

        // Validation
        if (!documentType) {
            return res.status(400).json({
                success: false,
                errorCode: 'VALIDATION_ERROR',
                message: 'Document type is required',
                fieldErrors: {
                    documentType: 'Please select a document type'
                }
            });
        }

        if (!DOCUMENT_TYPES[documentType]) {
            return res.status(400).json({
                success: false,
                errorCode: 'INVALID_DOCUMENT_TYPE',
                message: `Invalid document type: ${documentType}`,
                validTypes: Object.keys(DOCUMENT_TYPES)
            });
        }

        if (!userInputs || !userInputs.details || !userInputs.details.trim()) {
            return res.status(400).json({
                success: false,
                errorCode: 'VALIDATION_ERROR',
                message: 'Document details are required',
                fieldErrors: {
                    details: 'Please provide details for the document'
                }
            });
        }

        const docInfo = DOCUMENT_TYPES[documentType];

        // Build prompt for AI
        const prompt = `Generate a professional ${docInfo.name} based on the following details:

${userInputs.details}

Please format the document properly with:
- Appropriate legal language and structure
- Clear sections and headings
- Date, parties, and signature blocks where appropriate
- Professional formatting
- Disclaimer that this is a draft and should be reviewed by a lawyer

Document Type: ${docInfo.name}
Purpose: ${docInfo.description}`;

        console.log('   Calling AI to generate draft...');

        // Call AI to generate the draft
        const messages = [
            {
                role: 'system',
                content: 'You are a professional legal document drafter. Generate formal legal documents based on user requirements. Always include appropriate disclaimers and maintain professional formatting.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const aiResponse = await askAiLegalAssistant(messages, 'DOCUMENT_DRAFTING');
        const draft = aiResponse.reply;

        console.log('   ✅ Draft generated successfully');

        res.json({
            success: true,
            draft: draft,
            documentType: documentType,
            documentName: docInfo.name,
            disclaimer: '⚖️ IMPORTANT: This is an AI-generated draft for review purposes only. Always have a qualified lawyer review and approve any legal document before use.',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('   ❌ Error generating draft:', error);

        res.status(500).json({
            success: false,
            errorCode: 'GENERATION_ERROR',
            message: 'Failed to generate document draft',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Generate a PDF document
 */
exports.generateDocument = async (req, res) => {
    try {
        console.log('\n📄 GENERATE PDF REQUEST');
        console.log('   User ID:', req.user?.id);

        const { documentType, details, draft } = req.body;

        if (!documentType || !draft) {
            return res.status(400).json({
                success: false,
                message: 'Document type and draft content are required'
            });
        }

        const docInfo = DOCUMENT_TYPES[documentType] || DOCUMENT_TYPES.custom;

        // Create PDF
        const doc = new PDFDocument({
            margins: { top: 72, bottom: 72, left: 72, right: 72 }
        });

        // Set response headers for PDF download
        const filename = `${docInfo.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add header
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text(docInfo.name, { align: 'center' });

        doc.moveDown();
        doc.fontSize(10)
            .font('Helvetica')
            .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });

        doc.moveDown(2);

        // Add content
        doc.fontSize(12)
            .font('Helvetica')
            .text(draft, {
                align: 'justify',
                lineGap: 5
            });

        // Add footer
        doc.moveDown(3);
        doc.fontSize(10)
            .font('Helvetica-Oblique')
            .text('DISCLAIMER:', { underline: true });
        doc.fontSize(9)
            .text('This document was generated using CaseXpert AI and is for review purposes only. ' +
                'It has not been reviewed or approved by a licensed attorney. Always consult with a ' +
                'qualified lawyer before using any legal document.');

        // Finalize PDF
        doc.end();

        console.log('   ✅ PDF generated and sent');

    } catch (error) {
        console.error('   ❌ Error generating PDF:', error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF document',
                error: error.message
            });
        }
    }
};

/**
 * Get sample PDF for a document type
 */
exports.getSample = async (req, res) => {
    try {
        const { type } = req.params;
        const docInfo = DOCUMENT_TYPES[type];
        if (!docInfo) {
            return res.status(404).json({ success: false, message: `Unknown document type: ${type}` });
        }
        return res.json({
            success: true,
            isGenerated: true,
            type,
            title: docInfo.name,
            url: `/api/documents/samples/${type}/view`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch sample information' });
    }
};

/**
 * Endpoint to actually VIEW/STREAM the PDF (on-the-fly generation fallback)
 */
exports.viewSamplePdf = async (req, res) => {
    try {
        const { type } = req.params;
        const docInfo = DOCUMENT_TYPES[type] || { name: 'Legal Document', sampleFile: 'sample.pdf' };

        const doc = new PDFDocument({ margins: 72 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${docInfo.sampleFile}"`);

        doc.pipe(res);
        doc.fontSize(22).font('Helvetica-Bold').text(docInfo.name, { align: 'center' });
        doc.moveDown().fontSize(11).font('Helvetica-Oblique').text('SAMPLE TEMPLATE', { align: 'center' });
        doc.moveDown(2).fontSize(12).font('Helvetica').text('This is a structural sample for ' + docInfo.name + '.');
        doc.moveDown().text('1. Party Information\n2. Primary Agreement Clauses\n3. Terms and Conditions\n4. Signature blocks');
        doc.moveDown(4).fontSize(9).text('DISCLAIMER: For illustration only. Not legal advice.');
        doc.end();
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).send('Error generating PDF preview');
    }
};

/**
 * Get all available sample documents from database
 */
exports.getDocumentSamples = async (req, res) => {
    const samples = Object.entries(DOCUMENT_TYPES).map(([key, val]) => ({
        id: key,
        type: key,
        title: val.name,
        description: val.description,
        url: `/api/documents/samples/${key}/view`,
    }));
    res.json({ success: true, samples, total: samples.length });
};

/**
 * Get list of available document types
 */
exports.getDocumentTypes = (req, res) => {
    const types = Object.entries(DOCUMENT_TYPES).map(([key, value]) => ({
        id: key,
        name: value.name,
        description: value.description,
        hasSample: true
    }));

    res.json({
        success: true,
        types: types,
        total: types.length
    });
};
