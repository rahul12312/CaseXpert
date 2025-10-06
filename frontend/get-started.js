if (document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
// Initialize auth UI when arriving directly
if (window.CaseXAuth) window.CaseXAuth.setAuthUI();
