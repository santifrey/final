const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Load env vars
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Conectado para Seeding...'))
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Juan Perez',
    email: 'juan@test.com',
    password: 'password123',
    role: 'customer'
  }
];

const productsData = [
  {
    name: 'Laptop Pro',
    description: 'Laptop de alta gama con procesador de última generación.',
    price: 1500,
    stock: 20,
    category: 'Electrónica'
  },
  {
    name: 'Smartphone X',
    description: 'Teléfono inteligente con cámara de 108MP.',
    price: 800,
    stock: 50,
    category: 'Electrónica'
  },
  {
    name: 'Silla Ergonómica',
    description: 'Silla de oficina cómoda para largas horas de trabajo.',
    price: 250,
    stock: 15,
    category: 'Mobiliario'
  },
  {
    name: 'Monitor 4K',
    description: 'Monitor de 27 pulgadas con resolución 4K.',
    price: 400,
    stock: 30,
    category: 'Electrónica'
  },
  {
    name: 'Teclado Mecánico',
    description: 'Teclado mecánico con switches rojos.',
    price: 120,
    stock: 100,
    category: 'Accesorios'
  }
];

const importData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Sale.deleteMany();

    console.log('Datos antiguos eliminados.');

    // Insert Users
    const createdUsers = await User.create(usersData);
    console.log(`${createdUsers.length} Usuarios creados.`);

    // Insert Products
    const createdProducts = await Product.create(productsData);
    console.log(`${createdProducts.length} Productos creados.`);

    // Insert some sales randomly
    const salesData = [
      {
        user: createdUsers[1]._id, // Only customer buys
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            quantity: 1,
            unitPrice: createdProducts[0].price
          },
          {
            product: createdProducts[4]._id,
            name: createdProducts[4].name,
            quantity: 2,
            unitPrice: createdProducts[4].price
          }
        ],
        totalAmount: createdProducts[0].price * 1 + createdProducts[4].price * 2
      },
      {
        user: createdUsers[1]._id,
        items: [
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            quantity: 1,
            unitPrice: createdProducts[1].price
          }
        ],
        totalAmount: createdProducts[1].price * 1
      }
    ];

    const createdSales = await Sale.create(salesData);
    console.log(`${createdSales.length} Pedidos creados.`);

    console.log('¡Inyección de datos completada exitosamente!');
    process.exit();
  } catch (error) {
    console.error('Error inyectando datos:', error);
    process.exit(1);
  }
};

// Run the function
importData();
