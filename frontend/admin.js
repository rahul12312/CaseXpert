const usersBody = document.querySelector('#usersTable tbody');
const casesBody = document.querySelector('#casesTable tbody');

function option(val, text, selected){
  const o = document.createElement('option');
  o.value = val; o.textContent = text; if (selected) o.selected = true; return o;
}

async function load(){
  const [usersRes, casesRes, lawyersRes] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/cases'),
    fetch('/api/lawyers')
  ]);
  const [users, cases, lawyers] = await Promise.all([
    usersRes.json(), casesRes.json(), lawyersRes.json()
  ]);
  renderUsers(users.items);
  renderCases(cases.items, lawyers.items);
}

function renderUsers(items){
  usersBody.innerHTML = '';
  for (const u of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.name||''}</td><td>${u.email}</td>
      <td>
        <select data-role="${u.id}">
          <option ${u.role==='user'?'selected':''}>user</option>
          <option ${u.role==='lawyer'?'selected':''}>lawyer</option>
          <option ${u.role==='admin'?'selected':''}>admin</option>
        </select>
      </td>
      <td><input data-lawyerid="${u.id}" value="${u.lawyerId||''}" placeholder="e.g., l2"/></td>
      <td><button class="btn" data-save="${u.id}">Save</button></td>`;
    usersBody.appendChild(tr);
  }
}

function renderCases(items, lawyers){
  casesBody.innerHTML='';
  for (const c of items){
    const tr = document.createElement('tr');
    const sel = document.createElement('select');
    sel.setAttribute('data-assign', c.id);
    for (const l of lawyers){ sel.appendChild(option(l.id, l.name, l.id===c.lawyerId)); }
    tr.innerHTML = `<td>${c.title}</td><td>${c.clientEmail||''}</td><td>${(lawyers.find(l=>l.id===c.lawyerId)||{}).name||''}</td><td>${c.status}</td>`;
    const td = document.createElement('td'); td.appendChild(sel); tr.appendChild(td);
    casesBody.appendChild(tr);
  }
}

usersBody.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button[data-save]');
  if (!btn) return;
  const id = btn.getAttribute('data-save');
  const role = usersBody.querySelector(`select[data-role="${id}"]`).value;
  const lawyerId = usersBody.querySelector(`input[data-lawyerid="${id}"]`).value;
  await fetch('/api/users/'+id,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role, lawyerId }) });
  alert('Saved user');
});

casesBody.addEventListener('change', async (e)=>{
  const sel = e.target.closest('select[data-assign]');
  if (!sel) return;
  const caseId = sel.getAttribute('data-assign');
  await fetch('/api/cases/'+caseId, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lawyerId: sel.value })});
});

if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
load();
