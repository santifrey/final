# Sales Management System

Un sistema web Full Stack para la gestión de productos, ventas y usuarios. Desarrollado con Node.js, Express y MongoDB en el backend (arquitectura MVC), y HTML/JS vanilla con Bootstrap 5 en el frontend.

## Características

*   **Usuarios**: Registro, inicio de sesión (JWT) y listado. Las contraseñas se almacenan cifradas con bcrypt.
*   **Productos**: CRUD completo (Crear, Leer, Actualizar, Eliminar).
*   **Ventas**: Registro de ventas asociadas a un usuario y un producto. El precio total se calcula automáticamente basado en la cantidad y el precio del producto al momento de la venta.
*   **Seguridad**: Rutas protegidas mediante JWT. Validaciones estrictas tanto en frontend como en backend.
*   **Integridad Referencial**: No se pueden eliminar usuarios ni productos que tengan ventas asociadas.
*   **Frontend Integrado**: El frontend se sirve como archivos estáticos a través de Express, sin necesidad de servidores de desarrollo adicionales (Zero config SPA feel con páginas múltiples).

## Tecnologías Utilizadas

*   **Backend**:
    *   Node.js & Express
    *   MongoDB & Mongoose
    *   jsonwebtoken (JWT) para autenticación
    *   bcrypt para hashing de contraseñas
    *   express-validator para validación de datos de entrada
*   **Frontend**:
    *   HTML5, CSS3, JavaScript (ES6+)
    *   Bootstrap 5 (UI, Grid, Modals, Forms via CDN)
    *   Fetch API

## Requisitos Previos

*   [Node.js](https://nodejs.org/) (v16 o superior recomendado)
*   [MongoDB](https://www.mongodb.com/) (Instancia local o cluster en MongoDB Atlas)

## Instalación y Configuración Local

1.  **Clonar o descargar** este repositorio.
2.  **Instalar dependencias**:
    Abre una terminal en la carpeta `backend/` y ejecuta:
    ```bash
    cd backend
    npm install
    ```
3.  **Configurar Variables de Entorno**:
    En la carpeta `backend/`, copia el archivo `.env.example` y renómbralo a `.env`:
    ```bash
    cp .env.example .env
    ```
    Edita el archivo `.env` y asegúrate de configurar tu conexión a MongoDB y un secreto para JWT:
    ```env
    MONGODB_URI=mongodb://localhost:27017/sales_management
    JWT_SECRET=tu_secreto_super_seguro_y_largo
    PORT=5000
    ```

## Ejecución del Proyecto

Para iniciar el servidor en modo desarrollo (con recarga automática mediante nodemon):

```bash
cd backend
npm run dev
```

O para iniciar el servidor de manera estándar:

```bash
cd backend
npm start
```

El servidor iniciará la API y al mismo tiempo servirá el frontend estático.
Abre tu navegador y accede a: [http://localhost:5000](http://localhost:5000)

## Estructura del Proyecto

El backend sigue un patrón estricto MVC.

```text
final/
├── backend/
│   ├── config/          # Conexión a Base de Datos
│   ├── controllers/     # Lógica de negocio (auth, user, product, sale)
│   ├── middlewares/     # Auth (JWT), Manejo de Errores, Validaciones
│   ├── models/          # Esquemas de Mongoose
│   ├── routes/          # Definición de endpoints API
│   ├── validators/      # Reglas de express-validator
│   ├── server.js        # Punto de entrada principal
│   └── .env             # Variables de entorno
└── frontend/            # Archivos estáticos servidos por Express
    ├── index.html       # Entry/Redirect
    ├── login.html       # Login page
    ├── dashboard.html   # Panel de control
    ├── css/             # Hojas de estilo personalizadas
    └── js/              # Lógica de frontend e integraciones API
```

## Enlaces

*   **Repositorio**: [https://github.com/tu-usuario/sales-management](https://github.com/tu-usuario/sales-management) *(Sustituir con enlace real)*
*   **Despliegue**: [Enlace a producción pendiente] *(A desplegar en Render, Railway, etc.)*
