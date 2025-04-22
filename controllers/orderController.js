const Order = require("../models/Order");
const Cart = require("../models/Cart"); // برای دریافت سبد خرید (اگر نیاز باشد)
const CartItem = require("../models/CartItem"); // برای دریافت آیتم‌های سبد خرید (اگر نیاز باشد)

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

    // در اینجا شما باید منطق محاسبه مبلغ کل سفارش را از سبد خرید پیاده‌سازی کنید.
    // این ممکن است شامل خواندن آیتم‌های سبد خرید و جمع کردن قیمت‌ها باشد.
    // به عنوان یک مثال ساده، فرض می‌کنیم totalAmount از فرانت‌اند ارسال می‌شود.
    const cartItems = await Cart.getItems(cartId);
    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.quantity * parseFloat(item.unit_price); // مطمئن شوید که unit_price به درستی ذخیره شده است
    });
    totalAmount += parseFloat(shippingCost || 0); // اضافه کردن هزینه ارسال

    // وضعیت اولیه سفارش پس از ثبت (قبل از پرداخت آنلاین یا ثبت پرداخت در محل)
    const initialOrderStatus =
      paymentMethod === "پرداخت در محل" ? "در دست بررسی" : "در انتظار پرداخت";
    const initialPaymentStatus =
      paymentMethod === "پرداخت در محل" ? "در انتظار پرداخت" : "پرداخت نشده";

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
      notes
    );

    // پس از ایجاد سفارش موفقیت‌آمیز، می‌توانید سبد خرید را خالی کنید
    await Cart.clear(cartId);

    res
      .status(201)
      .json({
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
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// مثال برای به‌روزرسانی وضعیت سفارش (فقط برای مدیر)
exports.updateOrderStatus = async (req, res) => {
  try {
    // شما باید منطق احراز هویت مدیر را در اینجا پیاده‌سازی کنید
    // برای مثال، بررسی کنید که آیا req.user نقش مدیر دارد یا خیر
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, error: "Forbidden" });
    // }

    const orderId = req.params.orderId;
    const { orderStatus } = req.body;
    const updatedOrder = await Order.updateStatus(orderId, orderStatus);
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

// می‌توانید کنترلرهای دیگری برای لغو سفارش، به‌روزرسانی اطلاعات پرداخت، و غیره اضافه کنید.
