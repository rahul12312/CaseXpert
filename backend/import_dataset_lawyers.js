const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Lawyer = require("./models/Lawyer");
const Document = require("./models/Document");
const connectMongoDB = require("./config/mongodb");

const lawyersData = [
  {
    "fullName": "Adv. Aarav Deshmukh",
    "gender": "Male",
    "dob": "1986-12-27",
    "email": "aarav.deshmukh@example.com",
    "phone": "9721799422",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 18,
    "specialization": "Cyber Law",
    "enrollmentNumber": "DE-2020-10001",
    "enrollmentDate": "2020-06-02",
    "stateBarCouncil": "Delhi",
    "consultationFee": 750,
    "languages": ["English", "Hindi"],
    "rating": 4.3,
    "reviews": 355,
    "practiceCourt": "New Delhi District Court",
    "firm": "Deshmukh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_01_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_01_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_01_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Vivaan Kulkarni",
    "gender": "Male",
    "dob": "1997-10-16",
    "email": "vivaan.kulkarni@example.com",
    "phone": "9892743691",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 8,
    "specialization": "Labour Law",
    "enrollmentNumber": "DE-2018-10002",
    "enrollmentDate": "2018-09-06",
    "stateBarCouncil": "Delhi",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.4,
    "reviews": 132,
    "practiceCourt": "New Delhi District Court",
    "firm": "Kulkarni Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_02_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_02_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_02_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Aditya Sharma",
    "gender": "Male",
    "dob": "1987-03-09",
    "email": "aditya.sharma@example.com",
    "phone": "9142378591",
    "state": "Karnataka",
    "city": "Bengaluru",
    "experience": 14,
    "specialization": "Corporate Law",
    "enrollmentNumber": "KA-2018-10003",
    "enrollmentDate": "2018-06-15",
    "stateBarCouncil": "Karnataka",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.4,
    "reviews": 112,
    "practiceCourt": "Bengaluru District Court",
    "firm": "Sharma Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_03_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_03_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_03_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Arjun Deshmukh",
    "gender": "Male",
    "dob": "1985-10-07",
    "email": "arjun.deshmukh@example.com",
    "phone": "9421052808",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 20,
    "specialization": "Property Law",
    "enrollmentNumber": "GU-2022-10004",
    "enrollmentDate": "2022-09-21",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 750,
    "languages": ["English", "Hindi"],
    "rating": 4.5,
    "reviews": 196,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Deshmukh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_04_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_04_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_04_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Rohan Mehta",
    "gender": "Male",
    "dob": "1981-12-23",
    "email": "rohan.mehta@example.com",
    "phone": "9945523180",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 10,
    "specialization": "Property Law",
    "enrollmentNumber": "TA-2020-10005",
    "enrollmentDate": "2020-08-03",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 500,
    "languages": ["English", "Hindi"],
    "rating": 4.5,
    "reviews": 69,
    "practiceCourt": "Chennai District Court",
    "firm": "Mehta Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_05_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_05_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_05_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Rahul Jain",
    "gender": "Male",
    "dob": "1985-10-10",
    "email": "rahul.jain@example.com",
    "phone": "9962606835",
    "state": "Karnataka",
    "city": "Bengaluru",
    "experience": 13,
    "specialization": "Property Law",
    "enrollmentNumber": "KA-2022-10006",
    "enrollmentDate": "2022-08-01",
    "stateBarCouncil": "Karnataka",
    "consultationFee": 750,
    "languages": ["English", "Hindi"],
    "rating": 4.2,
    "reviews": 463,
    "practiceCourt": "Bengaluru District Court",
    "firm": "Jain Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_06_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_06_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_06_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Neha Joshi",
    "gender": "Female",
    "dob": "1982-09-23",
    "email": "neha.joshi@example.com",
    "phone": "9676457875",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 13,
    "specialization": "Property Law",
    "enrollmentNumber": "TA-2021-10007",
    "enrollmentDate": "2021-03-19",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 2000,
    "languages": ["English", "Hindi"],
    "rating": 4.1,
    "reviews": 221,
    "practiceCourt": "Chennai District Court",
    "firm": "Joshi Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_07_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_07_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_07_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Priya Singh",
    "gender": "Female",
    "dob": "1993-02-11",
    "email": "priya.singh@example.com",
    "phone": "9302234248",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 9,
    "specialization": "Property Law",
    "enrollmentNumber": "GU-2017-10008",
    "enrollmentDate": "2017-03-25",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.4,
    "reviews": 297,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Singh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_08_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_08_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_08_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Sneha Jain",
    "gender": "Female",
    "dob": "1992-04-16",
    "email": "sneha.jain@example.com",
    "phone": "9758895261",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 19,
    "specialization": "Property Law",
    "enrollmentNumber": "GU-2016-10009",
    "enrollmentDate": "2016-11-08",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 500,
    "languages": ["English", "Hindi"],
    "rating": 4.2,
    "reviews": 351,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Jain Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_09_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_09_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_09_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Ananya Kulkarni",
    "gender": "Female",
    "dob": "1981-02-28",
    "email": "ananya.kulkarni@example.com",
    "phone": "9811967460",
    "state": "Maharashtra",
    "city": "Pune",
    "experience": 20,
    "specialization": "Cyber Law",
    "enrollmentNumber": "MA-2024-10010",
    "enrollmentDate": "2024-08-27",
    "stateBarCouncil": "Maharashtra",
    "consultationFee": 750,
    "languages": ["English", "Hindi"],
    "rating": 4.7,
    "reviews": 286,
    "practiceCourt": "Pune District Court",
    "firm": "Kulkarni Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_10_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_10_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_10_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Karan Verma",
    "gender": "Male",
    "dob": "1979-08-28",
    "email": "karan.verma@example.com",
    "phone": "9302442372",
    "state": "Karnataka",
    "city": "Bengaluru",
    "experience": 8,
    "specialization": "Tax Law",
    "enrollmentNumber": "KA-2010-10011",
    "enrollmentDate": "2010-03-03",
    "stateBarCouncil": "Karnataka",
    "consultationFee": 750,
    "languages": ["English", "Hindi"],
    "rating": 4.5,
    "reviews": 487,
    "practiceCourt": "Bengaluru District Court",
    "firm": "Verma Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_11_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_11_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_11_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Nikhil Patel",
    "gender": "Male",
    "dob": "1996-02-27",
    "email": "nikhil.patel@example.com",
    "phone": "9179039890",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 20,
    "specialization": "Corporate Law",
    "enrollmentNumber": "DE-2013-10012",
    "enrollmentDate": "2013-09-03",
    "stateBarCouncil": "Delhi",
    "consultationFee": 500,
    "languages": ["English", "Hindi"],
    "rating": 4.6,
    "reviews": 97,
    "practiceCourt": "New Delhi District Court",
    "firm": "Patel Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_12_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_12_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_12_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Sanjay Deshmukh",
    "gender": "Male",
    "dob": "1991-11-26",
    "email": "sanjay.deshmukh@example.com",
    "phone": "9936949122",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 12,
    "specialization": "Tax Law",
    "enrollmentNumber": "TA-2024-10013",
    "enrollmentDate": "2024-10-09",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.1,
    "reviews": 237,
    "practiceCourt": "Chennai District Court",
    "firm": "Deshmukh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_13_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_13_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_13_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Meera Gupta",
    "gender": "Female",
    "dob": "1980-03-13",
    "email": "meera.gupta@example.com",
    "phone": "9833853882",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 9,
    "specialization": "Property Law",
    "enrollmentNumber": "DE-2024-10014",
    "enrollmentDate": "2024-08-28",
    "stateBarCouncil": "Delhi",
    "consultationFee": 2000,
    "languages": ["English", "Hindi"],
    "rating": 4.3,
    "reviews": 132,
    "practiceCourt": "New Delhi District Court",
    "firm": "Gupta Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_14_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_14_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_14_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Kavita Gupta",
    "gender": "Female",
    "dob": "1994-11-12",
    "email": "kavita.gupta@example.com",
    "phone": "9311692807",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 13,
    "specialization": "Criminal Law",
    "enrollmentNumber": "DE-2011-10015",
    "enrollmentDate": "2011-01-20",
    "stateBarCouncil": "Delhi",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.9,
    "reviews": 455,
    "practiceCourt": "New Delhi District Court",
    "firm": "Gupta Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_15_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_15_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_15_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Aditi Kulkarni",
    "gender": "Female",
    "dob": "1981-07-12",
    "email": "aditi.kulkarni@example.com",
    "phone": "9509824865",
    "state": "Karnataka",
    "city": "Bengaluru",
    "experience": 15,
    "specialization": "Tax Law",
    "enrollmentNumber": "KA-2016-10016",
    "enrollmentDate": "2016-11-22",
    "stateBarCouncil": "Karnataka",
    "consultationFee": 500,
    "languages": ["English", "Hindi"],
    "rating": 4.6,
    "reviews": 437,
    "practiceCourt": "Bengaluru District Court",
    "firm": "Kulkarni Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_16_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_16_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_16_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Ishaan Deshmukh",
    "gender": "Male",
    "dob": "1989-08-05",
    "email": "ishaan.deshmukh@example.com",
    "phone": "9943192339",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 20,
    "specialization": "Cyber Law",
    "enrollmentNumber": "GU-2011-10017",
    "enrollmentDate": "2011-04-24",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.3,
    "reviews": 273,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Deshmukh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_17_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_17_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_17_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Manish Patel",
    "gender": "Male",
    "dob": "1986-08-03",
    "email": "manish.patel@example.com",
    "phone": "9596816985",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 20,
    "specialization": "Property Law",
    "enrollmentNumber": "DE-2015-10018",
    "enrollmentDate": "2015-09-12",
    "stateBarCouncil": "Delhi",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.1,
    "reviews": 227,
    "practiceCourt": "New Delhi District Court",
    "firm": "Patel Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_18_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_18_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_18_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Pooja Mehta",
    "gender": "Female",
    "dob": "1990-07-25",
    "email": "pooja.mehta@example.com",
    "phone": "9645318502",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 10,
    "specialization": "Tax Law",
    "enrollmentNumber": "TA-2024-10019",
    "enrollmentDate": "2024-09-06",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.0,
    "reviews": 420,
    "practiceCourt": "Chennai District Court",
    "firm": "Mehta Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_19_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_19_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_19_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Sakshi Joshi",
    "gender": "Female",
    "dob": "1987-06-05",
    "email": "sakshi.joshi@example.com",
    "phone": "9727378582",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 14,
    "specialization": "Cyber Law",
    "enrollmentNumber": "GU-2017-10020",
    "enrollmentDate": "2017-08-28",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.6,
    "reviews": 114,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Joshi Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_20_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_20_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_20_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Ritika Kulkarni",
    "gender": "Female",
    "dob": "1995-01-11",
    "email": "ritika.kulkarni@example.com",
    "phone": "9674122597",
    "state": "Karnataka",
    "city": "Bengaluru",
    "experience": 4,
    "specialization": "Criminal Law",
    "enrollmentNumber": "KA-2022-10021",
    "enrollmentDate": "2022-01-07",
    "stateBarCouncil": "Karnataka",
    "consultationFee": 750,
    "languages": ["English", "Hindi"],
    "rating": 4.7,
    "reviews": 166,
    "practiceCourt": "Bengaluru District Court",
    "firm": "Kulkarni Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_21_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_21_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_21_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Ankit Deshmukh",
    "gender": "Male",
    "dob": "1994-02-25",
    "email": "ankit.deshmukh@example.com",
    "phone": "9715160273",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 12,
    "specialization": "Criminal Law",
    "enrollmentNumber": "GU-2024-10022",
    "enrollmentDate": "2024-04-18",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.5,
    "reviews": 72,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Deshmukh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_22_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_22_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_22_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Vikas Singh",
    "gender": "Male",
    "dob": "1983-02-25",
    "email": "vikas.singh@example.com",
    "phone": "9653220319",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 11,
    "specialization": "Family Law",
    "enrollmentNumber": "TA-2018-10023",
    "enrollmentDate": "2018-10-04",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.4,
    "reviews": 26,
    "practiceCourt": "Chennai District Court",
    "firm": "Singh Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_23_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_23_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_23_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Deepak Verma",
    "gender": "Male",
    "dob": "1990-03-02",
    "email": "deepak.verma@example.com",
    "phone": "9585937057",
    "state": "Maharashtra",
    "city": "Pune",
    "experience": 8,
    "specialization": "Family Law",
    "enrollmentNumber": "MA-2023-10024",
    "enrollmentDate": "2023-11-16",
    "stateBarCouncil": "Maharashtra",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.7,
    "reviews": 33,
    "practiceCourt": "Pune District Court",
    "firm": "Verma Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_24_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_24_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_24_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Harsh Kulkarni",
    "gender": "Male",
    "dob": "1984-02-26",
    "email": "harsh.kulkarni@example.com",
    "phone": "9283210309",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 4,
    "specialization": "Family Law",
    "enrollmentNumber": "GU-2012-10025",
    "enrollmentDate": "2012-07-28",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 2000,
    "languages": ["English", "Hindi"],
    "rating": 4.4,
    "reviews": 439,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Kulkarni Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_25_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_25_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_25_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Yash Gupta",
    "gender": "Male",
    "dob": "1995-01-04",
    "email": "yash.gupta@example.com",
    "phone": "9863730531",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "experience": 19,
    "specialization": "Tax Law",
    "enrollmentNumber": "GU-2021-10026",
    "enrollmentDate": "2021-10-03",
    "stateBarCouncil": "Gujarat",
    "consultationFee": 2000,
    "languages": ["English", "Hindi"],
    "rating": 4.5,
    "reviews": 287,
    "practiceCourt": "Ahmedabad District Court",
    "firm": "Gupta Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_26_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_26_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_26_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Suresh Verma",
    "gender": "Male",
    "dob": "1989-04-07",
    "email": "suresh.verma@example.com",
    "phone": "9687314455",
    "state": "Delhi",
    "city": "New Delhi",
    "experience": 2,
    "specialization": "Property Law",
    "enrollmentNumber": "DE-2010-10027",
    "enrollmentDate": "2010-04-06",
    "stateBarCouncil": "Delhi",
    "consultationFee": 1500,
    "languages": ["English", "Hindi"],
    "rating": 4.6,
    "reviews": 361,
    "practiceCourt": "New Delhi District Court",
    "firm": "Verma Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_27_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_27_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_27_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Ritu Jain",
    "gender": "Female",
    "dob": "1983-09-11",
    "email": "ritu.jain@example.com",
    "phone": "9924229849",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 3,
    "specialization": "Cyber Law",
    "enrollmentNumber": "TA-2017-10028",
    "enrollmentDate": "2017-06-27",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 500,
    "languages": ["English", "Hindi"],
    "rating": 4.2,
    "reviews": 390,
    "practiceCourt": "Chennai District Court",
    "firm": "Jain Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_28_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_28_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_28_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Naina Kulkarni",
    "gender": "Female",
    "dob": "1990-10-09",
    "email": "naina.kulkarni@example.com",
    "phone": "9990301461",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 11,
    "specialization": "Labour Law",
    "enrollmentNumber": "TA-2010-10029",
    "enrollmentDate": "2010-11-11",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.6,
    "reviews": 275,
    "practiceCourt": "Chennai District Court",
    "firm": "Kulkarni Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_29_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_29_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_29_SAMPLE.pdf" }
    ]
  },
  {
    "fullName": "Adv. Aman Patel",
    "gender": "Male",
    "dob": "1997-10-11",
    "email": "aman.patel@example.com",
    "phone": "9878548788",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "experience": 15,
    "specialization": "Corporate Law",
    "enrollmentNumber": "TA-2017-10030",
    "enrollmentDate": "2017-01-22",
    "stateBarCouncil": "Tamil Nadu",
    "consultationFee": 1000,
    "languages": ["English", "Hindi"],
    "rating": 4.5,
    "reviews": 95,
    "practiceCourt": "Chennai District Court",
    "firm": "Patel Legal Associates",
    "documents": [
      { "type": "Government ID", "fileName": "government_id_30_SAMPLE.pdf" },
      { "type": "Bar Registration Certificate", "fileName": "bar_certificate_30_SAMPLE.pdf" },
      { "type": "Law Degree Certificate", "fileName": "llb_degree_30_SAMPLE.pdf" }
    ]
  }
];

