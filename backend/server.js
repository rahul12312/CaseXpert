import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Lightweight JSON DB (persisted)
const dbFile = path.join(__dirname, 'db.json');
const db = new Low(new JSONFile(dbFile), { cases: [], lawyers: [], users: [], logs: [] });

// Curated legal topics for chatbot quick help (India-focused, educational only)
app.get('/api/legal/topics', (req, res) => {
  const topics = [
    {
      id: 'fundamental-rights',
      title: 'Fundamental Rights (India)',
      blurb: 'Key rights under the Constitution of India and remedies under Articles 32/226.',
      sampleQuestions: [
        'What are the Fundamental Rights under the Constitution of India?',
        'How to file a writ petition in High Court or Supreme Court?'
      ],
      resources: [
        { name: 'Constitution of India – Fundamental Rights (India Code)', url: 'https://www.indiacode.nic.in/' },
        { name: 'NHRC India – Complaints', url: 'https://nhrc.nic.in/complaints' }
      ]
    },
    {
      id: 'women-safety',
      title: 'Women Safety & Protections (India)',
      blurb: 'POSH Act, Domestic Violence Act, IPC provisions, helplines and remedies.',
      sampleQuestions: [
        'What are the remedies under the Protection of Women from Domestic Violence Act, 2005?',
        'How does the POSH Act handle workplace sexual harassment?'
      ],
      resources: [
        { name: 'NCW India', url: 'https://ncw.nic.in/' },
        { name: 'POSH Act, 2013 (India Code)', url: 'https://www.indiacode.nic.in/' }
      ]
    },
    {
      id: 'legal-acts',
      title: 'Acts, Statutes, and Codes (India)',
      blurb: 'How to find Acts/Rules on India Code and eCourts services.',
      sampleQuestions: [
        'How do I find the text of a specific Indian Act?',
        'Difference between an Act, Rule, and Notification?'
      ],
      resources: [
        { name: 'India Code – Repository of Acts', url: 'https://www.indiacode.nic.in/' },
        { name: 'eCourts Services', url: 'https://ecourts.gov.in/services' }
      ]
    },
    {
      id: 'consumer-rights',
      title: 'Consumer Rights (India)',
      blurb: 'Consumer Protection Act, 2019 and filing complaints on CPGRAMS/NCH.',
      sampleQuestions: [
        'How to file a consumer complaint under the Consumer Protection Act, 2019?',
        'What are unfair trade practices under Indian law?'
      ],
      resources: [
        { name: 'National Consumer Helpline (NCH)', url: 'https://consumerhelpline.gov.in/' },
        { name: 'Consumer Protection Act, 2019 (India Code)', url: 'https://www.indiacode.nic.in/' }
      ]
    },
    {
      id: 'cyber-law',
      title: 'Cyber Law & Online Safety (India)',
      blurb: 'IT Act, 2000 and cybercrime reporting portal.',
      sampleQuestions: [
        'How to report cybercrime incidents in India?',
        'What are offences under the IT Act, 2000?'
      ],
      resources: [
        { name: 'Indian Cybercrime Reporting Portal', url: 'https://cybercrime.gov.in/' },
        { name: 'IT Act, 2000 (India Code)', url: 'https://www.indiacode.nic.in/' }
      ]
    },
    {
      id: 'property-law',
      title: 'Property & Tenancy (India)',
      blurb: 'Tenancy rights (state-specific), registration, and stamp duty basics.',
      sampleQuestions: [
        'What are common tenant rights under rent control laws?',
        'What documents are required for a property sale/registration?'
      ],
      resources: [
        { name: 'DORIS/State Registration portals', url: 'https://www.india.gov.in/topics/law-justice/registration' },
        { name: 'eStamp (SHCIL)', url: 'https://www.shcilestamp.com/' }
      ]
    }
  ];
  res.json({ topics });
});
await db.read();
db.data ||= { cases: [], lawyers: [], users: [] };

// Session storage (in-memory tokens)
const sessions = new Map();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve frontend statically
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));
// Static uploads dir
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'CaseXpert API', time: new Date().toISOString() });
});

