const fab = document.getElementById('chatFab');
const panel = document.getElementById('chatPanel');
const closeBtn = document.getElementById('chatClose');
const bodyEl = document.getElementById('chatBody');
const input = document.getElementById('chatInput');
const askBtn = document.getElementById('chatAsk');
const searchBtn = document.getElementById('chatSearch');
let TOPICS = [];

function openPanel(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); input.focus(); }
function closePanel(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }

fab.addEventListener('click', ()=> panel.classList.contains('open') ? closePanel() : openPanel());
closeBtn.addEventListener('click', closePanel);

function push(role, text){
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  bodyEl.appendChild(div);
  bodyEl.scrollTop = bodyEl.scrollHeight;
}

function renderTopics(){
  if (!TOPICS.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg bot';
  const title = document.createElement('div');
  title.style.fontWeight = '600';
  title.textContent = 'Quick legal topics:';
  wrap.appendChild(title);
  for (const t of TOPICS){
    const cat = document.createElement('div');
    cat.style.margin = '6px 0';
    const h = document.createElement('div');
    h.textContent = t.title + ' – ' + t.blurb;
    h.style.marginBottom = '4px';
    cat.appendChild(h);
    const row = document.createElement('div');
    row.className = 'row';
    for (const q of (t.sampleQuestions||[])){
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = q;
      b.addEventListener('click', ()=>{ input.value = q; askAI(); });
      row.appendChild(b);
    }
    cat.appendChild(row);
    if (t.resources && t.resources.length){
      const links = document.createElement('div');
      links.style.marginTop = '4px';
      for (const r of t.resources){
        const a = document.createElement('a');
        a.href = r.url; a.textContent = r.name; a.target = '_blank';
        a.style.marginRight = '8px';
        links.appendChild(a);
      }
      cat.appendChild(links);
    }
    wrap.appendChild(cat);
  }
  bodyEl.appendChild(wrap);
}

async function askAI(){
  const q = input.value.trim();
  if (!q) return;
  push('user', q);
  input.value='';
  const res = await fetch('/api/assistant/query', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query: q })});
  const data = await res.json();
  push('bot', data.answer || 'No answer.');
}

async function searchLegal(){
  const q = input.value.trim();
  if (!q) return;
  push('user', `Search: ${q}`);
  input.value='';
  const res = await fetch('/api/legal/search?q='+encodeURIComponent(q));
  const data = await res.json();
  if (!data.items || !data.items.length){ push('bot', 'No results found.'); return; }
  const lines = data.items.map(i=>`• ${i.title} (${i.court}, ${i.date})\n${i.url || ''}`).join('\n\n');
  push('bot', lines);
}

askBtn.addEventListener('click', askAI);
searchBtn.addEventListener('click', searchLegal);
input.addEventListener('keydown', (e)=>{ if (e.key==='Enter') askAI(); });

// load curated topics on first open
async function loadTopics(){
  try{
    const r = await fetch('/api/legal/topics');
    const d = await r.json();
    TOPICS = d.topics || [];
    renderTopics();
  }catch{}
}

// auto-load topics on start
loadTopics();
