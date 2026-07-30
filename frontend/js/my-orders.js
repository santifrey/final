// =============================================
// My Orders Logic (Customer)
// =============================================

let orders = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('customer')) return;
  initNavbar();
  loadOrders();
});

async function loadOrders() {
  const tbody = document.getElementById('orders-body');
  
  try {
    const data = await api.get('/sales');
    orders = data.data || [];
    renderOrders();
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar tu historial de compras
        </td>
      </tr>
    `;
  }
}

function renderOrders() {
  const tbody = document.getElementById('orders-body');
  
  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <i class="bi bi-bag-x"></i>
            <p>Aún no has realizado ninguna compra</p>
            <a href="store.html" class="btn btn-primary-custom mt-3">Ir a la tienda</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><span class="text-secondary text-monospace fw-bold">#${order._id.slice(-6).toUpperCase()}</span></td>
      <td>${formatDate(order.date || order.createdAt)}</td>
      <td>
        <ul class="list-unstyled mb-0" style="font-size: 0.9rem;">
          ${order.items.map(i => `
            <li class="mb-1">
              <span class="badge bg-dark border border-secondary text-light me-2">${i.quantity}x</span> 
              ${i.product ? i.product.name : i.name} 
              <span class="text-secondary ms-2">${formatCurrency(i.unitPrice)}</span>
            </li>
          `).join('')}
        </ul>
      </td>
      <td class="fw-bold text-success fs-5 align-middle">${formatCurrency(order.totalAmount)}</td>
    </tr>
  `).join('');
}
