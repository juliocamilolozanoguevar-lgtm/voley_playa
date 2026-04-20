document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname.split('/').pop();
  const isLoginPage = path === 'login.html' || path === '';

  if (isLoginPage) {
    if (window.VoleyApi.isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
    return;
  }

  if (!window.VoleyApi.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    await window.VoleyApi.fetchJson('/health');
  } catch (error) {
    console.error('Auth check failed:', error);
    window.VoleyApi.logout();
  }
});
