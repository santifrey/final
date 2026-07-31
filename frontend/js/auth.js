// =============================================
// Auth Helpers - Token management & page guards
// =============================================

/**
 * Get the stored JWT token
 */
function getToken() {
  return sessionStorage.getItem('token');
}

/**
 * Get the stored user object
 */
function getUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Save token and user data after login/register
 */
function setAuth(token, user) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth data and redirect to login
 */
function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  window.location.href = '/login.html';
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getToken();
}

/**
 * Redirect to login if not authenticated (use on protected pages)
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Redirect to dashboard if already authenticated (use on login/register pages)
 */
function redirectIfAuth() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return true;
  }
  return false;
}

/**
 * Initialize the navbar - show/hide elements based on auth state, set active link
 */
function initNavbar() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  const navGuest = document.getElementById('nav-guest');
  const userName = document.getElementById('nav-user-name');
  const logoutBtn = document.getElementById('btn-logout');

  if (isAuthenticated() && user) {
    if (navAuth) navAuth.style.display = 'flex';
    if (navGuest) navGuest.style.display = 'none';
    if (userName) userName.textContent = user.name;
  } else {
    if (navAuth) navAuth.style.display = 'none';
    if (navGuest) navGuest.style.display = 'flex';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || href === '/' + currentPage) {
      link.classList.add('active');
    }
  });
}

/**
 * Show an alert message in a container element
 */
function showAlert(containerId, message, type = 'danger') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-${type} alert-custom alert-dismissible fade show" role="alert">
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}-fill me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Auto-dismiss success alerts
  if (type === 'success') {
    setTimeout(() => {
      const alert = container.querySelector('.alert');
      if (alert) {
        alert.classList.remove('show');
        setTimeout(() => container.innerHTML = '', 300);
      }
    }, 4000);
  }
}

/**
 * Clear alerts from a container
 */
function clearAlerts(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

/**
 * Format a number as currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Format a date string
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
