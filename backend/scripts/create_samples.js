const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const desktopPath = path.join(require('os').homedir(), 'Desktop');

const doc = new PDFDocument({
  margins: { top: 72, bottom: 72, left: 72, right: 72 }, // 1 inch margins
  size: 'A4'
});

const filePath = path.join(desktopPath, 'Real_Commercial_Lease_Agreement.pdf');
const stream = fs.createWriteStream(filePath);
doc.pipe(stream);

// Add content
doc.font('Times-Bold').fontSize(16).text('COMMERCIAL LEASE AGREEMENT', { align: 'center' });
doc.moveDown(2);

doc.font('Times-Roman').fontSize(11).text(
  'THIS COMMERCIAL LEASE AGREEMENT (the "Agreement" or "Lease") is made and entered into effective as of this 14th day of May, 2026, by and between APEX REALTY HOLDINGS PRIVATE LIMITED, a corporation organized and existing under the Companies Act, 2013, having its registered office at 45 Nariman Point, Mumbai, Maharashtra 400021 (hereinafter referred to as "Lessor", which expression shall, unless it be repugnant to the context or meaning thereof, be deemed to mean and include its successors and permitted assigns), and VANGUARD TECH SOLUTIONS, a limited liability partnership incorporated under the LLP Act, 2008, having its principal place of business at 12 Tech Park, Andheri East, Mumbai (hereinafter referred to as "Lessee", which expression shall, unless repugnant to the context or meaning thereof, be deemed to mean and include its successors and permitted assigns).',
  { align: 'justify', lineGap: 3 }
);

doc.moveDown(1);
doc.font('Times-Bold').text('WITNESSETH:', { underline: true });
doc.moveDown(0.5);

doc.font('Times-Roman').text(
  'WHEREAS, Lessor is the absolute owner and in lawful possession of the commercial premises situated at Unit 401, 4th Floor, Apex Tower, BKC, Mumbai, Maharashtra 400051, comprising approximately 5,500 square feet of super built-up area (the "Demised Premises"); and',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(0.5);
doc.text(
  'WHEREAS, Lessee is desirous of taking on lease the Demised Premises for the purpose of operating its corporate headquarters and software development center, and Lessor is willing to lease the same to Lessee on the terms, covenants, and conditions set forth herein.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1);

doc.font('Times-Bold').text('NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties hereto agree as follows:');
doc.moveDown(1);

doc.font('Times-Bold').text('1. GRANT OF LEASE AND TERM');
doc.font('Times-Roman').text(
  '1.1. The Lessor hereby demises unto the Lessee the Demised Premises for a term of sixty (60) months (the "Term"), commencing from the 1st day of June, 2026 (the "Commencement Date") and expiring on the 31st day of May, 2031, subject to earlier termination as provided herein.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(0.5);

doc.font('Times-Bold').text('2. RENT AND SECURITY DEPOSIT');
doc.font('Times-Roman').text(
  '2.1. The Lessee shall pay to the Lessor a monthly base rent of INR 1,250,000/- (Rupees Twelve Lakhs Fifty Thousand only) ("Base Rent"), exclusive of applicable Goods and Services Tax (GST) and any other statutory levies, which shall be borne entirely by the Lessee.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(0.5);
doc.text(
  '2.2. The Base Rent shall be subject to an automatic escalation of fifteen percent (15%) upon the expiration of every twelve (12) months from the Commencement Date. The Lessee acknowledges that this escalation is a material inducement for the Lessor entering into this Agreement.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(0.5);
doc.text(
  '2.3. The Lessee shall simultaneously with the execution of this Agreement deposit with the Lessor a sum of INR 7,500,000/- (Rupees Seventy-Five Lakhs only) as an interest-free refundable security deposit ("Security Deposit"). The Lessor reserves the right to deduct any unpaid rent, penalty, or cost of damages from this Security Deposit.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1);

doc.font('Times-Bold').text('3. OBLIGATIONS AND LIABILITIES (PENAL CLAUSES)');
doc.font('Times-Roman').text(
  '3.1. Late Payment: Time is of the essence. In the event the Lessee fails to remit the Base Rent on or before the 5th day of any calendar month, the Lessee shall be liable to pay a liquidated penalty of INR 10,000/- (Rupees Ten Thousand only) per day of delay, compounded weekly.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(0.5);
doc.text(
  '3.2. Lock-in Period: The Parties agree to a strict lock-in period of thirty-six (36) months from the Commencement Date. Should the Lessee terminate this Agreement or vacate the Demised Premises prior to the expiration of the lock-in period, the Lessee shall be liable to pay to the Lessor the entirety of the Base Rent for the unexpired portion of the lock-in period as a pre-estimated, undisputed debt, without prejudice to the Lessor\'s right to forfeit the Security Deposit in its entirety.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1);

doc.font('Times-Bold').text('4. INDEMNIFICATION');
doc.font('Times-Roman').text(
  '4.1. The Lessee shall indemnify, defend, and hold harmless the Lessor, its directors, officers, and agents from and against any and all claims, demands, liabilities, suits, judgments, costs, and expenses (including reasonable attorney\'s fees) arising out of or in connection with the Lessee\'s use and occupancy of the Demised Premises, including but not limited to any structural alterations made without explicit prior written consent of the Lessor.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1);

doc.font('Times-Bold').text('5. DISPUTE RESOLUTION AND JURISDICTION');
doc.font('Times-Roman').text(
  '5.1. Any dispute, controversy, or claim arising out of or relating to this Agreement shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Mumbai, Maharashtra. The language of arbitration shall be English.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(2);

doc.text('IN WITNESS WHEREOF, the Parties hereto have caused this Commercial Lease Agreement to be executed by their duly authorized representatives as of the date first above written.');
doc.moveDown(3);

// Signature section
doc.font('Times-Bold').text('For APEX REALTY HOLDINGS PVT LTD', { continued: true });
doc.text('For VANGUARD TECH SOLUTIONS', { align: 'right' });
doc.moveDown(2);
doc.font('Times-Roman').text('_________________________________', { continued: true });
doc.text('_________________________________', { align: 'right' });
doc.text('Name: Rajiv Singhania', { continued: true });
doc.text('Name: Anita Desai', { align: 'right' });
doc.text('Title: Managing Director', { continued: true });
doc.text('Title: Chief Executive Officer', { align: 'right' });

doc.end();

stream.on('finish', () => {
    console.log(`Successfully created highly realistic legal document: ${filePath}`);
});
