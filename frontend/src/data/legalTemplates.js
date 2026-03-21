export const legalTemplates = [
    {
        id: 'rent-agreement',
        title: "Residential Rent Agreement",
        category: "Agreements",
        authority: "Registrar / Notary",
        description: "Standard 11-month rental agreement for residential property.",
        content: `RENT AGREEMENT

This Rent Agreement is made on this [DAY] day of [MONTH], [YEAR] at [CITY], between:

[LANDLORD NAME], s/o [LANDLORD FATHER NAME], r/o [LANDLORD ADDRESS] (hereinafter called the "LESSOR", which expression shall include his heirs, successors, and assigns) of the One Part;

AND

[TENANT NAME], s/o [TENANT FATHER NAME], r/o [TENANT ADDRESS] (hereinafter called the "LESSEE", which expression shall include his heirs, successors, and assigns) of the Other Part.

WHEREAS the Lessor is the absolute owner of the property situated at [PROPERTY ADDRESS] (hereinafter referred to as the "Demised Premises").

AND WHEREAS the Lessee has requested the Lessor to grant the lease of the said premises for residential purposes, and the Lessor has agreed to the same on the following terms and conditions:

1. DURATION: The tenancy shall be for a period of 11 months commencing from [START DATE] and ending on [END DATE].
2. RENT: The monthly rent shall be Rs. [RENT AMOUNT]/- (Rupees [RENT IN WORDS]), payable on or before the [DUE DATE] day of each English calendar month.
3. SECURITY DEPOSIT: The Lessee has paid a sum of Rs. [DEPOSIT AMOUNT]/- as interest-free security deposit, refundable at the time of vacating the premises.
4. MAINTENANCE: The Lessee shall pay the electricity and water charges as per actual consumption bills.
5. USE: The premises shall be used for residential purposes only by the Lessee and their immediate family.
6. NOTICE: Either party can terminate this agreement by giving [NOTICE PERIOD] month's notice in writing.

IN WITNESS WHEREOF, the parties have signed this deed on the day and year first above written.

LESSOR: __________________
LESSEE: __________________

WITNESSES:
1. __________________
2. __________________`
    },
    {
        id: 'general-affidavit',
        title: "General Affidavit",
        category: "Affidavits",
        authority: "Executive Magistrate / Notary",
        description: "General purpose affidavit for declaration of facts.",
        content: `AFFIDAVIT

I, [DEPONENT NAME], s/o [FATHER NAME], aged about [AGE] years, resident of [ADDRESS], do hereby solemnly affirm and declare as under:

1. That I am a citizen of India and residing at the above-mentioned address.
2. That [STATE THE FACT BEING DECLARED, e.g., I have lost my original mark sheet / I am changing my name].
3. That the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.

DEPONENT

VERIFICATION:
Verified at [PLACE] on this [DATE] day of [MONTH, YEAR] that the contents of the above affidavit are true and correct. No part of it is false.

DEPONENT`
    },
    {
        id: 'fir-complaint',
        title: "FIR Complaint Format",
        category: "Complaints",
        authority: "Police Station (SHO)",
        description: "Standard format to file a First Information Report (FIR).",
        content: `To,
The Station House Officer (SHO),
[NAME OF POLICE STATION],
[CITY/DISTRICT].

Subject: Complaint regarding [NATURE OF INCIDENT, e.g., Theft of Vehicle / Assault].

Sir/Madam,

I, [COMPLAINANT NAME], s/o [FATHER NAME], r/o [ADDRESS], Mobile No: [PHONE NUMBER], wish to report the following incident:

1. Date and Time of Incident: [DATE] at approx [TIME].
2. Place of Incident: [LOCATION].
3. Details of Incident:
   [DESCRIBE THE INCIDENT IN DETAIL. e.g., I had parked my motorcycle (Model, Color, Reg No) outside the market...]
4. Suspects (if any): [NAME OR DESCRIPTION OF SUSPECTS].
5. Witnesses (if any): [NAMES OF WITNESSES].

I request you to kindly register an FIR based on this complaint and take necessary legal action.

Thanking you,

Yours faithfully,

(Signature)
[COMPLAINANT NAME]
[DATE]`
    },
    {
        id: 'legal-notice',
        title: "Legal Notice (General)",
        category: "Notices",
        authority: "Advocate",
        description: "Notice to be sent by an advocate before filing a civil suit.",
        content: `LEGAL NOTICE

To,
[OPPOSITE PARTY NAME],
[ADDRESS OF OPPOSITE PARTY].

Dated: [DATE]

Sir/Madam,

Under the instructions of my client, [CLIENT NAME], r/o [CLIENT ADDRESS], I strictly inform you as follows:

1. That my client and you entered into an agreement dated [DATE] regarding [SUBJECT MATTER].
2. That my client has performed their part of the obligation by [DESCRIBE ACTION].
3. That, however, you have failed to [DESCRIBE FAILURE, e.g., pay the outstanding dues of Rs. X].
4. That despite repeated reminders, you have failed to comply.

I, therefore, call upon you through this legal notice to [DEMAND, e.g., pay the sum of Rs. X] within 15 days from the receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you entirely at your risk and cost.

Copy retained in my office for record.

[ADVOCATE NAME]
Advocate, [COURT NAME]`
    },
    {
        id: 'power-of-attorney',
        title: "General Power of Attorney",
        category: "Deeds",
        authority: "Sub-Registrar",
        description: "Authorize someone to act on your behalf.",
        content: `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that I, [PRINCIPAL NAME], s/o [FATHER NAME], r/o [ADDRESS] (hereinafter called the "Executant"), do hereby appoint, nominate, and constitute [ATTORNEY NAME], s/o [FATHER NAME], r/o [ADDRESS] (hereinafter called the "Attorney"), as my true and lawful attorney to do the following acts, deeds, and things on my behalf:

1. To manage, control, and look after my property situated at [PROPERTY ADDRESS].
2. To pay taxes, electricity bills, and water charges regarding the said property.
3. To represent me before any government authority, court, or tribunal in connection with the said property.
4. To sign, execute, and present any documents for registration required for the management of the property.

I hereby agree to ratify and confirm all acts done by my said Attorney under this Power of Attorney.

IN WITNESS WHEREOF, I have signed this deed at [PLACE] on this [DATE].

EXECUTANT: __________________
ATTORNEY: __________________

WITNESSES:
1. __________________
2. __________________`
    },
    {
        id: 'will',
        title: "Last Will and Testament",
        category: "Deeds",
        authority: "Testator / Witnesses",
        description: "Standard will format for asset distribution.",
        content: `LAST WILL AND TESTAMENT

I, [TESTATOR NAME], s/o [FATHER NAME], aged [AGE], resident of [ADDRESS], being of sound mind and memory, do hereby make this my last Will and Testament.

1. I hereby revoke all my previous Wills and Codicils.
2. I appoint [EXECUTOR NAME], r/o [ADDRESS], as the executor of this Will.
3. I bequeath my assets as follows:
   a) My immovable property situated at [PROPERTY ADDRESS] shall go to [BENEFICIARY NAME].
   b) My bank balance in Account No. [ACCOUNT NO] at [BANK NAME] shall go to [BENEFICIARY NAME].
   c) All my jewelry and personal effects shall go to [BENEFICIARY NAME].
4. Any residual property not mentioned herein shall go to [BENEFICIARY NAME].

I have signed this Will voluntarily without any coercion.

Date: [DATE]
Place: [PLACE]

TESTATOR: __________________

Signed by the above-named Testator in our presence, and we have signed as witnesses in his/her presence.

WITNESS 1: __________________ (Name & Address)
WITNESS 2: __________________ (Name & Address)`
    },
    {
        id: 'sale-agreement',
        title: "Agreement to Sell (Property)",
        category: "Agreements",
        authority: "Registrar / Notary",
        description: "Agreement for sale of immovable property.",
        content: `AGREEMENT TO SELL

This Agreement to Sell is executed at [CITY] on this [DATE] day of [MONTH, YEAR] between:

[SELLER NAME], s/o [FATHER NAME], r/o [ADDRESS] (hereinafter called the "VENDOR")
AND
[BUYER NAME], s/o [FATHER NAME], r/o [ADDRESS] (hereinafter called the "VENDEE").

WHEREAS the Vendor is the absolute owner of valid rights of the property [PROPERTY DETAILS].

AND WHEREAS the Vendor has agreed to sell and the Vendee has agreed to purchase the said property for a total consideration of Rs. [TOTAL AMOUNT].

NOW THIS AGREEMENT WITNESSETH AS UNDER:
1. The Vendor has received Rs. [ADVANCE AMOUNT] as earnest money/advance payment.
2. The balance payment of Rs. [BALANCE AMOUNT] shall be paid by the Vendee on or before [DATE].
3. The Vendor assures that the property is free from all encumbrances, mortgages, and disputes.
4. The Vendor shall execute the Sale Deed in favor of the Vendee upon receipt of full consideration.

VENDOR: __________________
VENDEE: __________________

WITNESSES:
1. __________________
2. __________________`
    },
    {
        id: 'noc',
        title: "No Objection Certificate (NOC)",
        category: "Notices",
        authority: "Various",
        description: "General NOC format.",
        content: `NO OBJECTION CERTIFICATE

TO WHOM IT MAY CONCERN

I, [NAME], s/o [FATHER NAME], owner of the property/vehicle [DETAILS], resident of [ADDRESS], do hereby declare that:

1. I have no objection if [NAME OF PERSON REQUESTING NOC], r/o [ADDRESS], uses my property/vehicle for the purpose of [PURPOSE, e.g., Company Registration / Transfer].
2. This permission is granted voluntarily and without any coercion.
3. I will not hold any claim regarding the above-mentioned purpose.

Date: [DATE]
Place: [PLACE]

(Signature)
[NAME]
[CONTACT NUMBER]`
    }
];