const importLawyers = async () => {
  try {
    await connectMongoDB();
    
    for (let data of lawyersData) {
      // 1. Create or Update User
      let user = await User.findOne({ email: data.email });
      
      if (!user) {
        user = new User({
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          password: "password123", // Default password
          user_type: "lawyer",
          is_verified: true,
          dob: new Date(data.dob),
          gender: data.gender,
          is_active: true
        });
        await user.save();
        console.log(`User created: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
        // Optionally update it
        user.is_verified = true;
        await user.save();
      }

      // 2. Create or Update Lawyer
      let lawyer = await Lawyer.findOne({ user: user._id });
      if (!lawyer) {
        lawyer = new Lawyer({
          user: user._id,
          specialization: data.specialization,
          experience: data.experience,
          consultation_fee: data.consultationFee,
          city: data.city,
          state: data.state,
          languages: data.languages,
          bar_council_id: data.enrollmentNumber,
          bar_council_state: data.stateBarCouncil,
          enrollment_year: new Date(data.enrollmentDate).getFullYear(),
          gender: data.gender,
          rating: data.rating,
          total_cases: data.reviews,
          verification_status: "VERIFIED",
          license_verified: true
        });
        await lawyer.save();
        console.log(`Lawyer profile created for: ${data.fullName}`);
      } else {
        console.log(`Lawyer profile already exists for: ${data.fullName}`);
        lawyer.verification_status = "VERIFIED";
        lawyer.license_verified = true;
        lawyer.bar_council_id = data.enrollmentNumber;
        await lawyer.save();
      }

      // 3. Create Documents
      if (data.documents && data.documents.length > 0) {
        for (let docData of data.documents) {
          const docExists = await Document.findOne({ user: user._id, file_name: docData.fileName });
          if (!docExists) {
            const document = new Document({
              user: user._id,
              file_name: docData.fileName,
              file_url: `/uploads/${docData.fileName}`,
              file_type: docData.type,
              uploaded_by: user._id,
              is_public: false
            });
            await document.save();
            console.log(`Document created: ${docData.fileName}`);
          } else {
            console.log(`Document already exists: ${docData.fileName}`);
          }
        }
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

importLawyers();
