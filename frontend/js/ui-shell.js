document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.menu-link').forEach((link) => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  document.querySelectorAll('[data-api-origin]').forEach((element) => {
    if (window.VoleyApi && window.VoleyApi.origin) {
      element.textContent = window.VoleyApi.origin;
    }
  });

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      window.VoleyApi.logout();
    });
  });

  document.querySelectorAll('[data-username]').forEach((element) => {
    element.textContent = window.VoleyApi.username || 'Administrador';
  });
});
