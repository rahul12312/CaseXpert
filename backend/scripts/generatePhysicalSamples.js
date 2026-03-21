const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const samplesDir = path.join(__dirname, '../public/samples');

if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
}

const files = [
    { name: 'sample_agreement.pdf', title: 'Agreement Sample' },
    { name: 'sample_affidavit.pdf', title: 'Affidavit Sample' },
    { name: 'sample_notice.pdf', title: 'Legal Notice Sample' },
    { name: 'sample_will.pdf', title: 'Will Sample' },
    { name: 'sample_nda.pdf', title: 'NDA Sample' },
    { name: 'sample_poa.pdf', title: 'Power of Attorney Sample' }
];

files.forEach(file => {
    try {
        const doc = new PDFDocument({
            margins: { top: 72, bottom: 72, left: 72, right: 72 }
        });
        const filePath = path.join(samplesDir, file.name);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(24).text(file.title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('OFFICIAL SAMPLE TEMPLATE', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).text('This is a formal sample document for ' + file.title + '.');
        doc.moveDown();
        doc.text('1. PARTIES INVOLVED');
        doc.text('2. TERMS AND CONDITIONS');
        doc.text('3. OBLIGATIONS AND LIABILITIES');
        doc.text('4. TERMINATION CLAUSE');
        doc.text('5. SIGNATURES AND WITNESSES');

        doc.moveDown(4);
        doc.fontSize(10).text('DISCLAIMER: This document is provided for informational and educational purposes only. It does not constitute legal advice and should not be used as a substitute for consulting with a qualified attorney.');

        doc.end();
        console.log(`✅ Queued: ${file.name}`);

        stream.on('finish', () => {
            console.log(`📀 Written: ${file.name}`);
        });
    } catch (e) {
        console.error(`❌ Failed ${file.name}:`, e.message);
    }
});