// Mock auth with roles
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  // find user by email or create as standard user
  let user = (db.data.users || []).find(u => u.email === email);
  if (!user) {
    user = { id: uuid(), email, name: email.split('@')[0], role: 'user' };
    db.data.users.push(user);
    db.write();
  }
  const token = uuid();
  sessions.set(token, { email: user.email, role: user.role, createdAt: Date.now() });
  res.json({ token, user });
});

// Current user info
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const sess = sessions.get(token);
  if (!sess) return res.status(401).json({ error: 'unauthorized' });
  const user = db.data.users.find(u => u.email === sess.email);
  res.json({ user });
});

// Seed database on first run
if ((db.data.lawyers || []).length === 0) {
  db.data.lawyers = [
    { id: 'l1', name: 'Ananya Sharma', expertise: ['Civil', 'Family'], rating: 4.7, city: 'Pune' },
    { id: 'l2', name: 'Rahul Verma', expertise: ['Criminal', 'Cyber'], rating: 4.5, city: 'Delhi' },
    { id: 'l3', name: 'Aisha Khan', expertise: ['Corporate', 'IP'], rating: 4.8, city: 'Mumbai' }
  ];
}
if ((db.data.cases || []).length === 0) {
  db.data.cases = [
    { id: 'c1', title: 'Acme vs. Doe', status: 'open', description: 'Contract dispute regarding delivery terms.', clientEmail: 'client1@example.com', lawyerId: 'l1', attachments: [], createdAt: Date.now() - 86400000 },
    { id: 'c2', title: 'State vs. Ravi', status: 'hearing', description: 'Criminal case with cyber evidence review.', clientEmail: 'client2@example.com', lawyerId: 'l2', attachments: [], createdAt: Date.now() - 43200000 },
    { id: 'c3', title: 'Aisha Divorce Petition', status: 'drafting', description: 'Family law case regarding mutual consent.', clientEmail: 'client3@example.com', lawyerId: 'l3', attachments: [], createdAt: Date.now() - 10000000 }
  ];
}
await db.write();

// Seed users (admin, lawyer, user) if empty
if ((db.data.users || []).length === 0) {
  db.data.users = [
    { id: 'u-admin', email: 'admin@casexpert.app', name: 'Admin', role: 'admin' },
    { id: 'u-lawyer1', email: 'rahul@lawfirm.com', name: 'Rahul Verma', role: 'lawyer', lawyerId: 'l2' },
    { id: 'u-user1', email: 'client1@example.com', name: 'Client One', role: 'user' }
  ];
  await db.write();
}

// ---------- ML & AI endpoints (Assistant) ----------
// Legal-only assistant: if HUGGINGFACE_TOKEN is set, use HF Inference API; otherwise, use rule-based fallback.
app.post('/api/assistant/query', async (req, res) => {
  // simple IP rate-limit: 20 req / 5 minutes
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  globalThis.__rate = globalThis.__rate || new Map();
  const now = Date.now();
  const windowMs = 5*60*1000;
  const maxReq = 20;
  const list = globalThis.__rate.get(ip) || [];
  const recent = list.filter(t => now - t < windowMs);
  if (recent.length >= maxReq) return res.status(429).json({ error: 'rate_limited' });
  recent.push(now); globalThis.__rate.set(ip, recent);

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query is required' });

  // quick legal domain check (very simple)
  const legalHints = /(law|legal|case|suit|court|petition|contract|divorce|criminal|civil|ip|trademark|copyright|limitation|appeal|bail|evidence|jurisdiction|section|act)/i;
  if (!legalHints.test(query)) {
    return res.json({
      answer: 'I can only assist with law-related questions. Please rephrase your query to be about legal topics.',
      model: 'policy-guard'
    });
  }

  const hfKey = process.env.HUGGINGFACE_TOKEN;
  if (hfKey) {
    try {
      // Using a small instruct model for responsiveness; you can swap to a legal-tuned model if available.
      const model = process.env.HF_MODEL || 'google/flan-t5-base';
      const system = 'You are CaseXpert, a legal-only assistant. Strictly answer only legal and law-related questions. If a question is non-legal, politely refuse and ask to provide a legal topic. Be concise and include disclaimers that this is not legal advice.';
      const input = `${system}\n\nQuestion: ${query}\n\nAnswer:`;
      const resp = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: input, parameters: { max_new_tokens: 180, temperature: 0.3 } })
      });
      if (!resp.ok) throw new Error(`hf_bad_status_${resp.status}`);
      const data = await resp.json();
      // HF returns array for some pipelines; normalize
      let text = '';
      if (Array.isArray(data) && data[0]?.generated_text) text = data[0].generated_text;
      else if (Array.isArray(data) && data[0]?.summary_text) text = data[0].summary_text;
      else if (typeof data === 'object' && data.generated_text) text = data.generated_text;
      if (!text) text = 'Unable to generate a response at the moment.';
      // Trim echoed prompt if present
      const answer = text.replace(input, '').trim();
      // log
      db.data.logs.push({ ts: Date.now(), ip, path: '/api/assistant/query', q: query, model });
      await db.write();
      return res.json({ answer, model });
    } catch (e) {
      // fall through to stub
    }
  }

  // Fallback rule-based
  let answer = 'This is general legal information and not legal advice. Consult a licensed lawyer for specific guidance.';
  if (/deadline|limitation|date/i.test(query)) answer = 'Limitation periods vary by matter and jurisdiction. Check the Limitation Act or local court rules.';
  if (/divorce/i.test(query)) answer = 'Typical divorce steps: petition filing, service, response, mediation/settlement, and final decree.';
  db.data.logs.push({ ts: Date.now(), ip, path: '/api/assistant/query', q: query, model: hfKey ? 'hf-fallback' : 'LLM-stub' });
  await db.write();
  res.json({ answer, model: hfKey ? 'hf-fallback' : 'LLM-stub' });
});

