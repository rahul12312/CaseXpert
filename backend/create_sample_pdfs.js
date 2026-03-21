// ============================================================================
// Create Sample Government PDFs (For Testing Only)
// This script creates placeholder PDFs for testing the government samples feature
// ============================================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Ensure samples directory exists
const samplesDir = path.join(__dirname, 'public', 'samples');
if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
    console.log('✅ Created directory:', samplesDir);
}

// Sample documents to create
const sampleDocs = [
    {
        filename: 'govt_affidavit_format.pdf',
        title: 'AFFIDAVIT',
        subtitle: 'Supreme Court of India - Format',
        content: `
AFFIDAVIT

I, [Name of Deponent], son/daughter of [Father's Name], aged [Age] years, residing at [Complete Address], do hereby solemnly affirm and state on oath as follows:

1. That I am the deponent herein and I am well conversant with the facts and circumstances of the present case.

2. That I state that all the averments made in the present affidavit are true and correct to the best of my knowledge and nothing material has been concealed therefrom.

3. That I have read the contents of the above affidavit and the same are true and correct to the best of my knowledge and belief.


DEPONENT


VERIFICATION

Verified at [Place] on this [Date] day of [Month], [Year] that the contents of paras 1 to 3 of the above affidavit are true and correct to the best of my knowledge and belief and nothing material has been concealed therefrom.


DEPONENT
        `,
        authority: 'Supreme Court of India',
        disclaimer: 'This is a reference format. Actual requirements may vary based on jurisdiction.'
    },
    {
        filename: 'govt_rti_application.pdf',
        title: 'APPLICATION FOR INFORMATION',
        subtitle: 'Under Right to Information Act, 2005',
        content: `
To,
The Public Information Officer
[Name of the Department/Office]
[Address]

Subject: Application for information under the Right to Information Act, 2005

Respected Sir/Madam,

I, [Your Name], son/daughter of [Father's Name], resident of [Your Complete Address], hereby request information regarding:

1. [Specific information sought - be as specific as possible]

2. [Additional information if required]

This information is required for the following purpose:
[State the purpose]

I am ready to pay the prescribed fee as per the RTI Act, 2005.

Please provide the information in the following format:
□ Photocopies
□ Electronic format
□ Inspection of records

Thanking you,

Name: [Your Name]
Address: [Complete Address]
Phone: [Contact Number]
Email: [Email Address]

Date: [DD/MM/YYYY]
Signature: _______________
        `,
        authority: 'Government of India - Department of Personnel & Training',
        disclaimer: 'RTI applications must be filed as per the RTI Act, 2005. Fee: ₹10 for Central Government departments.'
    },
    {
        filename: 'govt_legal_notice.pdf',
        title: 'LEGAL NOTICE',
        subtitle: 'Bar Council of India - Standard Format',
        content: `
LEGAL NOTICE

To,
[Name of the Addressee]
[Complete Address]

Dear Sir/Madam,

UNDER INSTRUCTIONS AND ON BEHALF OF MY CLIENT [CLIENT NAME]

I, [Advocate Name], practicing advocate at [Court Name], do hereby serve you with this legal notice on behalf of my client [Client Name], and to state as follows:

1. That my client is [brief description of client's status/position].

2. That [state the facts of the case chronologically].

3. That [state the legal grounds/rights].

4. That my client has suffered [describe damages/loss].

5. That through this legal notice, my client calls upon you to [state the demand/action required] within 15 days from the receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you without any further notice.

Kindly treat this as most urgent and govern yourself accordingly.

Date: [DD/MM/YYYY]
Place: [City]

Yours faithfully,

[Advocate Name]
[Advocate Enrollment No.]
[Address]
[Contact Details]
        `,
        authority: 'Bar Council of India',
        disclaimer: 'Legal notices must be drafted by qualified advocates. This is a template format only.'
    },
    {
        filename: 'govt_power_of_attorney.pdf',
        title: 'GENERAL POWER OF ATTORNEY',
        subtitle: 'Ministry of Law and Justice - Format',
        content: `
GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that I, [Your Name], son/daughter of [Father's Name], aged [Age] years, residing at [Complete Address], (hereinafter referred to as the "Principal") do hereby nominate, constitute and appoint [Attorney Name], son/daughter of [Attorney's Father's Name], aged [Age] years, residing at [Attorney's Address], (hereinafter referred to as the "Attorney") to be my true and lawful Attorney.

TO DO in my name and on my behalf all or any of the following acts, deeds and things, that is to say:

1. To manage, administer, and deal with my properties situated at [Property Details].

2. To execute, sign and deliver all deeds, documents, and papers necessary.

3. To represent me before any government authorities, banks, and offices.

4. To file returns, applications, and receive communications.

5. To do all other lawful acts necessary for the purposes aforesaid.

AND I hereby agree to ratify all acts, deeds and things lawfully done by my said Attorney pursuant to this Power of Attorney.

IN WITNESS WHEREOF I have hereunto set my hand this [Day] day of [Month], [Year].


PRINCIPAL                                    ATTORNEY

Witnesses:
1. _________________
2. _________________
        `,
        authority: 'Ministry of Law and Justice, Government of India',
        disclaimer: 'Power of Attorney must be executed on stamp paper and registered as per state laws.'
    },
    {
        filename: 'govt_notarized_affidavit.pdf',
        title: 'NOTARIZED AFFIDAVIT',
        subtitle: 'Department of Justice - Format',
        content: `
AFFIDAVIT

I, [Name], son/daughter of [Father's Name], aged [Age] years, residing at [Address], do hereby solemnly affirm and declare as follows:

1. That I am a citizen of India.

2. That [state the facts that need to be affirmed].

3. That I swear that the above information is true and correct to the best of my knowledge and belief.


DEPONENT


VERIFICATION

Verified at [Place] on this [Date] that the contents of the above affidavit are true and correct to the best of my knowledge and belief.


DEPONENT

---

NOTARIZATION

Subscribed and sworn to before me on this [Date] day of [Month], [Year].


Notary Public
Registration No.: __________
Seal:
        `,
        authority: 'Department of Justice, Government of India',
        disclaimer: 'This affidavit must be notarized by a licensed Notary Public.'
    },
    {
        filename: 'govt_court_petition.pdf',
        title: 'PETITION',
        subtitle: 'High Court Format',
        content: `
IN THE HIGH COURT OF [STATE NAME]
[COURT TYPE] JURISDICTION

[CASE TYPE] PETITION NO. _____ OF 20__

IN THE MATTER OF:

[Petitioner Name]                                           ...Petitioner

VERSUS

[Respondent Name]                                       ...Respondent

PETITION UNDER [RELEVANT LAW/ARTICLE]

TO,
THE HON'BLE CHIEF JUSTICE
AND HIS COMPANION JUSTICES OF THE
HIGH COURT OF [STATE NAME]

THE HUMBLE PETITION OF THE PETITIONER ABOVE-NAMED

MOST RESPECTFULLY SHOWETH:

1. That the Petitioner is [describe the petitioner's status].

2. That [state the facts chronologically, numbered serially].

3. That [state the legal grounds/rights].

4. That the Petitioner has no other efficacious remedy except to approach this Hon'ble Court.

5. That this Petition is being filed within the period of limitation.

PRAYER

In view of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) [State the primary relief sought]
b) [State additional reliefs]
c) Pass any other order as this Hon'ble Court may deem fit.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER
AS IN DUTY BOUND SHALL EVER PRAY.

PETITIONER
Through Advocate

Place: [City]
Date: [DD/MM/YYYY]
        `,
        authority: 'High Court of Delhi',
        disclaimer: 'Court petitions must be filed by registered advocates only. Format may vary by court.'
    }
];

