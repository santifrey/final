const Sale = require('../models/Sale');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  try {
    const { user, items } = req.body;

    // Verify user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'El usuario especificado no existe',
      });
    }

    // Verify each product exists, validate stock, and set unitPrice
    const saleItems = [];
    const productsToUpdate = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `El producto con ID ${item.product} no existe`,
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `El producto "${product.name}" no tiene stock suficiente. Stock disponible: ${product.stock}`,
        });
      }

      productsToUpdate.push({ product, quantity: item.quantity });
      saleItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const sale = await Sale.create({
      user,
      items: saleItems,
    });

    for (const { product, quantity } of productsToUpdate) {
      product.stock -= quantity;
      await product.save();
    }

    // Populate references for the response
    const populatedSale = await Sale.findById(sale._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

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
      .populate('items.product', 'name price')
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
      .populate('items.product', 'name price');

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

    const { user, items } = req.body;

    // Verify user exists if provided
    if (user) {
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'El usuario especificado no existe',
        });
      }
      existingSale.user = user;
    }

    // Verify and update items if provided
    if (items && items.length > 0) {
      const currentItems = existingSale.items || [];
      const productsToRestore = [];

      for (const currentItem of currentItems) {
        const product = await Product.findById(currentItem.product);
        if (product) {
          product.stock += currentItem.quantity;
          productsToRestore.push(product);
        }
      }

      for (const product of productsToRestore) {
        await product.save();
      }

      const saleItems = [];
      const productsToUpdate = [];
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `El producto con ID ${item.product} no existe`,
          });
        }

        if (item.quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `El producto "${product.name}" no tiene stock suficiente. Stock disponible: ${product.stock}`,
          });
        }

        productsToUpdate.push({ product, quantity: item.quantity });
        saleItems.push({
          product: item.product,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      existingSale.items = saleItems;

      await existingSale.save();

      for (const { product, quantity } of productsToUpdate) {
        product.stock -= quantity;
        await product.save();
      }
    } else {
      await existingSale.save();
    }

    const populatedSale = await Sale.findById(existingSale._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

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

    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
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
