const Sale = require('../models/Sale');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Create a sale (Checkout)
// @route   POST /api/sales
// @access  Private (Admin or Customer)
const createSale = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    // User comes from the auth token
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío',
      });
    }

    let totalAmount = 0;
    const processedItems = [];

    // Verify products, stock and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.product} no encontrado`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}`,
        });
      }

      // Calculate totals
      totalAmount += product.price * item.quantity;
      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const sale = await Sale.create({
      user: userId,
      items: processedItems,
      totalAmount,
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Compra realizada exitosamente',
      data: populatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Admins see all, Customers see theirs)
const getSales = async (req, res, next) => {
  try {
    let query = {};
    
    // If not admin, only show their own sales
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const sales = await Sale.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name category');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta/Pedido no encontrado',
      });
    }

    // Check if customer is trying to access someone else's order
    if (req.user.role !== 'admin' && sale.user._id.toString() !== req.user.id) {
       return res.status(403).json({
         success: false,
         message: 'Acceso denegado',
       });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private (Admin only)
const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Venta eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

// updateSale is intentionally removed for simplicity in this ecommerce refactor,
// usually orders are not edited, they are cancelled or returned.

module.exports = {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
};
