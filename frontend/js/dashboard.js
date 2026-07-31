// =============================================
// Dashboard Page Logic
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  initNavbar();

  // Set welcome name
  const user = getUser();
  if (user) {
    document.getElementById('welcome-name').textContent = user.name;
  }

  loadStats();
  loadRecentSales();
});

async function loadStats() {
  try {
    const [usersData, productsData, salesData] = await Promise.all([
      api.get('/users'),
      api.get('/products'),
      api.get('/sales'),
    ]);

    document.getElementById('stat-users').textContent = usersData.count || 0;
    document.getElementById('stat-products').textContent = productsData.count || 0;
    document.getElementById('stat-sales').textContent = salesData.count || 0;
  } catch (error) {
    document.getElementById('stat-users').textContent = '—';
    document.getElementById('stat-products').textContent = '—';
    document.getElementById('stat-sales').textContent = '—';
  }
}

async function loadRecentSales() {
  const tbody = document.getElementById('recent-sales-body');

  try {
    const data = await api.get('/sales');
    const sales = data.data || [];

    if (sales.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">
              <i class="bi bi-cart-x"></i>
              <p>No hay ventas registradas aún</p>
              <a href="sales.html" class="btn btn-primary-custom btn-sm mt-2">Registrar Venta</a>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Show only the last 5 sales
    const recentSales = sales.slice(0, 5);

    tbody.innerHTML = recentSales.map(sale => {
      const itemsCount = (sale.items || []).length;
      const itemsSummary = (sale.items || []).map(item => {
        const name = item.product ? item.product.name : 'N/A';
        return `${name} × ${item.quantity}`;
      }).join(', ');

      return `
      <tr>
        <td>${formatDate(sale.date || sale.createdAt)}</td>
        <td>
          <i class="bi bi-person-circle me-1 text-secondary"></i>
          ${sale.user ? sale.user.name : 'N/A'}
        </td>
        <td>
          <span class="badge bg-secondary me-1">${itemsCount}</span>
          <span class="small text-secondary">${itemsSummary}</span>
        </td>
        <td class="fw-bold" style="color: var(--success);">
          ${formatCurrency(sale.totalPrice)}
        </td>
      </tr>
    `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-3">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar las ventas
        </td>
      </tr>
    `;
  }
}
