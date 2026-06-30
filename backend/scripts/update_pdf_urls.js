// ============================================================================
// Update Database URLs to Local Sample PDFs
// Run this after creating sample PDFs
// ============================================================================

const { createDatabasePool, getDatabase } = require('./config/database');

async function updateUrls() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 UPDATING DATABASE URLs FOR LOCAL PDFs');
    console.log('='.repeat(60) + '\n');

    try {
        await createDatabasePool();
        const db = getDatabase();

        const updates = [
            { type: 'affidavit_general', url: '/public/samples/govt_affidavit_format.pdf' },
            { type: 'rti_application', url: '/public/samples/govt_rti_application.pdf' },
            { type: 'legal_notice', url: '/public/samples/govt_legal_notice.pdf' },
            { type: 'power_of_attorney', url: '/public/samples/govt_power_of_attorney.pdf' },
            { type: 'notarized_affidavit', url: '/public/samples/govt_notarized_affidavit.pdf' },
            { type: 'court_petition', url: '/public/samples/govt_court_petition.pdf' }
        ];

        console.log('📝 Updating', updates.length, 'document URLs...\n');

        for (const update of updates) {
            await db.execute(
                'UPDATE government_document_samples SET sample_pdf_url = ? WHERE document_type = ?',
                [update.url, update.type]
            );
            console.log(`   ✅ Updated: ${update.type} → ${update.url}`);
        }

        // Verify
        console.log('\n📊 Verifying updates...\n');
        const [rows] = await db.execute('SELECT document_type, document_title, sample_pdf_url FROM government_document_samples');

        console.log('Current database state:');
        rows.forEach(row => {
            console.log(`   ${row.document_title}: ${row.sample_pdf_url}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE URLS UPDATED SUCCESSFULLY');
        console.log('='.repeat(60) + '\n');

        console.log('🎯 NEXT STEP: Test the API');
        console.log('   curl http://localhost:5001/api/document-samples\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

updateUrls();
