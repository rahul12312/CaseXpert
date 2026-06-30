# CaseXpert - The Legal Assistance Platform

CaseXpert is a comprehensive, AI-powered platform designed to connect clients with legal professionals seamlessly. It offers a wide range of features aimed at making legal assistance accessible, transparent, and efficient.

## 🚀 Key Features

- **🤖 AI Legal Assistant:** Get instant, AI-driven legal insights and preliminary guidance using advanced LLM integrations (OpenAI/Gemini/Groq).
- **🎨 Premium Lawyer Dashboard:** A completely redesigned, glassmorphism-based command center for legal experts with real-time stats and active request tracking.
- **📽️ Cinematic Video Consultations:** Experience full-screen, HUD-style secure meetings with floating Picture-in-Picture technology and encrypted peer-to-peer tunnels.
- **🕒 Auto-Archiving System:** Intelligent management of consultations that automatically transitions sessions to history 1 hour after their scheduled time.
- **🌓 Adaptive Theme Support:** Full light and dark mode synchronization across the entire platform for a comfortable user experience.
- **🌍 Multilingual Support:** Accessible in English, Hindi, and Marathi, ensuring legal help is available to everyone.
- **⚖️ Lawyer Marketplace:** Advanced filtering and map-based search with real-time ratings, reviews, and success statistics to find the right legal professional for any case.
- **🔒 Secure Client & Lawyer Profiles:** Robust profile management gates to protect private information, require authentication for detailed views, and manage professional bio and license credentials.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS (Glassmorphism UI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Integrations:** Twilio Video, Zoom Meeting SDK, SendGrid Mail API, Groq Llama 3 API

## 📂 Project Structure

- `frontend/`: The React client-side web application managed with Vite.
- `backend/`: The Node/Express API server connecting to MongoDB.
- `backend/scripts/`: A dedicated folder containing utility and developer scripts (database seeders, stat generators, Twilio/Gemini integration tests, and schema migrations).

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (Atlas or local)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rahul12312/CaseXpert.git
   cd "CaseXpert - The Legal Assistance Platform"
   ```

2. **Install Backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### 1. Backend Config
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# AI APIs
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_verified_sender_email

# Twilio & Video Consultations
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_API_KEY_SID=your_twilio_api_key_sid
TWILIO_API_KEY_SECRET=your_twilio_api_key_secret
```

#### 2. Frontend Config
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Application

1. **Start the Backend API Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Application:**
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will run on `http://localhost:5173` and the backend api on `http://localhost:5000`.

## ⚙️ Development Utilities

Useful helper scripts located under `backend/scripts/`:
- **Populate Lawyer Profiles:** `node backend/scripts/populate_lawyer_profiles.js` (populates addresses, DOBs, and bar credentials).
- **Populate Lawyer Stats:** `node backend/scripts/populate_lawyer_stats.js` (populates reviews, rating averages, and cases).
- **Seed Initial Dataset:** `node backend/scripts/import_dataset_lawyers.js`.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License.
