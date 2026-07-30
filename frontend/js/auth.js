// =============================================
// Auth Helpers - Token management & page guards
// =============================================

/**
 * Get the stored JWT token
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Get the stored user object
 */
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Save token and user data after login/register
 */
function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth data and redirect to login
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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
 * If requiredRole is passed, also checks the role.
 */
function requireAuth(requiredRole = null) {
  const token = getToken();
  let user = getUser();
  
  // If user exists but has no role (old session), force logout
  if (user && !user.role) {
    logout();
    return false;
  }
  
  if (!token || !user) {
    window.location.href = '/login.html';
    return false;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    // Prevent infinite loop if already on the target page
    const currentPath = window.location.pathname;
    const targetPath = user.role === 'admin' ? '/dashboard.html' : '/store.html';
    
    if (currentPath !== targetPath) {
      window.location.href = targetPath;
    }
    return false;
  }
  
  return true;
}

/**
 * Redirect to dashboard or store if already authenticated
 */
function redirectIfAuth() {
  const user = getUser();
  if (isAuthenticated() && user) {
    if (!user.role) {
      logout();
      return false;
    }
    window.location.href = user.role === 'admin' ? '/dashboard.html' : '/store.html';
    return true;
  }
  return false;
}

/**
 * Initialize the navbar - show/hide elements based on auth state and role
 */
function initNavbar() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  const navGuest = document.getElementById('nav-guest');
  const userName = document.getElementById('nav-user-name');
  const logoutBtn = document.getElementById('btn-logout');

  if (isAuthenticated() && user) {
    if (navAuth) {
      navAuth.style.display = 'flex';
      
      // Render links based on role
      if (user.role === 'admin') {
        navAuth.innerHTML = `
          <li class="nav-item">
            <a class="nav-link" href="dashboard.html"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="products.html"><i class="bi bi-box-seam me-1"></i>Inventario</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="sales.html"><i class="bi bi-cash-coin me-1"></i>Ventas</a>
          </li>
        `;
      } else {
        navAuth.innerHTML = `
          <li class="nav-item">
            <a class="nav-link" href="store.html"><i class="bi bi-shop me-1"></i>Catálogo</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="cart.html"><i class="bi bi-cart me-1"></i>Mi Carrito <span id="cart-badge" class="badge bg-danger rounded-pill ms-1 d-none">0</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="my-orders.html"><i class="bi bi-bag-check me-1"></i>Mis Compras</a>
          </li>
        `;
        // Update cart badge
        updateCartBadge();
      }
    }
    if (navGuest) navGuest.style.display = 'none';
    if (userName) userName.textContent = user.name + (user.role === 'admin' ? ' (Admin)' : '');
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

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) {
      badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  }
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
