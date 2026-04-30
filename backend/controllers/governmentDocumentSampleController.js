// ============================================================================
// Government Document Sample Controller
// Handles fetching and displaying official government document samples
// ============================================================================

const GovernmentDocumentSample = require('../models/GovernmentDocumentSample');

/**
 * GET /api/document-samples
 * Get all government document samples
 */
exports.getAllSamples = async (req, res) => {
    try {
        console.log('\n📄 GET ALL GOVERNMENT DOCUMENT SAMPLES');

        const { category, language, documentType } = req.query;

        const filters = {};
        if (category) filters.category = category;
        if (language) filters.language = language;
        if (documentType) filters.documentType = documentType;

        const samples = await GovernmentDocumentSample.findAll(filters);

        // Format response
        const formattedSamples = samples.map(sample => ({
            id: sample.id,
            type: sample.document_type,
            title: sample.document_title,
            category: sample.document_category,
            authority: {
                source: sample.authority_source,
                department: sample.issuing_department,
                sourceUrl: sample.source_url
            },
            document: {
                url: sample.sample_pdf_url,
                sizeKB: sample.file_size_kb,
                language: sample.language
            },
            description: sample.description,
            applicableActs: sample.applicable_acts,
            verification: {
                status: sample.verification_status,
                lastVerified: sample.last_verified_date
            },
            disclaimer: sample.disclaimer,
            stats: {
                views: sample.view_count,
                downloads: sample.download_count
            },
            createdAt: sample.created_at
        }));

        res.json({
            success: true,
            message: 'Government document samples retrieved successfully',
            total: formattedSamples.length,
            samples: formattedSamples,
            disclaimer: '⚖️ These documents are official samples from government sources for reference purposes only. Final documents may vary based on specific requirements and jurisdictions.'
        });

        console.log(`   ✅ Retrieved ${formattedSamples.length} samples`);

    } catch (error) {
        console.error('   ❌ Error fetching government samples:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve government document samples',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * GET /api/document-samples/:documentType
 * Get a specific government document sample by type
 */
exports.getSampleByType = async (req, res) => {
    try {
        const { documentType } = req.params;

        console.log('\n📄 GET GOVERNMENT SAMPLE BY TYPE');
        console.log('   Document Type:', documentType);

        const sample = await GovernmentDocumentSample.findByType(documentType);

        if (!sample) {
            return res.status(404).json({
                success: false,
                message: `No government sample found for document type: ${documentType}`,
                availableTypes: await getAvailableDocumentTypes()
            });
        }

        // Increment view count
        await GovernmentDocumentSample.incrementViewCount(sample.id);

        // Format response
        const formattedSample = {
            id: sample.id,
            type: sample.document_type,
            title: sample.document_title,
            category: sample.document_category,
            authority: {
                source: sample.authority_source,
                department: sample.issuing_department,
                sourceUrl: sample.source_url,
                officialBadge: '✓ Official Government Source'
            },
            document: {
                url: sample.sample_pdf_url,
                sizeKB: sample.file_size_kb,
                language: sample.language,
                downloadable: true
            },
            description: sample.description,
            applicableActs: sample.applicable_acts,
            verification: {
                status: sample.verification_status,
                lastVerified: sample.last_verified_date,
                message: sample.verification_status === 'Verified'
                    ? '✅ This document has been verified from official sources'
                    : '⚠️ This document may need re-verification'
            },
            disclaimer: sample.disclaimer,
            stats: {
                views: sample.view_count + 1, // Include current view
                downloads: sample.download_count
            },
            usage: {
                instructions: 'This is a reference format. Click "View Official Sample" to open the PDF in a new tab.',
                watermark: 'Sample documents are watermarked "For Reference Only"',
                legalNote: 'Always consult with a qualified lawyer before using any legal document.'
            }
        };

        res.json({
            success: true,
            sample: formattedSample,
            disclaimer: '⚖️ IMPORTANT: This is a reference format issued by a government authority. Final document may vary based on specific requirements and jurisdictions. This platform does not claim government endorsement.'
        });

        console.log('   ✅ Sample retrieved and view counted');

    } catch (error) {
        console.error('   ❌ Error fetching sample:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve document sample',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * GET /api/document-samples/:id/download
 * Track download of a government document sample
 */
exports.trackDownload = async (req, res) => {
    try {
        const { id } = req.params;

        const sample = await GovernmentDocumentSample.findById(id);

        if (!sample) {
            return res.status(404).json({
                success: false,
                message: 'Document sample not found'
            });
        }

        // Increment download count
        await GovernmentDocumentSample.incrementDownloadCount(id);

        res.json({
            success: true,
            message: 'Download tracked successfully',
            downloadUrl: sample.sample_pdf_url,
            disclaimer: 'This document is for reference purposes only. Not for legal use without professional review.'
        });

    } catch (error) {
        console.error('   ❌ Error tracking download:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track download'
        });
    }
};

/**
 * GET /api/document-samples/categories
 * Get all available document categories
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = [
            {
                id: 'Affidavit',
                name: 'Affidavit',
                description: 'Sworn statements of facts',
                icon: '📜'
            },
            {
                id: 'RTI_Application',
                name: 'RTI Application',
                description: 'Right to Information applications',
                icon: '📋'
            },
            {
                id: 'Legal_Notice',
                name: 'Legal Notice',
                description: 'Formal legal notices',
                icon: '⚖️'
            },
            {
                id: 'Agreement',
                name: 'Agreement',
                description: 'Legal agreements and contracts',
                icon: '📝'
            },
            {
                id: 'Power_of_Attorney',
                name: 'Power of Attorney',
                description: 'Authority delegation documents',
                icon: '🔑'
            },
            {
                id: 'Will',
                name: 'Will',
                description: 'Last will and testament',
                icon: '📄'
            },
            {
                id: 'Petition',
                name: 'Petition',
                description: 'Court petitions and applications',
                icon: '⚖️'
            },
            {
                id: 'Application',
                name: 'Application',
                description: 'Various legal applications',
                icon: '📑'
            },
            {
                id: 'Notarized_Document',
                name: 'Notarized Document',
                description: 'Documents requiring notarization',
                icon: '✍️'
            },
            {
                id: 'Other',
                name: 'Other',
                description: 'Miscellaneous legal documents',
                icon: '📁'
            }
        ];

        res.json({
            success: true,
            categories,
            total: categories.length
        });

    } catch (error) {
        console.error('   ❌ Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories'
        });
    }
};

/**
 * Helper function to get available document types
 */
async function getAvailableDocumentTypes() {
    try {
        const samples = await GovernmentDocumentSample.findAll();
        return [...new Set(samples.map(s => s.document_type))];
    } catch {
        return [];
    }
}

module.exports = exports;
