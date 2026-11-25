const express = require('express');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// User: Place Order
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const order = await Order.create({
      userId: req.user.userId,
      items,
      totalAmount,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Order failed', error: err.message });
  }
});

// User: Get My Orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Only: Get All Orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Only: Update Order Status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;