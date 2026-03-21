# CaseXpert - The Legal Assistance Platform

CaseXpert is a comprehensive, AI-powered platform designed to connect clients with legal professionals seamlessly. It offers a wide range of features aimed at making legal assistance accessible, transparent, and efficient.

## 🚀 Key Features

- **🤖 AI Legal Assistant:** Get instant, AI-driven legal insights and preliminary guidance using advanced LLM integrations (OpenAI/Gemini/Groq).
- **🌍 Multilingual Support:** Completely accessible in multiple languages, including English, Hindi, and Marathi, breaking down language barriers for users.
- **⚖️ Lawyer Marketplace:** Easily find and connect with specialized lawyers using advanced filtering and map-based search functionality.
- **📹 Secure Video Consultations:** Schedule and attend seamless, secure video consultations directly within the platform.
- **💼 Case Tracking & Management:** Clients and lawyers can track case progress, upload documents, and manage details in a centralized dashboard.
- **📄 Document Drafting & Management:** Secure storage and automated drafting for common legal documents, affidavits, and notices.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** SQLite / Relational DB
- **Integrations:** Twilio (Video), AI Models (Gemini/OpenAI)

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
