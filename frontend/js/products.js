// =============================================
// Products Page Logic
// =============================================

let productModal;
let deleteModal;
let products = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('admin')) return;
  initNavbar();

  // Initialize Modals
  productModal = new bootstrap.Modal(document.getElementById('productModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

  // Event Listeners
  document.getElementById('btn-save-product').addEventListener('click', saveProduct);
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteProduct);

  loadProducts();
});

async function loadProducts() {
  const tbody = document.getElementById('products-body');
  
  try {
    const data = await api.get('/products');
    products = data.data || [];
    renderProducts();
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los productos
        </td>
      </tr>
    `;
  }
}

function renderProducts() {
  const tbody = document.getElementById('products-body');
  
  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i class="bi bi-box-seam"></i>
            <p>No hay productos registrados</p>
            <button class="btn btn-primary-custom btn-sm mt-2" onclick="openProductModal()">Agregar Producto</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(product => `
    <tr>
      <td class="fw-500">${product.name}</td>
      <td>
        ${product.category ? `<span class="badge bg-dark border border-secondary text-secondary">${product.category}</span>` : '<span class="text-secondary">-</span>'}
      </td>
      <td class="fw-bold" style="color: var(--success);">${formatCurrency(product.price)}</td>
      <td>
        <span class="badge ${product.stock > 0 ? 'bg-secondary' : 'bg-danger'}">
          ${product.stock}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary-custom p-1 px-2" onclick="editProduct('${product._id}')" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger-custom p-1 px-2" onclick="confirmDelete('${product._id}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal() {
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('modal-title').textContent = 'Nuevo Producto';
  clearAlerts('alert-container');
  productModal.show();
}

function editProduct(id) {
  const product = products.find(p => p._id === id);
  if (!product) return;

  document.getElementById('product-id').value = product._id;
  document.getElementById('name').value = product.name;
  document.getElementById('price').value = product.price;
  document.getElementById('stock').value = product.stock;
  document.getElementById('category').value = product.category || '';
  document.getElementById('description').value = product.description || '';
  
  document.getElementById('modal-title').textContent = 'Editar Producto';
  clearAlerts('alert-container');
  productModal.show();
}

async function saveProduct() {
  const form = document.getElementById('product-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('product-id').value;
  const productData = {
    name: document.getElementById('name').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    stock: parseInt(document.getElementById('stock').value, 10),
    category: document.getElementById('category').value.trim(),
    description: document.getElementById('description').value.trim(),
  };

  const btn = document.getElementById('btn-save-product');
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  btn.disabled = true;

  try {
    if (id) {
      await api.put(`/products/${id}`, productData);
      showAlert('alert-container', 'Producto actualizado exitosamente', 'success');
    } else {
      await api.post('/products', productData);
      showAlert('alert-container', 'Producto creado exitosamente', 'success');
    }
    
    productModal.hide();
    loadProducts();
  } catch (error) {
    let message = error.message || 'Error al guardar el producto';
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

async function deleteProduct() {
  const id = document.getElementById('delete-id').value;
  const btn = document.getElementById('btn-confirm-delete');
  const originalText = btn.textContent;
  
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  btn.disabled = true;

  try {
    await api.delete(`/products/${id}`);
    deleteModal.hide();
    showAlert('alert-container', 'Producto eliminado exitosamente', 'success');
    loadProducts();
  } catch (error) {
    deleteModal.hide();
    showAlert('alert-container', error.message || 'Error al eliminar el producto');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
