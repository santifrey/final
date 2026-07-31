// =============================================
// Users Page Logic
// =============================================

let userModal;
let deleteModal;
let users = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  initNavbar();

  // Initialize Modals
  userModal = new bootstrap.Modal(document.getElementById('userModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

  // Event Listeners
  document.getElementById('btn-save-user').addEventListener('click', saveUser);
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteUser);

  loadUsers();
});

async function loadUsers() {
  const tbody = document.getElementById('users-body');
  
  try {
    const data = await api.get('/users');
    users = data.data || [];
    renderUsers();
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los usuarios
        </td>
      </tr>
    `;
  }
}

function renderUsers() {
  const tbody = document.getElementById('users-body');
  
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <i class="bi bi-people"></i>
            <p>No hay usuarios registrados</p>
            <button class="btn btn-primary-custom btn-sm mt-2" onclick="openUserModal()">Agregar Usuario</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const currentUser = getUser();
  const isAdmin = currentUser && currentUser.role === 'admin';

  tbody.innerHTML = users.map(user => `
    <tr>
      <td class="fw-500">${user.name}</td>
      <td>${user.email}</td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary-custom p-1 px-2" onclick="editUser('${user._id}')" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          ${isAdmin ? `
          <button class="btn btn-sm btn-danger-custom p-1 px-2" onclick="confirmDelete('${user._id}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function openUserModal() {
  const currentUser = getUser();
  const isAdmin = currentUser && currentUser.role === 'admin';

  document.getElementById('user-form').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('modal-title').textContent = 'Nuevo Usuario';
  document.getElementById('password').setAttribute('required', 'required');
  document.getElementById('role').value = 'user';

  const roleFieldWrapper = document.getElementById('role-field-wrapper');
  if (isAdmin) {
    roleFieldWrapper.style.display = 'block';
  } else {
    roleFieldWrapper.style.display = 'none';
  }

  clearAlerts('alert-container');
  userModal.show();
}

function editUser(id) {
  const currentUser = getUser();
  const isAdmin = currentUser && currentUser.role === 'admin';
  const user = users.find(u => u._id === id);
  if (!user) return;

  document.getElementById('user-id').value = user._id;
  document.getElementById('name').value = user.name;
  document.getElementById('email').value = user.email;
  document.getElementById('password').value = '';
  document.getElementById('password').removeAttribute('required');
  document.getElementById('role').value = user.role || 'user';

  const roleFieldWrapper = document.getElementById('role-field-wrapper');
  roleFieldWrapper.style.display = isAdmin ? 'block' : 'none';
  
  document.getElementById('modal-title').textContent = 'Editar Usuario';
  clearAlerts('alert-container');
  userModal.show();
}

async function saveUser() {
  const form = document.getElementById('user-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('user-id').value;
  const currentUser = getUser();
  const isAdmin = currentUser && currentUser.role === 'admin';
  const userData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
  };

  if (isAdmin) {
    userData.role = document.getElementById('role').value;
  }

  const password = document.getElementById('password').value;
  if (password) {
    userData.password = password;
  }

  const btn = document.getElementById('btn-save-user');
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  btn.disabled = true;

  try {
    if (id) {
      await api.put(`/users/${id}`, userData);
      showAlert('alert-container', 'Usuario actualizado exitosamente', 'success');
    } else {
      await api.post('/users', userData);
      showAlert('alert-container', 'Usuario creado exitosamente', 'success');
    }
    
    userModal.hide();
    loadUsers();
  } catch (error) {
    let message = error.message || 'Error al guardar el usuario';
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

async function deleteUser() {
  const id = document.getElementById('delete-id').value;
  const btn = document.getElementById('btn-confirm-delete');
  const originalText = btn.textContent;
  
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  btn.disabled = true;

  try {
    await api.delete(`/users/${id}`);
    deleteModal.hide();
    showAlert('alert-container', 'Usuario eliminado exitosamente', 'success');
    loadUsers();
  } catch (error) {
    deleteModal.hide();
    showAlert('alert-container', error.message || 'Error al eliminar el usuario');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
