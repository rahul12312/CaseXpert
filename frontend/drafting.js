const $ = (s)=>document.querySelector(s);
const out = $('#out');
const editor = $('#editor');

const templates = {
  nda: `MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Mutual NDA is entered into on {{date}} between {{partyA}} and {{partyB}}.\n\n1. Purpose\n2. Confidential Information\n3. Obligations\n4. Term and Termination\n\nSigned by: _____________________`,
  engagement: `CLIENT ENGAGEMENT LETTER\n\nDate: {{date}}\nClient: {{partyB}}\nFirm: {{partyA}}\n\nScope of Services:\n- Advisory\n- Representation\n\nFees & Billing:\n- Hourly or Fixed\n\nSincerely,\n{{partyA}}`,
  notice: `LEGAL NOTICE\n\nDate: {{date}}\nFrom: {{partyA}}\nTo: {{partyB}}\n\nSubject: Notice of Demand\n\nDetails: ...\n\nRegards,\n{{partyA}}`
};

$('#load').addEventListener('click', ()=>{
  const key = $('#template').value;
  editor.value = templates[key] || '';
});
$('#clear').addEventListener('click', ()=> editor.value = '');

$('#apply').addEventListener('click', ()=>{
  try{
    const vars = JSON.parse($('#vars').value || '{}');
    let txt = editor.value;
    for (const [k,v] of Object.entries(vars)){
      txt = txt.replaceAll(`{{${k}}}`, String(v));
    }
    editor.value = txt;
  }catch(err){ out.textContent = 'Invalid JSON for variables.'; }
});

$('#aiImprove').addEventListener('click', async ()=>{
  const res = await fetch('/api/ml/summarize', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: editor.value })});
  const data = await res.json();
  out.textContent = 'AI Suggestion: ' + data.summary;
});

$('#download').addEventListener('click', ()=>{
  const blob = new Blob([editor.value], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'document.txt';
  a.click();
});

$('#copy').addEventListener('click', async ()=>{
  await navigator.clipboard.writeText(editor.value);
  out.textContent = 'Copied to clipboard';
});

$('#hash').addEventListener('click', async ()=>{
  const res = await fetch('/api/ml/hash', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: editor.value })});
  const data = await res.json();
  out.textContent = 'SHA-256: ' + data.hash;
});

if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
