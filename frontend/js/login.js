const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMessage');
const loginButton = document.getElementById('loginButton');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

if (loginForm) {
  // Validación visual en tiempo real
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.classList.remove('is-invalid');
        mostrarMensaje('');
      }
    });
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validación básica
    if (!username || !password) {
      usernameInput.classList.toggle('is-invalid', !username);
      passwordInput.classList.toggle('is-invalid', !password);
      mostrarMensaje('Por favor completa todos los campos.');
      return;
    }

    // Mostrar estado de carga
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Validando...';

    try {
      const response = await window.VoleyApi.login(username, password);
      if (response.status === 'ok') {
        mostrarMensaje('', 'success');
        loginButton.innerHTML = '<i class="fas fa-check me-2"></i>¡Bienvenido!';
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);
        return;
      }
      mostrarMensaje(response.message || 'Credenciales incorrectas.', 'error');
    } catch (error) {
      console.error('Error de login:', error);
      mostrarMensaje('❌ ' + (error.message || 'No se pudo conectar con el backend. Verifica que el servidor está activo.'), 'error');
    } finally {
      if (loginButton.disabled) {
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Ingresar al sistema';
      }
    }
  });
}

function mostrarMensaje(message, type = 'error') {
  if (!errorMsg) return;
  
  if (!message) {
    errorMsg.textContent = '';
    errorMsg.classList.add('d-none');
    return;
  }
  
  errorMsg.textContent = message;
  errorMsg.className = 'login-error';
  if (type === 'success') {
    errorMsg.style.borderColor = '#28a745';
    errorMsg.style.backgroundColor = '#e8f5e9';
    errorMsg.style.color = '#28a745';
  } else {
    errorMsg.style.borderColor = '#dc3545';
    errorMsg.style.backgroundColor = '#fff5f5';
    errorMsg.style.color = '#dc3545';
  }
  errorMsg.classList.remove('d-none');
}

// Enfoque automático al usuario cuando carga la página
window.addEventListener('load', () => {
  usernameInput?.focus();
});

