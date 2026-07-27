// =============================================
// Login Page Logic
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  redirectIfAuth();

  const form = document.getElementById('login-form');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnText = document.querySelector('.btn-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts('alert-container');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Client-side validation
    if (!email || !password) {
      showAlert('alert-container', 'Por favor, completa todos los campos.');
      return;
    }

    // Show loading state
    btnSpinner.classList.remove('d-none');
    btnText.textContent = 'Ingresando...';

    try {
      const data = await api.post('/auth/login', { email, password });

      setAuth(data.data.token, data.data.user);
      window.location.href = '/dashboard.html';
    } catch (error) {
      const message = error.message || 'Error al iniciar sesión';
      showAlert('alert-container', message);
    } finally {
      btnSpinner.classList.add('d-none');
      btnText.textContent = 'Iniciar Sesión';
    }
  });
});
