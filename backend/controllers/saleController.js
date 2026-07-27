const Sale = require('../models/Sale');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  try {
    const { user, product, quantity } = req.body;

    // Verify user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'El usuario especificado no existe',
      });
    }

    // Verify product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'El producto especificado no existe',
      });
    }

    // Set unit price from product
    const unitPrice = existingProduct.price;

    const sale = await Sale.create({
      user,
      product,
      quantity,
      unitPrice,
    });

    // Populate references for the response
    const populatedSale = await Sale.findById(sale._id)
      .populate('user', 'name email')
      .populate('product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: populatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate('user', 'name email')
      .populate('product', 'name price')
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
      .populate('product', 'name price');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
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

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
const updateSale = async (req, res, next) => {
  try {
    const existingSale = await Sale.findById(req.params.id);
    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    const { user, product, quantity } = req.body;

    // Verify user exists if provided
    if (user) {
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'El usuario especificado no existe',
        });
      }
    }

    // Verify product exists if provided and get price
    let unitPrice = existingSale.unitPrice;
    if (product) {
      const existingProduct = await Product.findById(product);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'El producto especificado no existe',
        });
      }
      unitPrice = existingProduct.price;
    }

    // Update fields
    existingSale.user = user || existingSale.user;
    existingSale.product = product || existingSale.product;
    existingSale.quantity = quantity || existingSale.quantity;
    existingSale.unitPrice = unitPrice;

    await existingSale.save();

    const populatedSale = await Sale.findById(existingSale._id)
      .populate('user', 'name email')
      .populate('product', 'name price');

    res.status(200).json({
      success: true,
      message: 'Venta actualizada exitosamente',
      data: populatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
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

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
};
