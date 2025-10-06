const form = document.getElementById('loginForm');
const out = document.getElementById('output');
const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const nextUrl = params.get('next');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = /** @type {HTMLInputElement} */(document.getElementById('email')).value;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.user?.role) localStorage.setItem('role', data.user.role);
      out.textContent = 'Logged in as ' + (data.user?.email || email);
      // update UI immediately if available
      if (window.CaseXAuth) window.CaseXAuth.setAuthUI();
      let target = nextUrl ? decodeURIComponent(nextUrl) : '';
      if (!target) {
        const role = (data.user?.role || localStorage.getItem('role') || '').toLowerCase();
        if (role === 'admin') target = '/admin.html';
        else if (role === 'lawyer') target = '/lawyer.html';
        else target = '/get-started.html';
      }
      setTimeout(() => location.href = target, 500);
    } else {
      out.textContent = 'Login failed';
    }
  });
}

if ($('#year')) $('#year').textContent = new Date().getFullYear();