// Legal-BERT / LawT5 summarization (stub)
app.post('/api/ml/summarize', (req, res) => {
  const { text = '' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });
  const summary = text.length > 220 ? text.slice(0, 200) + '…' : text;
  res.json({ summary, model: 'LegalT5-stub' });
});

// SBERT-like semantic search over cases (very naive cosine over term frequency)
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.json({ items: [] });
  const toks = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const qset = new Set(toks(q));
  const score = (text) => {
    const t = new Set(toks(text));
    let inter = 0;
    for (const w of qset) if (t.has(w)) inter++;
    return inter / Math.sqrt(t.size || 1);
  };
  const items = db.data.cases
    .map(c => ({ case: c, score: score(`${c.title} ${c.description || ''}`) }))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .map(x => x.case);
  res.json({ items });
});

// Whisper STT stub
app.post('/api/ml/stt', (req, res) => {
  res.json({ text: 'Transcription placeholder', model: 'Whisper-stub' });
});

// MarianMT translate stub
app.post('/api/ml/translate', (req, res) => {
  const { text = '', target = 'en' } = req.body || {};
  res.json({ translated: text, target, model: 'MarianMT-stub' });
});

// OCR stub
app.post('/api/ml/ocr', (req, res) => {
  res.json({ text: 'OCR extraction placeholder', model: 'Tesseract-stub' });
});

// SHA-256 hashing for document integrity
app.post('/api/ml/hash', (req, res) => {
  const { content = '' } = req.body || {};
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  res.json({ algorithm: 'sha256', hash });
});

// ---------- Public Legal Info Proxy (CourtListener) ----------
// Simple proxy to avoid CORS issues from the browser
// Also supports basic jurisdiction switch
//   jurisdiction=us (default) | eu | in
app.get('/api/legal/search', async (req, res) => {
  try {
    const qRaw = (req.query.q || '').toString();
    const jurisdiction = ((req.query.jurisdiction || 'in').toString() || 'in').toLowerCase();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!qRaw) return res.json({ items: [] });

    const q = encodeURIComponent(qRaw);
    let items = [];
    if (jurisdiction === 'eu') {
      // EUR-Lex has HTML search; return a helpful link result
      const link = `https://eur-lex.europa.eu/search.html?text=${q}`;
      items = [{ title: 'EUR-Lex Search', url: link, court: 'EU', date: '', citation: '' }];
    } else if (jurisdiction === 'in') {
      const link = `https://indiankanoon.org/search/?formInput=${q}`;
      items = [{ title: 'Indian Kanoon Search', url: link, court: 'IN', date: '', citation: '' }];
    } else {
      const url = `https://www.courtlistener.com/api/rest/v3/search/?q=${q}&type=o&order_by=score%20desc&stat_Precedential=on&fields=absolute_url%2CcaseName%2Ccourt%2CdateFiled%2Cjudge%2Ccitation`;
      const r = await fetch(url, { headers: { 'User-Agent': 'CaseXpert/0.1 (edu)' } });
      const data = await r.json();
      items = (data.results || []).slice(0, 5).map(x => ({
        title: x.caseName || 'Case',
        url: x.absolute_url ? `https://www.courtlistener.com${x.absolute_url}` : undefined,
        court: x.court || '',
        date: x.dateFiled || '',
        citation: Array.isArray(x.citation) ? x.citation.join(', ') : (x.citation || '')
      }));
    }
    // log
    db.data.logs.push({ ts: Date.now(), ip, path: '/api/legal/search', q: qRaw, jurisdiction });
    await db.write();
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'proxy_failed', details: String(e) });
  }
});

