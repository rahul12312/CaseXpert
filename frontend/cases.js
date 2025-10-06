const $ = (s) => document.querySelector(s);
const outForm = $('#outForm');
const tbody = document.querySelector('#casesTable tbody');

function fmt(ts){ return new Date(ts).toLocaleString(); }

let LAWYERS = [];
let CURRENT_USER = { email: '', role: '' };
const lawyerSelect = document.getElementById('lawyer');

async function loadCases(){
  // get current user (for client filtering)
  try {
    const meRes = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') } });
    if (meRes.ok) {
      const me = await meRes.json();
      CURRENT_USER.email = me.user?.email || '';
      CURRENT_USER.role = me.user?.role || '';
    }
  } catch {}

  const [resCases, resLaw] = await Promise.all([
    fetch('/api/cases'),
    fetch('/api/lawyers')
  ]);
  const dataCases = await resCases.json();
  const dataLaw = await resLaw.json();
  LAWYERS = dataLaw.items || [];
  // populate dropdown
  if (lawyerSelect) {
    lawyerSelect.innerHTML = '<option value="">Unassigned</option>';
    for (const l of LAWYERS){
      const opt = document.createElement('option');
      opt.value = l.id; opt.textContent = `${l.name} (${(l.expertise||[]).join(', ')})`;
      lawyerSelect.appendChild(opt);
    }
  }
  let items = dataCases.items || [];
  if (CURRENT_USER.role.toLowerCase() === 'user') {
    items = items.filter(c => c.clientEmail === CURRENT_USER.email);
  }
  render(items);
}

function lawyerName(id){
  const l = LAWYERS.find(x=>x.id===id);
  return l ? l.name : '';
}

function render(items){
  tbody.innerHTML = '';
  for (const c of items){
    const tr = document.createElement('tr');
    const lname = lawyerName(c.lawyerId);
    tr.innerHTML = `<td>${c.title}</td><td>${lname||'—'}</td><td><span class="badge">${c.status}</span></td><td>${fmt(c.createdAt)}</td>
      <td class="row"><button class="btn" data-edit="${c.id}">Edit</button><button class="btn" data-del="${c.id}">Delete</button></td>`;
    tbody.appendChild(tr);
  }
}

// create
const form = document.getElementById('caseForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  // upload attachments first (if any)
  const filesInput = document.getElementById('files');
  const attachments = [];
  if (filesInput && filesInput.files && filesInput.files.length){
    for (const file of filesInput.files){
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/uploads', { method: 'POST', body: fd });
      const upData = await up.json();
      if (up.ok && upData.url) attachments.push(upData.url);
    }
  }
  // get current user email for clientEmail
  let clientEmail = '';
  try {
    const meRes = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') } });
    const me = await meRes.json();
    clientEmail = me.user?.email || '';
  } catch {}

  const payload = {
    title: document.getElementById('title').value,
    status: document.getElementById('status').value,
    description: document.getElementById('description').value,
    lawyerId: lawyerSelect ? lawyerSelect.value : '',
    clientEmail,
    attachments
  };
  const res = await fetch('/api/cases', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  const data = await res.json();
  outForm.textContent = 'Created case ' + data.id;
  loadCases();
  form.reset();
});
// table actions
tbody.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.edit){
    const id = btn.dataset.edit;
    const status = prompt('Update status (open/drafting/hearing/closed):','open');
    if (!status) return;
    await fetch('/api/cases/'+id,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status })});
    loadCases();
  }
  if (btn.dataset.del){
    const id = btn.dataset.del;
    if (!confirm('Delete case?')) return;
    await fetch('/api/cases/'+id,{ method:'DELETE' });
    loadCases();
  }
});

// search using semantic stub
$('#search').addEventListener('click', async ()=>{
  const q = $('#q').value;
  const res = await fetch('/api/search?q='+encodeURIComponent(q));
  const data = await res.json();
  let items = data.items || [];
  if (CURRENT_USER.role.toLowerCase() === 'user') {
    items = items.filter(c => c.clientEmail === CURRENT_USER.email);
  }
  render(items);
});

// summarize description
$('#ask').addEventListener('click', async ()=>{
  const txt = document.getElementById('description').value;
  const res = await fetch('/api/ml/summarize',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: txt })});
  const data = await res.json();
  outForm.textContent = 'Summary: ' + data.summary;
});

if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
loadCases();
