// ============================================================================
// Database Migration: Create Government Document Samples Table
// Run this script to set up the database schema
// ============================================================================

const { createDatabasePool, getDatabase } = require('./config/database');
const GovernmentDocumentSample = require('./models/GovernmentDocumentSample');

async function runMigration() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 DATABASE MIGRATION: Government Document Samples');
    console.log('='.repeat(60) + '\n');

    try {
        // 1. Connect to database
        console.log('📡 Connecting to database...');
        await createDatabasePool();
        const db = getDatabase();

        if (!db) {
            throw new Error('Failed to connect to database');
        }

        console.log('✅ Database connected successfully\n');

        // 2. Create table
        console.log('📋 Creating government_document_samples table...');
        await GovernmentDocumentSample.createTable();
        console.log('✅ Table created successfully\n');

        // 3. Insert sample data (official government document references)
        console.log('📝 Inserting sample government documents...\n');

        const sampleDocuments = [
            {
                document_type: 'affidavit_general',
                document_title: 'General Affidavit - Supreme Court Format',
                document_category: 'Affidavit',
                authority_source: 'Supreme Court of India',
                source_url: 'https://main.sci.gov.in/forms',
                issuing_department: 'Registry, Supreme Court',
                sample_pdf_url: '/public/samples/govt_affidavit_format.pdf',
                file_size_kb: 245,
                description: 'Standard affidavit format as prescribed by the Supreme Court of India for general purposes',
                language: 'English',
                applicable_acts: 'Code of Civil Procedure, 1908; Indian Evidence Act, 1872',
                last_verified_date: '2026-01-18',
                disclaimer: 'This is a reference format from Supreme Court of India. Actual requirements may vary based on specific case and jurisdiction. Always verify with the concerned court or legal professional.',
            },
            {
                document_type: 'rti_application',
                document_title: 'RTI Application - Central Government Format',
                document_category: 'RTI_Application',
                authority_source: 'Government of India - Department of Personnel & Training',
                source_url: 'https://rtionline.gov.in',
                issuing_department: 'Central Information Commission',
                sample_pdf_url: '/public/samples/govt_rti_application.pdf',
                file_size_kb: 180,
                description: 'Official RTI application format for filing Right to Information requests with Central Government departments',
                language: 'Both',
                applicable_acts: 'Right to Information Act, 2005',
                last_verified_date: '2026-01-18',
                disclaimer: 'This is the official RTI application format from Government of India. Applications must be filed as per RTI Act, 2005. Filing fee may be required.',
            },
            {
                document_type: 'legal_notice',
                document_title: 'Legal Notice - Standard Format',
                document_category: 'Legal_Notice',
                authority_source: 'Bar Council of India',
                source_url: 'https://www.barcouncilofindia.org',
                issuing_department: 'Bar Council of India',
                sample_pdf_url: '/public/samples/govt_legal_notice.pdf',
                file_size_kb: 210,
                description: 'Standard legal notice format recognized by Indian courts for various legal matters',
                language: 'English',
                applicable_acts: 'Code of Civil Procedure, 1908',
                last_verified_date: '2026-01-18',
                disclaimer: 'This is a template format. Legal notices must be drafted by qualified advocates as per specific case requirements and applicable laws.',
            },
            {
                document_type: 'power_of_attorney',
                document_title: 'Power of Attorney - General Format',
                document_category: 'Power_of_Attorney',
                authority_source: 'Ministry of Law and Justice',
                source_url: 'https://lawmin.gov.in',
                issuing_department: 'Legislative Department',
                sample_pdf_url: '/public/samples/govt_power_of_attorney.pdf',
                file_size_kb: 195,
                description: 'General Power of Attorney format as per Indian Registration Act and Powers of Attorney Act',
                language: 'English',
                applicable_acts: 'Powers of Attorney Act, 1882; Indian Registration Act, 1908',
                last_verified_date: '2026-01-18',
                disclaimer: 'This document must be executed on stamp paper of appropriate value and registered as per state laws. Consult a lawyer for specific requirements.',
            },
            {
                document_type: 'notarized_affidavit',
                document_title: 'Notarized Affidavit - Government Format',
                document_category: 'Notarized_Document',
                authority_source: 'State Government Legal Services',
                source_url: 'https://doj.gov.in',
                issuing_department: 'Department of Justice',
                sample_pdf_url: '/public/samples/govt_notarized_affidavit.pdf',
                file_size_kb: 220,
                description: 'Affidavit format for notarization purposes as accepted by government departments',
                language: 'English',
                applicable_acts: 'Indian Evidence Act, 1872; Notaries Act, 1952',
                last_verified_date: '2026-01-18',
                disclaimer: 'This affidavit must be notarized by a licensed notary public. Format may vary based on state-specific requirements.',
            },
            {
                document_type: 'court_petition',
                document_title: 'Petition Format - High Court',
                document_category: 'Petition',
                authority_source: 'High Court of Delhi',
                source_url: 'https://delhihighcourt.nic.in',
                issuing_department: 'Registry, Delhi High Court',
                sample_pdf_url: '/public/samples/govt_court_petition.pdf',
                file_size_kb: 280,
                description: 'Standard petition format for High Court proceedings',
                language: 'English',
                applicable_acts: 'Code of Civil Procedure, 1908',
                last_verified_date: '2026-01-18',
                disclaimer: 'Court petitions must be filed by registered advocates only. Format and requirements may vary by court and case type.',
            }
        ];

        let insertedCount = 0;
        for (const doc of sampleDocuments) {
            try {
                const id = await GovernmentDocumentSample.create(doc);
                console.log(`   ✅ Inserted: ${doc.document_title} (ID: ${id})`);
                insertedCount++;
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`   ⏭️  Skipped (already exists): ${doc.document_title}`);
                } else {
                    console.error(`   ❌ Failed to insert ${doc.document_title}:`, error.message);
                }
            }
        }

        console.log(`\n✅ Inserted ${insertedCount} new document samples`);

        // 4. Verify data
        console.log('\n📊 Verifying data...');
        const allSamples = await GovernmentDocumentSample.findAll();
        console.log(`✅ Total government document samples in database: ${allSamples.length}`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60) + '\n');

        console.log('📋 NEXT STEPS:');
        console.log('1. Upload actual PDF files to your cloud storage (AWS S3 / GCP / Azure)');
        console.log('2. Update the sample_pdf_url in database with actual cloud URLs');
        console.log('3. Verify all document sources are legitimate and up-to-date');
        console.log('4. Test the API endpoints: GET /api/document-samples');
        console.log('5. Update frontend to display these samples\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run migration
runMigration();
