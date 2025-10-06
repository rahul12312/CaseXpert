const $ = (s) => document.querySelector(s);
const cards = $('#cards');
const out = $('#out');

function card(l){
  const div = document.createElement('div');
  div.className = 'panel';
  div.innerHTML = `
    <div class="row" style="justify-content:space-between">
      <div>
        <h3 style="margin:0">${l.name}</h3>
        <div class="muted">${l.city || '—'} • ${Array.isArray(l.expertise)? l.expertise.join(', ') : ''}</div>
      </div>
      <div class="badge">⭐ ${l.rating?.toFixed ? l.rating.toFixed(1) : l.rating}</div>
    </div>
    <div class="row" style="margin-top:10px">
      <button class="btn" data-contact="${l.id}">Contact</button>
      <button class="btn" data-edit="${l.id}">Edit</button>
      <button class="btn" data-del="${l.id}">Delete</button>
    </div>`;
  return div;
}

async function load(){
  const res = await fetch('/api/lawyers');
  const data = await res.json();
  cards.innerHTML = '';
  for (const l of data.items){
    cards.appendChild(card(l));
  }
}

// add
const form = document.getElementById('lawyerForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value,
    expertise: document.getElementById('expertise').value.split(',').map(s=>s.trim()).filter(Boolean),
    city: document.getElementById('city').value,
    rating: parseFloat(document.getElementById('rating').value || '0')
  };
  const res = await fetch('/api/lawyers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json();
  out.textContent = 'Added ' + data.name;
  form.reset();
  load();
});

// card actions
cards.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.contact){
    alert('Contact flow not yet implemented.');
  }
  if (btn.dataset.edit){
    const id = btn.dataset.edit;
    const rating = parseFloat(prompt('New rating (0-5):','4.5') || '4.5');
    await fetch('/api/lawyers/'+id,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ rating })});
    load();
  }
  if (btn.dataset.del){
    const id = btn.dataset.del;
    if (!confirm('Delete lawyer?')) return;
    await fetch('/api/lawyers/'+id,{ method:'DELETE' });
    load();
  }
});

if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
load();
