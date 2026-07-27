// =============================================
// Sales Page Logic
// =============================================

let saleModal;
let deleteModal;
let sales = [];
let users = [];
let products = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  initNavbar();

  // Initialize Modals
  saleModal = new bootstrap.Modal(document.getElementById('saleModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

  // Event Listeners
  document.getElementById('btn-save-sale').addEventListener('click', saveSale);
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteSale);

  // Load initial data
  Promise.all([
    loadSales(),
    loadUsersAndProducts()
  ]);
});

async function loadUsersAndProducts() {
  try {
    const [usersRes, productsRes] = await Promise.all([
      api.get('/users'),
      api.get('/products')
    ]);
    
    users = usersRes.data || [];
    products = productsRes.data || [];
    
    populateSelects();
  } catch (error) {
    console.error("Error loading dependencies:", error);
    showAlert('alert-container', 'Error al cargar usuarios o productos. No se podrán registrar ventas.');
  }
}

function populateSelects() {
  const userSelect = document.getElementById('user');
  const productSelect = document.getElementById('product');
  
  // Clear and add placeholder
  userSelect.innerHTML = '<option value="" disabled selected>Seleccione un usuario...</option>';
  productSelect.innerHTML = '<option value="" disabled selected>Seleccione un producto...</option>';
  
  users.forEach(u => {
    userSelect.innerHTML += `<option value="${u._id}">${u.name} (${u.email})</option>`;
  });
  
  products.forEach(p => {
    productSelect.innerHTML += `<option value="${p._id}" data-price="${p.price}">${p.name} - ${formatCurrency(p.price)}</option>`;
  });
}

async function loadSales() {
  const tbody = document.getElementById('sales-body');
  
  try {
    const data = await api.get('/sales');
    sales = data.data || [];
    renderSales();
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger py-4">
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
        <td colspan="7">
          <div class="empty-state">
            <i class="bi bi-cart-x"></i>
            <p>No hay ventas registradas</p>
            <button class="btn btn-primary-custom btn-sm mt-2" onclick="openSaleModal()">Registrar Venta</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = sales.map(sale => `
    <tr>
      <td>${formatDate(sale.date || sale.createdAt)}</td>
      <td>
        <i class="bi bi-person-circle text-secondary me-1"></i>
        ${sale.user ? sale.user.name : '<span class="text-danger">Usuario Eliminado</span>'}
      </td>
      <td>
        <i class="bi bi-box-seam text-secondary me-1"></i>
        ${sale.product ? sale.product.name : '<span class="text-danger">Producto Eliminado</span>'}
      </td>
      <td class="text-secondary">${formatCurrency(sale.unitPrice)}</td>
      <td><span class="badge bg-secondary">${sale.quantity}</span></td>
      <td class="fw-bold text-success">${formatCurrency(sale.totalPrice)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary-custom p-1 px-2" onclick="editSale('${sale._id}')" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger-custom p-1 px-2" onclick="confirmDelete('${sale._id}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updatePricePreview() {
  const select = document.getElementById('product');
  const option = select.options[select.selectedIndex];
  const previewDiv = document.getElementById('product-price-preview');
  
  if (option && option.dataset.price) {
    document.getElementById('preview-price-value').textContent = formatCurrency(parseFloat(option.dataset.price));
    previewDiv.style.display = 'block';
  } else {
    previewDiv.style.display = 'none';
  }
  updateTotalPreview();
}

function updateTotalPreview() {
  const select = document.getElementById('product');
  const option = select.options[select.selectedIndex];
  const quantity = parseInt(document.getElementById('quantity').value) || 0;
  
  if (option && option.dataset.price && quantity > 0) {
    const total = parseFloat(option.dataset.price) * quantity;
    document.getElementById('total-preview').textContent = formatCurrency(total);
  } else {
    document.getElementById('total-preview').textContent = '$0.00';
  }
}

function openSaleModal() {
  document.getElementById('sale-form').reset();
  document.getElementById('sale-id').value = '';
  document.getElementById('modal-title').textContent = 'Registrar Venta';
  
  // Set current user as default if possible
  const currentUser = getUser();
  if (currentUser) {
    document.getElementById('user').value = currentUser.id || currentUser._id;
  }
  
  updatePricePreview();
  clearAlerts('alert-container');
  saleModal.show();
}

function editSale(id) {
  const sale = sales.find(s => s._id === id);
  if (!sale) return;

  document.getElementById('sale-id').value = sale._id;
  
  if (sale.user && sale.user._id) {
    document.getElementById('user').value = sale.user._id;
  }
  
  if (sale.product && sale.product._id) {
    document.getElementById('product').value = sale.product._id;
  }
  
  document.getElementById('quantity').value = sale.quantity;
  
  updatePricePreview();
  
  document.getElementById('modal-title').textContent = 'Editar Venta';
  clearAlerts('alert-container');
  saleModal.show();
}

async function saveSale() {
  const form = document.getElementById('sale-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('sale-id').value;
  const saleData = {
    user: document.getElementById('user').value,
    product: document.getElementById('product').value,
    quantity: parseInt(document.getElementById('quantity').value, 10),
  };

  const btn = document.getElementById('btn-save-sale');
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  btn.disabled = true;

  try {
    if (id) {
      await api.put(`/sales/${id}`, saleData);
      showAlert('alert-container', 'Venta actualizada exitosamente', 'success');
    } else {
      await api.post('/sales', saleData);
      showAlert('alert-container', 'Venta registrada exitosamente', 'success');
    }
    
    saleModal.hide();
    loadSales();
  } catch (error) {
    let message = error.message || 'Error al guardar la venta';
    if (error.errors && Array.isArray(error.errors)) {
      message = error.errors.map(e => e.message || e).join('<br>');
    }
    alert(message); // fallback if modal is open
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
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
