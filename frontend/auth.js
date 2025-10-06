(function(){
  function isLoggedIn(){ return !!localStorage.getItem('token'); }
  function logout(){ localStorage.removeItem('token'); location.href = '/logout.html'; }
  function guardClicks(){
    document.querySelectorAll('[data-auth="protected"]').forEach(el=>{
      el.addEventListener('click', (e)=>{
        if (!isLoggedIn()){
          e.preventDefault();
          const href = el.getAttribute('href') || location.pathname;
          const next = encodeURIComponent(href);
          location.href = `/login.html?next=${next}`;
        }
      });
    });
  }
  function setAuthUI(){
    const logged = isLoggedIn();
    const login = document.getElementById('loginNav');
    const logoutBtn = document.getElementById('logoutNav');
    if (login) login.style.display = logged ? 'none' : '';
    if (logoutBtn) logoutBtn.style.display = logged ? '' : 'none';
    // Visual gating: hide certain UI blocks until logged in
    document.querySelectorAll('[data-gate="visual"]').forEach(el=>{
      el.style.display = logged ? '' : 'none';
    });
    setRoleUI();
    guardClicks();
  }
  function requireAuth(){ if (!isLoggedIn()) location.href = '/login.html'; }
  function getRole(){ return localStorage.getItem('role') || ''; }
  async function fetchMe(){
    const token = localStorage.getItem('token');
    if (!token) return null;
    try{
      const res = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.user?.role) localStorage.setItem('role', data.user.role);
      return data.user;
    }catch{ return null; }
  }
  async function setRoleUI(){
    let role = getRole();
    if (!role && isLoggedIn()) {
      const u = await fetchMe();
      role = u?.role || '';
    }
    document.querySelectorAll('[data-role]')
      .forEach(el => { el.style.display = (!role || el.getAttribute('data-role') === role) ? '' : 'none'; });
  }
  async function requireRole(role){
    if (!isLoggedIn()) return location.href = '/login.html';
    let cur = getRole();
    if (!cur){ const u = await fetchMe(); cur = u?.role || ''; }
    if (cur !== role) return location.href = '/index.html';
  }
  // Attach
  window.CaseXAuth = { isLoggedIn, logout, setAuthUI, requireAuth, guardClicks, getRole, requireRole, setRoleUI };
  document.addEventListener('DOMContentLoaded', setAuthUI);
  // Also run immediately in case script is loaded after DOMContentLoaded
  try { setAuthUI(); } catch {}
})();
