// =============================================
// Store Page Logic
// =============================================

let products = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('customer')) return;
  initNavbar();
  loadProducts();
});

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  
  try {
    const data = await api.get('/products');
    products = data.data || [];
    renderProducts();
  } catch (error) {
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="bi bi-exclamation-triangle display-4"></i>
        <p class="mt-3">Error al cargar el catálogo de productos.</p>
      </div>
    `;
  }
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  
  const availableProducts = products.filter(p => p.stock > 0);

  if (availableProducts.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="empty-state">
          <i class="bi bi-box2"></i>
          <p>No hay productos disponibles en este momento.</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = availableProducts.map(product => `
    <div class="col-md-6 col-lg-4 col-xl-3">
      <div class="card h-100 card-custom product-card border-0 shadow-sm">
        <div class="card-img-top bg-dark d-flex align-items-center justify-content-center p-4 border-bottom border-secondary" style="height: 180px;">
          <i class="bi bi-image text-secondary" style="font-size: 4rem;"></i>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0 fw-bold">${product.name}</h5>
            <span class="badge bg-primary rounded-pill">${product.category}</span>
          </div>
          <p class="card-text text-secondary small flex-grow-1">${product.description || 'Sin descripción'}</p>
          <div class="d-flex justify-content-between align-items-end mt-3">
            <div>
              <span class="d-block text-secondary small">Precio</span>
              <span class="fs-5 fw-bold text-success">${formatCurrency(product.price)}</span>
            </div>
            <button class="btn btn-primary-custom btn-sm" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">
              <i class="bi bi-cart-plus"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(id, name, price) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const existingItem = cart.find(item => item.product === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      product: id,
      name: name,
      price: price,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showAlert('alert-container', `¡${name} agregado al carrito!`, 'success');
}
