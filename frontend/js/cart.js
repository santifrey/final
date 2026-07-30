// =============================================
// Cart Page Logic
// =============================================

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('customer')) return;
  initNavbar();
  loadCart();
});

function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById('cart-body');
  const btnCheckout = document.getElementById('btn-checkout');
  
  if (cart.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i class="bi bi-cart-x"></i>
            <p>Tu carrito está vacío</p>
            <a href="store.html" class="btn btn-outline-primary mt-3">Ir a la tienda</a>
          </div>
        </td>
      </tr>
    `;
    btnCheckout.disabled = true;
    updateSummary();
    return;
  }

  btnCheckout.disabled = false;
  tbody.innerHTML = cart.map((item, index) => `
    <tr>
      <td class="fw-500">${item.name}</td>
      <td class="text-secondary">${formatCurrency(item.price)}</td>
      <td>
        <div class="input-group input-group-sm w-100">
          <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, -1)">-</button>
          <input type="text" class="form-control text-center bg-dark text-light border-secondary" value="${item.quantity}" readonly>
          <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
      </td>
      <td class="fw-bold text-success">${formatCurrency(item.price * item.quantity)}</td>
      <td>
        <button class="btn btn-sm btn-danger-custom p-1 px-2" onclick="removeItem(${index})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  updateSummary();
}

function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
      cart[index].quantity = 1; // Minimum 1
    }
    saveCart();
    renderCart();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('summary-total').textContent = formatCurrency(subtotal);
}

async function checkout() {
  if (cart.length === 0) return;

  const btn = document.getElementById('btn-checkout');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Procesando...';
  btn.disabled = true;

  try {
    const items = cart.map(i => ({
      product: i.product,
      quantity: i.quantity
    }));

    await api.post('/sales', { items });
    
    // Clear cart on success
    cart = [];
    saveCart();
    
    showAlert('alert-container', '¡Compra realizada con éxito! Serás redirigido a tus pedidos...', 'success');
    
    setTimeout(() => {
      window.location.href = 'my-orders.html';
    }, 2000);

  } catch (error) {
    let message = error.message || 'Error al procesar la compra';
    if (error.errors) {
      message = error.errors.map(e => e.message || e).join('<br>');
    }
    showAlert('alert-container', message);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}
