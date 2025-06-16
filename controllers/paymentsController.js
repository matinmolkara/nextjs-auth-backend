const Payment = require("../models/Payment");
const Order = require("../models/Order");

exports.initiatePayment = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ error: "Order not found" });

  const amount = order.total_amount;

  const payment = await Payment.create({
    orderId: order.id,
    amount,
    gateway: "zarinpal", // مثال
  });

  // ساخت لینک پرداخت جعلی برای تست
  const fakeGatewayUrl = `https://bank.ir/pay?pid=${payment.id}`;
  res.json({ gatewayUrl: fakeGatewayUrl });
};

exports.verifyPayment = async (req, res) => {
  const { pid, status, ref_id, msg } = req.query;

  const newStatus = status === "OK" ? "paid" : "failed";
  await Payment.updateStatus(pid, newStatus, ref_id, msg);

  if (newStatus === "paid") {
    await Order.updateStatusByPayment(pid); // باید این متد ساخته بشه
    return res.redirect(`/checkout/success?orderId=${pid}`);
  } else {
    return res.redirect("/checkout/failure");
  }
};
