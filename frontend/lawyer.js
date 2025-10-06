const tbody = document.querySelector('#casesTable tbody');

function fmt(ts){ return new Date(ts).toLocaleString(); }

async function load(){
  // derive lawyerId from role binding (admin seeded example links user->lawyerId)
  const meRes = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
  const me = await meRes.json();
  const lawyerId = me.user?.lawyerId || me.user?.email; // fallback
  const casesRes = await fetch('/api/cases');
  const cases = await casesRes.json();
  const mine = cases.items.filter(c=> c.lawyerId === lawyerId);
  render(mine);
}

function render(items){
  tbody.innerHTML = '';
  for (const c of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.title}</td><td>${c.clientEmail||''}</td><td>${c.status}</td>
      <td class="row"><button class="btn" data-id="${c.id}">Advance Status</button>
      <a class="btn" href="mailto:${c.clientEmail}?subject=${encodeURIComponent('Regarding your case: '+c.title)}" target="_blank">Contact Client</a></td>`;
    tbody.appendChild(tr);
  }
}

tbody.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const next = prompt('Update status to (open/drafting/hearing/closed):','hearing');
  if (!next) return;
  await fetch('/api/cases/'+id,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: next })});
  load();
});

if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
load();
