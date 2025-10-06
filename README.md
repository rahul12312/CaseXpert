# CaseXpert – Full‑Stack Prototype

CaseXpert is a lightweight legal management prototype built with Node.js + Express and a static HTML/CSS/JS frontend. It demonstrates modules like cases, lawyers, role‑based dashboards, AI assistant, legal search, uploads, and an always‑available chatbot.

## Quick Start

Prerequisites: Node.js 18+

```bash
# 1) Install backend dependencies
npm install --prefix backend

# 2) Create uploads directory (for attachments)
# Windows PowerShell
powershell -NoLogo -NoProfile -Command "New-Item -ItemType Directory -Force backend/uploads | Out-Null"

# 3) Start the dev server
npm run --prefix backend dev
# If port 4000 is busy, set a custom port for this shell
# PowerShell
$env:PORT='4001'; npm run --prefix backend dev
```

Open the app:
- http://localhost:4001 (or your chosen PORT)
- Health: http://localhost:4001/api/health

## Folder Structure

```
backend/
  server.js
  package.json
  db.json                # lowdb JSON database
  uploads/               # file uploads (created at runtime)
frontend/
  index.html             # Home / marketing + chatbot
  login.html             # Login (mock) with role routing
  cases.html             # Cases dashboard
  lawyers.html           # Lawyer directory
  admin.html             # Admin panel
  lawyer.html            # Lawyer panel
  user.html              # User (client) panel
  drafting.html          # Document drafting
  get-started.html       # Onboarding
  logout.html            # Logout success page
  assets/
    css/
      styles.css         # All styles
    js/
      app.js             # Shared UI wiring for home
      chatbot.js         # Public chatbot logic
  # Other page scripts live at project root for now:
  auth.js, cases.js, lawyers.js, login.js, drafting.js,
  get-started.js, admin.js, lawyer.js, user.js
```

## Features

- **Home + Chatbot**
  - Public floating chatbot panel.
  - “Ask AI” via `/api/assistant/query`.
  - “Search Cases” via `/api/legal/search` with India default.
  - Curated topics for India: Fundamental Rights, Women Safety, Consumer Rights, Cyber Law, Property & Tenancy.
- **Auth (mock)**
  - Email‑only login returns a session token and a role. Roles: `admin`, `lawyer`, `user`.
  - After login, routing by role: admin → `/admin.html`, lawyer → `/lawyer.html`, user → `/get-started.html`.
  - Login/Logout button toggling and protected link guards.
- **Role Dashboards**
  - Admin: manage users/roles, assign cases to lawyers.
  - Lawyer: view assigned cases, update status, contact client (mailto link).
  - User: view own cases, open a new case.
- **Cases**
  - Create case with `status`, `description`, `lawyerId`, and attachments.
  - Attachments upload to `/api/uploads`; files served at `/uploads/<filename>`.
  - Server‑side filtering: users see their cases; lawyers see assigned cases; admins see all.
- **Lawyers**
  - Browse, add, update rating, delete.
- **Document Drafting**
  - Templates (NDA, Engagement Letter, Legal Notice).
  - Apply JSON variables, copy/download, hash (SHA‑256), simple AI summarize.
- **AI & Legal Search**
  - Assistant endpoint with legal‑only policy; optional Hugging Face Inference API.
  - Jurisdiction‑aware legal search proxy (India default; EU/US supported by query param).
- **Persistence**
  - LowDB JSON (`backend/db.json`). Seed users, cases, and lawyers on first run.

## Environment Variables (optional)

Create `backend/.env` (optional):

```
# Select port (fallback 4000)
PORT=4001

# Enable Hugging Face inference for the assistant
HUGGINGFACE_TOKEN=your_hf_token
HF_MODEL=google/flan-t5-base
```

If no `HUGGINGFACE_TOKEN` is provided, the assistant falls back to a rule‑based legal response.

## API Overview

- **Health**
  - `GET /api/health`
- **Auth** (mock)
  - `POST /api/auth/login { email }` → `{ token, user: { email, role } }`
  - `GET /api/me` (Authorization: `Bearer <token>`) → `{ user }`
- **Assistant**
  - `POST /api/assistant/query { query }` → `{ answer, model }` (rate‑limited, legal‑only)
- **Legal Search (proxy)**
  - `GET /api/legal/search?q=...&jurisdiction=in|eu|us` → `{ items[] }`
  - `GET /api/legal/topics` → curated topics (India)
- **Cases** (Authorization required)
  - `GET /api/cases` → role‑filtered items
  - `GET /api/cases/:id`
  - `POST /api/cases { title, status, description, clientEmail, lawyerId, attachments[] }`
  - `PATCH /api/cases/:id { ... }`
  - `DELETE /api/cases/:id`
- **Lawyers**
  - `GET /api/lawyers`
  - `POST /api/lawyers { name, expertise[], rating, city }`
  - `PATCH /api/lawyers/:id`
  - `DELETE /api/lawyers/:id`
- **Users (admin)**
  - `GET /api/users`
  - `PATCH /api/users/:id { role, lawyerId }`
- **Uploads**
  - `POST /api/uploads` (multipart form field `file`) → `{ url, filename }`

## Seed Accounts (examples)

- Admin: `admin@casexpert.app`
- Lawyer: `rahul@lawfirm.com` (mapped to lawyer `l2`)
- User: `client1@example.com`

Login with any email to create a user on the fly (role defaults to `user`).

## Security & Notes

- This prototype uses in‑memory sessions and a JSON database. For production, replace with JWT + a real database (Postgres/Mongo) and proper auth.
- File uploads are stored on disk under `backend/uploads/`. Add validation and antivirus scanning for real use.
- The assistant is constrained to legal topics, with basic rate limiting and logging to `db.json` (`logs`).
- Legal information provided is educational and not legal advice.

## Scripts

```bash
# Dev server
npm run --prefix backend dev

# Start (no watch)
npm run --prefix backend start
```

## Roadmap

- **Auth**: JWT, refresh tokens, password or OAuth, role‑based route guards.
- **DB**: Migrate to Postgres + Prisma or MongoDB + Mongoose.
- **Chatbot**: jurisdiction selector in UI; plug a legal‑tuned HF model.
- **Uploads**: file type/size validation, S3 storage.
- **UI**: move all page scripts to `frontend/assets/js/` and upgrade to a SPA later.
- **Tests**: unit/integration tests + CI.
