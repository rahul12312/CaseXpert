// copied from /frontend/app.js
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const dropdown = $('.dropdown');
if (dropdown) {
  $('#menuBtn').addEventListener('click', () => {
    dropdown.classList.toggle('open');
    const expanded = dropdown.classList.contains('open');
    $('#menuBtn').setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
}
document.addEventListener('click', (e) => {
  if (dropdown && !dropdown.contains(e.target)) dropdown.classList.remove('open');
});

// Year
if ($('#year')) $('#year').textContent = new Date().getFullYear();

const output = $('#output');
function show(msg) {
  if (!output) return;
  output.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
}

// Health check
async function ping() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const el = $('#health');
    if (el) el.textContent = `API: ${data.service} • OK • ${new Date(data.time).toLocaleString()}`;
  } catch (e) {
    const el = $('#health');
    if (el) el.textContent = 'API unreachable';
  }
}
ping();

// Login mock
let token = null;
const loginBtn = $('#loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = prompt('Enter email for demo login:', 'demo@casexpert.app');
    if (!email) return;
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await res.json();
    token = data.token;
    show({ login: 'success', user: data.user });
  });
}

// Assistant demo
const askBtn = document.querySelector('[data-demo="assistant"]');
if (askBtn) {
  askBtn.addEventListener('click', async () => {
    const query = prompt('Ask the AI Assistant a question:', 'What is the typical divorce process?');
    const res = await fetch('/api/assistant/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
    const data = await res.json();
    show({ query, answer: data.answer });
  });
}

// Try Assistant button
if (tryAssistant) {
  tryAssistant.addEventListener('click', () => {
    const el = document.querySelector('[data-demo="assistant"]');
    if (el) el.click();
  });
}

// Free trial
const freeTrial = $('#freeTrial');
if (freeTrial) {
  freeTrial.addEventListener('click', () => {
    alert('This is a prototype. Implement signup flow next.');
  });
}
