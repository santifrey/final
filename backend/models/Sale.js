const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio'],
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio unitario no puede ser negativo'],
    },
    subtotal: {
      type: Number,
      min: [0, 'El subtotal no puede ser negativo'],
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'La venta debe tener al menos un producto',
      },
    },
    totalPrice: {
      type: Number,
      min: [0, 'El precio total no puede ser negativo'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate subtotals and total price before saving
saleSchema.pre('save', function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.quantity * item.unitPrice;
  });
  this.totalPrice = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
