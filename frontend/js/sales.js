// =============================================
// Sales Page Logic (Multi-Item)
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
    
    populateUserSelect();
  } catch (error) {
    console.error("Error loading dependencies:", error);
    showAlert('alert-container', 'Error al cargar usuarios o productos. No se podrán registrar ventas.');
  }
}

function populateUserSelect() {
  const userSelect = document.getElementById('user');
  userSelect.innerHTML = '<option value="" disabled selected>Seleccione un usuario...</option>';
  users.forEach(u => {
    userSelect.innerHTML += `<option value="${u._id}">${u.name} (${u.email})</option>`;
  });
}

function buildProductOptions(selectedId = '') {
  let html = '<option value="" disabled selected>Seleccione un producto...</option>';
  products.forEach(p => {
    const sel = p._id === selectedId ? 'selected' : '';
    html += `<option value="${p._id}" data-price="${p.price}" ${sel}>${p.name} - ${formatCurrency(p.price)}</option>`;
  });
  return html;
}

// ---- Dynamic Item Rows ----

let itemCounter = 0;

function addItemRow(productId = '', quantity = 1) {
  const container = document.getElementById('items-container');
  const index = itemCounter++;

  const row = document.createElement('div');
  row.className = 'item-row d-flex gap-2 mb-2 align-items-start';
  row.dataset.index = index;
  row.innerHTML = `
    <div class="flex-grow-1">
      <select class="form-select form-select-custom form-select-sm" data-field="product" required onchange="updateTotalPreview()">
        ${buildProductOptions(productId)}
      </select>
    </div>
    <div style="width: 100px;">
      <input type="number" class="form-control form-control-custom form-control-sm" data-field="quantity" min="1" value="${quantity}" required oninput="updateTotalPreview()">
    </div>
    <div class="d-flex align-items-center" style="padding-top: 2px;">
      <button type="button" class="btn btn-sm btn-danger-custom p-1 px-2" onclick="removeItemRow(this)" title="Quitar">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  container.appendChild(row);
  updateTotalPreview();
}

function removeItemRow(btn) {
  const container = document.getElementById('items-container');
  btn.closest('.item-row').remove();
  // Ensure at least one row remains
  if (container.children.length === 0) {
    addItemRow();
  }
  updateTotalPreview();
}

function getItemsFromForm() {
  const rows = document.querySelectorAll('#items-container .item-row');
  const items = [];
  rows.forEach(row => {
    const productSelect = row.querySelector('[data-field="product"]');
    const quantityInput = row.querySelector('[data-field="quantity"]');
    if (productSelect.value && quantityInput.value) {
      items.push({
        product: productSelect.value,
        quantity: parseInt(quantityInput.value, 10),
      });
    }
  });
  return items;
}

function updateTotalPreview() {
  const rows = document.querySelectorAll('#items-container .item-row');
  let total = 0;
  rows.forEach(row => {
    const select = row.querySelector('[data-field="product"]');
    const qtyInput = row.querySelector('[data-field="quantity"]');
    const option = select.options[select.selectedIndex];
    if (option && option.dataset.price && qtyInput.value) {
      total += parseFloat(option.dataset.price) * parseInt(qtyInput.value, 10);
    }
  });
  document.getElementById('total-preview').textContent = formatCurrency(total);
}

// ---- CRUD ----

async function loadSales() {
  const tbody = document.getElementById('sales-body');
  
  try {
    const data = await api.get('/sales');
    sales = data.data || [];
    renderSales();
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger py-4">
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
        <td colspan="5">
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

  const currentUser = getUser();
  const isAdmin = currentUser && currentUser.role === 'admin';

  tbody.innerHTML = sales.map(sale => {
    // Build items summary
    const itemsSummary = (sale.items || []).map(item => {
      const name = item.product ? item.product.name : '<span class="text-danger">Producto Eliminado</span>';
      return `<div class="d-flex justify-content-between small">
        <span><i class="bi bi-box-seam text-secondary me-1"></i>${name} × ${item.quantity}</span>
        <span class="text-secondary ms-2">${formatCurrency(item.subtotal)}</span>
      </div>`;
    }).join('');

    return `
    <tr>
      <td>${formatDate(sale.date || sale.createdAt)}</td>
      <td>
        <i class="bi bi-person-circle text-secondary me-1"></i>
        ${sale.user ? sale.user.name : '<span class="text-danger">Usuario Eliminado</span>'}
      </td>
      <td>${itemsSummary || '<span class="text-secondary">Sin productos</span>'}</td>
      <td class="fw-bold text-success">${formatCurrency(sale.totalPrice)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary-custom p-1 px-2" onclick="editSale('${sale._id}')" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          ${isAdmin ? `
          <button class="btn btn-sm btn-danger-custom p-1 px-2" onclick="confirmDelete('${sale._id}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

function openSaleModal() {
  document.getElementById('sale-form').reset();
  document.getElementById('sale-id').value = '';
  document.getElementById('modal-title').textContent = 'Registrar Venta';
  
  // Reset items container and add one empty row
  document.getElementById('items-container').innerHTML = '';
  itemCounter = 0;
  addItemRow();

  // Set current user as default if possible
  const currentUser = getUser();
  if (currentUser) {
    document.getElementById('user').value = currentUser.id || currentUser._id;
  }
  
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
  
  // Populate items
  document.getElementById('items-container').innerHTML = '';
  itemCounter = 0;
  
  if (sale.items && sale.items.length > 0) {
    sale.items.forEach(item => {
      const productId = item.product ? item.product._id : '';
      addItemRow(productId, item.quantity);
    });
  } else {
    addItemRow();
  }

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
  const items = getItemsFromForm();

  if (items.length === 0) {
    alert('Debe agregar al menos un producto a la venta.');
    return;
  }

  const saleData = {
    user: document.getElementById('user').value,
    items,
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
    alert(message);
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