// Function to create a PDF
function createSamplePDF(doc) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(samplesDir, doc.filename);
        const pdfDoc = new PDFDocument({
            margins: {
                top: 72,
                bottom: 72,
                left: 72,
                right: 72
            }
        });

        const stream = fs.createWriteStream(filePath);
        pdfDoc.pipe(stream);

        // Header
        pdfDoc.fontSize(22)
            .font('Helvetica-Bold')
            .text(doc.title, { align: 'center' });

        pdfDoc.moveDown(0.5);
        pdfDoc.fontSize(12)
            .font('Helvetica-Oblique')
            .text(doc.subtitle, { align: 'center' });

        // Watermark
        pdfDoc.moveDown();
        pdfDoc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#FF6B6B')
            .text('[ SAMPLE DOCUMENT - FOR REFERENCE ONLY ]', { align: 'center' });

        pdfDoc.fillColor('#000000');
        pdfDoc.moveDown(2);

        // Content
        pdfDoc.fontSize(11)
            .font('Helvetica')
            .text(doc.content.trim(), {
                align: 'justify',
                lineGap: 4
            });

        // Footer
        pdfDoc.moveDown(3);
        pdfDoc.fontSize(9)
            .font('Helvetica-Bold')
            .text('Source Authority:', { underline: true });

        pdfDoc.fontSize(9)
            .font('Helvetica')
            .text(doc.authority);

        pdfDoc.moveDown();
        pdfDoc.fontSize(8)
            .font('Helvetica-Oblique')
            .fillColor('#666666')
            .text('DISCLAIMER: ' + doc.disclaimer);

        pdfDoc.moveDown();
        pdfDoc.fontSize(7)
            .text('Generated by CaseXpert for demonstration purposes. This is not a legal document. ' +
                'Always consult with a qualified lawyer before using any legal document.');

        pdfDoc.end();

        stream.on('finish', () => {
            console.log(`   ✅ Created: ${doc.filename}`);
            resolve();
        });

        stream.on('error', reject);
    });
}

// Main execution
async function createAllSamples() {
    console.log('\n' + '='.repeat(60));
    console.log('📄 CREATING SAMPLE GOVERNMENT PDFs');
    console.log('='.repeat(60) + '\n');

    console.log('📂 Target directory:', samplesDir);
    console.log('📝 Creating', sampleDocs.length, 'sample PDFs...\n');

    try {
        for (const doc of sampleDocs) {
            await createSamplePDF(doc);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL SAMPLE PDFs CREATED SUCCESSFULLY');
        console.log('='.repeat(60) + '\n');

        console.log('📁 Location:', samplesDir);
        console.log('📊 Files created:', sampleDocs.length);
        console.log('\n⚠️  NEXT STEPS:');
        console.log('1. These are PLACEHOLDER PDFs for testing');
        console.log('2. Replace with ACTUAL government PDFs from official sources');
        console.log('3. Update database URLs if needed');
        console.log('4. Test the frontend at /document-drafting\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
createAllSamples();