// ---------- Cases CRUD ----------
app.get('/api/cases', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const sess = sessions.get(token);
  if (!sess) return res.status(401).json({ error: 'unauthorized' });
  const user = db.data.users.find(u => u.email === sess.email);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  let items = db.data.cases;
  if (user.role === 'user') {
    items = items.filter(c => c.clientEmail === user.email);
  } else if (user.role === 'lawyer') {
    const lid = user.lawyerId || '';
    items = items.filter(c => c.lawyerId === lid);
  } else {
    // admin -> all
  }
  res.json({ items });
});

app.get('/api/cases/:id', (req, res) => {
  const item = db.data.cases.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/cases', async (req, res) => {
  const id = uuid();
  const item = {
    id,
    title: req.body?.title || 'Untitled Case',
    status: req.body?.status || 'open',
    description: req.body?.description || '',
    clientEmail: req.body?.clientEmail || '',
    lawyerId: req.body?.lawyerId || '',
    attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
    createdAt: Date.now()
  };
  db.data.cases.push(item);
  await db.write();
  res.status(201).json(item);
});

app.patch('/api/cases/:id', async (req, res) => {
  const idx = db.data.cases.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.cases[idx] = { ...db.data.cases[idx], ...req.body };
  await db.write();
  res.json(db.data.cases[idx]);
});

app.delete('/api/cases/:id', async (req, res) => {
  const before = db.data.cases.length;
  db.data.cases = db.data.cases.filter(c => c.id !== req.params.id);
  if (db.data.cases.length === before) return res.status(404).json({ error: 'Not found' });
  await db.write();
  res.json({ ok: true });
});

// ---------- File Uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  }
});
const upload = multer({ storage });

app.post('/api/uploads', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  res.json({
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    originalName: req.file.originalname
  });
});

// ---------- Users (Admin) ----------
app.get('/api/users', (req, res) => {
  res.json({ items: db.data.users });
});

app.patch('/api/users/:id', async (req, res) => {
  const idx = db.data.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.users[idx] = { ...db.data.users[idx], ...req.body };
  await db.write();
  res.json(db.data.users[idx]);
});

// ---------- Lawyers CRUD ----------
app.get('/api/lawyers', (req, res) => {
  res.json({ items: db.data.lawyers });
});

app.post('/api/lawyers', async (req, res) => {
  const id = uuid();
  const item = {
    id,
    name: req.body?.name || 'Unnamed Lawyer',
    expertise: req.body?.expertise || [],
    rating: Number(req.body?.rating || 0),
    city: req.body?.city || ''
  };
  db.data.lawyers.push(item);
  await db.write();
  res.status(201).json(item);
});

app.patch('/api/lawyers/:id', async (req, res) => {
  const idx = db.data.lawyers.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.lawyers[idx] = { ...db.data.lawyers[idx], ...req.body };
  await db.write();
  res.json(db.data.lawyers[idx]);
});

app.delete('/api/lawyers/:id', async (req, res) => {
  const before = db.data.lawyers.length;
  db.data.lawyers = db.data.lawyers.filter(l => l.id !== req.params.id);
  if (db.data.lawyers.length === before) return res.status(404).json({ error: 'Not found' });
  await db.write();
  res.json({ ok: true });
});

// Fallback to frontend index.html for SPA-like routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CaseXpert API running on http://localhost:${PORT}`);
});

