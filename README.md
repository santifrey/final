# Gestion de Ventas

Un sistema web Full Stack para la gestión de productos, ventas y usuarios. Desarrollado con Node.js, Express y MongoDB en el backend (arquitectura MVC), y HTML/JS vanilla con Bootstrap 5 en el frontend.

## Características

*   **Usuarios**: Registro, inicio de sesión (JWT) y listado. Las contraseñas se almacenan cifradas con bcrypt.
*   **Productos**: CRUD completo (Crear, Leer, Actualizar, Eliminar).
*   **Ventas**: Registro de ventas asociadas a un usuario y un producto. El precio total se calcula automáticamente basado en la cantidad y el precio del producto al momento de la venta.
*   **Seguridad**: Rutas protegidas mediante JWT. Validaciones estrictas tanto en frontend como en backend.
*   **Integridad Referencial**: No se pueden eliminar usuarios ni productos que tengan ventas asociadas.


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

## Despliegue Paso a Paso

### 1. Frontend en Netlify

1. Crear un nuevo sitio estático en Netlify.
2. Seleccionar la carpeta `frontend` como directorio de publicación.
3. En la configuración del sitio, dejar `index.html` como archivo de entrada principal.


### 2. Backend en Render

1. Crear un nuevo servicio Web en Render.
2. Conectar el repositorio GitHub y seleccionar la carpeta `backend`.
3. Configurar el entorno de ejecución como `Node`.
4. Definir `npm start` como comando de inicio.
5. Agregar las variables de entorno necesarias:
   - `MONGODB_URI`
   - `JWT_SECRET`
6. Realizar el deploy y copiar la URL pública generada por Render para usarla enla variable API_BASE de api.js en el freontend.

### 3. Base de datos en MongoDB Atlas

1. Crear un proyecto en MongoDB Atlas.
2. Crear un cluster gratuito y configurar acceso por IP o usuario de base de datos.
3. Obtener la cadena de conexión `MONGODB_URI`.
4. Guardarla en las variables de entorno del servicio backend desplegado en Render.
5. Asegurarse de que el backend pueda conectarse usando esa URI y que el usuario configurado tenga permisos sobre la base de datos.

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
    ├── index.html       # Entrada / redirección
    ├── login.html       # Inicio de sesión
    ├── register.html    # Registro de usuarios
    ├── dashboard.html   # Panel principal
    ├── products.html    # Gestión de productos
    ├── sales.html       # Gestión de ventas
    ├── users.html       # Gestión de usuarios
    ├── css/             # Hojas de estilo personalizadas
    └── js/              # Lógica de frontend e integraciones API
```

## Enlaces

*   **Repositorio**: https://github.com/santifrey/final
*   **Despliegue**: https://finalaw2.netlify.app/
