// =============================================
// Register Page Logic
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  redirectIfAuth();

  const form = document.getElementById('register-form');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnText = document.querySelector('.btn-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlerts('alert-container');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
      showAlert('alert-container', 'Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      showAlert('alert-container', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('alert-container', 'Las contraseñas no coinciden.');
      return;
    }

    // Show loading state
    btnSpinner.classList.remove('d-none');
    btnText.textContent = 'Creando cuenta...';

    try {
      const data = await api.post('/auth/register', { name, email, password });

      setAuth(data.data.token, data.data.user);
      window.location.href = '/dashboard.html';
    } catch (error) {
      let message = error.message || 'Error al registrar usuario';
      if (error.errors && Array.isArray(error.errors)) {
        message = error.errors.map(e => e.message || e).join('<br>');
      }
      showAlert('alert-container', message);
    } finally {
      btnSpinner.classList.add('d-none');
      btnText.textContent = 'Crear Cuenta';
    }
  });
});
