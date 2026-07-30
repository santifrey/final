// =============================================
// Sales Page Logic (Admin)
// =============================================

let deleteModal;
let sales = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('admin')) return;
  initNavbar();

  // Initialize Modals
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

  // Event Listeners
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteSale);

  loadSales();
});

async function loadSales() {
  const tbody = document.getElementById('sales-body');
  
  try {
    const data = await api.get('/sales');
    sales = data.data || [];
    renderSales();
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar las ventas
        </td>
      </tr>
    `;
  }
}

function renderSales() {
  const tbody = document.getElementById('sales-body');
  
  if (sales.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i class="bi bi-cart-x"></i>
            <p>No hay ventas registradas</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = sales.map(sale => `
    <tr>
      <td><span class="text-secondary text-monospace text-sm">${sale._id.slice(-6).toUpperCase()}</span></td>
      <td>${formatDate(sale.date || sale.createdAt)}</td>
      <td>
        <i class="bi bi-person-circle text-secondary me-1"></i>
        ${sale.user ? sale.user.name : '<span class="text-danger">Usuario Eliminado</span>'}
      </td>
      <td>
        <ul class="list-unstyled mb-0" style="font-size: 0.85rem;">
          ${sale.items.map(i => `
            <li>
              <span class="badge bg-secondary me-1">${i.quantity}x</span> 
              ${i.product ? i.product.name : i.name} 
              <span class="text-secondary ms-1">${formatCurrency(i.unitPrice)}</span>
            </li>
          `).join('')}
        </ul>
      </td>
      <td class="fw-bold text-success">${formatCurrency(sale.totalAmount)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-danger-custom p-1 px-2" onclick="confirmDelete('${sale._id}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function confirmDelete(id) {
  document.getElementById('delete-id').value = id;
  deleteModal.show();
}

async function deleteSale() {
  const id = document.getElementById('delete-id').value;
  const btn = document.getElementById('btn-confirm-delete');
  const originalText = btn.textContent;
  
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  btn.disabled = true;

  try {
    await api.delete(`/sales/${id}`);
    deleteModal.hide();
    showAlert('alert-container', 'Venta eliminada exitosamente', 'success');
    loadSales();
  } catch (error) {
    deleteModal.hide();
    showAlert('alert-container', error.message || 'Error al eliminar la venta');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
