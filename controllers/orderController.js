const Order = require("../models/Order");
const Cart = require("../models/Cart"); // برای دریافت سبد خرید (اگر نیاز باشد)
const CartItem = require("../models/CartItem"); // برای دریافت آیتم‌های سبد خرید (اگر نیاز باشد)
const OrderItem = require("../models/OrderItem");


exports.createOrder = async (req, res) => {

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const userId = req.user.id;
    const {
      cartId,
      paymentMethod,
      shippingAddress,
      billingAddress,
      shippingMethod,
      shippingCost,
      notes,
    } = req.body;

    if (!cartId || !paymentMethod) {
      
      return res.status(400).json({
        success: false,
        error: "شناسه سبد خرید و روش پرداخت الزامی است.",
      });
    }

    const cartItems = await Cart.getItems(cartId);
    if (!cartItems || cartItems.length === 0) {
      
      return res
        .status(400)
        .json({ success: false, error: "سبد خرید خالی است." });
    }

    let totalAmount = 0;
    cartItems.forEach((item) => {
      const unitPrice = parseFloat(item.unit_price);
      const quantity = parseInt(item.quantity);
      if (!isNaN(unitPrice) && !isNaN(quantity)) {
        totalAmount += quantity * unitPrice;
      }
    });
    totalAmount += parseFloat(shippingCost || 0);

    const initialOrderStatus =
      paymentMethod === "پرداخت در محل" ? "در دست بررسی" : "در انتظار پرداخت";
    const initialPaymentStatus =
      paymentMethod === "پرداخت در محل" ? "در انتظار پرداخت" : "پرداخت نشده";



    // const existingOrderCheck = await client.query(
    //   "SELECT 1 FROM orders WHERE cart_id = $1 LIMIT 1",
    //   [cartId]
    // );

    // if (existingOrderCheck.rows.length > 0) {
    //   await client.query("ROLLBACK"); // لغو تراکنش
    //   // client.release(); // در finally آزاد می‌شود
    //   return res.status(400).json({
    //     success: false,
    //     error: "سفارش برای این سبد خرید قبلاً ثبت شده است.",
    //   });
    // }

    // const existingOrder = await Order.findByCartId(cartId);
    // if (existingOrder) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "سفارش برای این سبد خرید قبلاً ثبت شده است.",
    //   });
    // }

    const order = await Order.create(
      userId,
      cartId,
      totalAmount,
      paymentMethod,
      initialPaymentStatus,
      shippingAddress,
      billingAddress,
      shippingMethod,
      shippingCost,
      notes,
      initialOrderStatus
    );
    if (!order || !order.order_id) {
      return res
        .status(500)
        .json({ success: false, error: "خطا در ایجاد سفارش." });
    }
    for (const item of cartItems) {
      const unitPrice = parseFloat(item.unit_price);
      const quantity = parseInt(item.quantity);
      const totalPrice = unitPrice * quantity;
      await OrderItem.create(
        order.order_id,
        item.product_id,
        quantity,
        unitPrice,
        totalPrice
      );
    }
    // پس از ایجاد سفارش موفقیت‌آمیز، می‌توانید سبد خرید را خالی کنید
    await Cart.clear(cartId);

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const userId = req.user.id;
    const orders = await Order.findByUserId(userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    // const cartItems = await Cart.getItems(order.cart_id);
    const orderItems = await OrderItem.findByOrderId(orderId);
    res.json({
      success: true,
      data: {
        ...order,
        // items: cartItems,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// مثال برای به‌روزرسانی وضعیت سفارش (فقط برای مدیر)
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus, paymentStatus, notes } = req.body;
    const updatedOrder = await Order.updateStatus(orderId, {
      order_status: orderStatus,
      payment_status: paymentStatus,
      notes,
    });
    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
// برای لیست کامل سفارش‌ها با فیلتر و pagination
exports.getFilteredOrders = async (req, res) => {
  try {
    const rawPage = parseInt(req.query.page);
    const rawPageSize = parseInt(req.query.pageSize);

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const pageSize = !isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const result = await Order.getFilteredOrders({
      search: req.query.search,
      paymentStatus: req.query.paymentStatus,
      dateFilter: req.query.date,
      limit,
      offset,
    });

    res.json({ success: true, orders: result });
  } catch (error) {
    console.error("🔥 خطای getFilteredOrders:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// controllers/orderController.js

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const deleted = await Order.delete(orderId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "سفارش پیدا نشد" });
    }

    res.json({ success: true, message: "سفارش با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, error: "خطای سرور" });
  }
};
