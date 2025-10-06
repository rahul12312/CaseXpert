const tbody = document.querySelector('#casesTable tbody');
const out = document.getElementById('out');

function fmt(ts){ return new Date(ts).toLocaleString(); }

async function load(){
  const meRes = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
  const me = await meRes.json();
  const email = me.user?.email;
  const casesRes = await fetch('/api/cases');
  const cases = await casesRes.json();
  const mine = cases.items.filter(c=> c.clientEmail === email);
  tbody.innerHTML = '';
  for (const c of mine){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.title}</td><td>${c.status}</td><td>${fmt(c.createdAt)}</td>`;
    tbody.appendChild(tr);
  }
}

const form = document.getElementById('caseForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const meRes = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
  const me = await meRes.json();
  const payload = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    clientEmail: me.user?.email || ''
  };
  const res = await fetch('/api/cases', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const data = await res.json();
  out.textContent = 'Submitted ' + data.title;
  form.reset();
  load();
});

if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
load();
