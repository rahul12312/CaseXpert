const { createDatabasePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setup() {
    const db = await createDatabasePool();
    if (!db) {
        console.error('Failed to connect to database');
        process.exit(1);
    }

    try {
        console.log('--- Setting up Document Samples ---');

        // Create table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS document_samples (
                id INT AUTO_INCREMENT PRIMARY KEY,
                document_type VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                sample_pdf_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.execute(createTableQuery);
        console.log('✅ Table document_samples created/exists');

        // Initial Data
        const samples = [
            {
                type: 'agreement',
                title: 'General Agreement',
                description: 'Standard agreement template for general use',
                url: '/public/samples/sample_agreement.pdf'
            },
            {
                type: 'affidavit',
                title: 'Legal Affidavit',
                description: 'Sworn statement template',
                url: '/public/samples/sample_affidavit.pdf'
            },
            {
                type: 'notice',
                title: 'Legal Notice',
                description: 'Formal legal notice template',
                url: '/public/samples/sample_notice.pdf'
            },
            {
                type: 'will',
                title: 'Last Will & Testament',
                description: 'Template for drafting your last will',
                url: '/public/samples/sample_will.pdf'
            },
            {
                type: 'nda',
                title: 'Non-Disclosure Agreement',
                description: 'Confidentiality agreement template',
                url: '/public/samples/sample_nda.pdf'
            },
            {
                type: 'power_of_attorney',
                title: 'Power of Attorney',
                description: 'Template for authorizing someone to act on your behalf',
                url: '/public/samples/sample_poa.pdf'
            }
        ];

        for (const sample of samples) {
            const [rows] = await db.execute('SELECT id FROM document_samples WHERE document_type = ?', [sample.type]);
            if (rows.length === 0) {
                await db.execute(
                    'INSERT INTO document_samples (document_type, title, description, sample_pdf_url) VALUES (?, ?, ?, ?)',
                    [sample.type, sample.title, sample.description, sample.url]
                );
                console.log(`➕ Added sample: ${sample.title}`);
            } else {
                console.log(`⏭️ Sample exists: ${sample.title}`);
            }
        }

        console.log('✅ Document samples setup complete');
        process.exit(0);

    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

setup();
