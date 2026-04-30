# CaseXpert - The Legal Assistance Platform

CaseXpert is a comprehensive, AI-powered platform designed to connect clients with legal professionals seamlessly. It offers a wide range of features aimed at making legal assistance accessible, transparent, and efficient.

## 🚀 Key Features

- **🤖 AI Legal Assistant:** Get instant, AI-driven legal insights and preliminary guidance using advanced LLM integrations (OpenAI/Gemini/Groq).
- **🎨 Premium Lawyer Dashboard:** A completely redesigned, glassmorphism-based command center for legal experts with real-time stats and active request tracking.
- **📽️ Cinematic Video Consultations:** Experience full-screen, HUD-style secure meetings with floating Picture-in-Picture technology and encrypted peer-to-peer tunnels.
- **🕒 Auto-Archiving System:** Intelligent management of consultations that automatically transitions sessions to history 1 hour after their scheduled time.
- **🌓 Adaptive Theme Support:** Full light and dark mode synchronization across the entire platform for a comfortable user experience.
- **🌍 Multilingual Support:** Accessible in English, Hindi, and Marathi, ensuring legal help is available to everyone.
- **⚖️ Lawyer Marketplace:** Advanced filtering and map-based search to find the right legal professional for any case.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS (Glassmorphism UI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB / SQLite (Hybrid Support)
- **Integrations:** Twilio Video, Zoom Meeting SDK, Groq Llama 3 API

## 📦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rahul12312/CaseXpert.git
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

Create a `.env` file in the `backend` directory and add your environment variables (refer to `backend/.env.example` for required keys):

```env
PORT=5000
DB_FILE=database/cases.sqlite
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
# Add other required API keys (Twilio, Gemini, etc.)
```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Application:**
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will typically run on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License.
