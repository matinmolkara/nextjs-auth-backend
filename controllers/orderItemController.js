const OrderItem = require("../models/OrderItem");
const Order = require("../models/Order"); // برای اعتبارسنجی وجود سفارش

exports.createOrderItem = async (req, res) => {
  try {
    // اعتبارسنجی نقش مدیر (یا سطح دسترسی مورد نیاز)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, error: "Forbidden" });
    // }

    const { orderId, productId, quantity, unitPrice, totalPrice } = req.body;

    // بررسی وجود سفارش
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ success: false, error: "Order not found" });
    }

    const newOrderItem = await OrderItem.create(
      orderId,
      productId,
      quantity,
      unitPrice,
      totalPrice
    );
    res
      .status(201)
      .json({
        success: true,
        data: newOrderItem,
        message: "Order item created successfully",
      });
  } catch (error) {
    console.error("Error creating order item:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getOrderItemById = async (req, res) => {
  try {
    const orderItemId = req.params.orderItemId;
    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, error: "Order item not found" });
    }
    res.json({ success: true, data: orderItem });
  } catch (error) {
    console.error("Error fetching order item by ID:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getOrderItemsByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderItems = await OrderItem.findByOrderId(orderId);
    res.json({ success: true, data: orderItems });
  } catch (error) {
    console.error("Error fetching order items by order ID:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.updateOrderItem = async (req, res) => {
  try {
    // اعتبارسنجی نقش مدیر (یا سطح دسترسی مورد نیاز)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, error: "Forbidden" });
    // }

    const orderItemId = req.params.orderItemId;
    const { quantity, unitPrice, totalPrice } = req.body;

    const updatedOrderItem = await OrderItem.update(
      orderItemId,
      quantity,
      unitPrice,
      totalPrice
    );
    if (!updatedOrderItem) {
      return res
        .status(404)
        .json({ success: false, error: "Order item not found" });
    }
    res.json({
      success: true,
      data: updatedOrderItem,
      message: "Order item updated successfully",
    });
  } catch (error) {
    console.error("Error updating order item:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.deleteOrderItem = async (req, res) => {
  try {
    // اعتبارسنجی نقش مدیر (یا سطح دسترسی مورد نیاز)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, error: "Forbidden" });
    // }

    const orderItemId = req.params.orderItemId;
    await OrderItem.delete(orderItemId);
    res.json({ success: true, message: "Order item deleted successfully" });
  } catch (error) {
    console.error("Error deleting order item:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
