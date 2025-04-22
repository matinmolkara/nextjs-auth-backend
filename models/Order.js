const pool = require("../config/db");

class Order {
  static async create(
    userId,
    cartId,
    totalAmount,
    paymentMethod,
    paymentStatus,
    shippingAddress,
    billingAddress,
    shippingMethod,
    shippingCost,
    notes
  ) {
    try {
      const result = await pool.query(
        `INSERT INTO orders (user_id, cart_id, total_amount, payment_method, payment_status, shipping_address, billing_address, shipping_method, shipping_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          cartId,
          totalAmount,
          paymentMethod,
          paymentStatus,
          shippingAddress,
          billingAddress,
          shippingMethod,
          shippingCost,
          notes,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  static async findById(orderId) {
    try {
      const result = await pool.query(
        "SELECT * FROM orders WHERE order_id = $1",
        [orderId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding order by ID:", error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        "SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC",
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error finding orders by user ID:", error);
      throw error;
    }
  }

  static async updateStatus(orderId, orderStatus) {
    try {
      const result = await pool.query(
        "UPDATE orders SET order_status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *",
        [orderStatus, orderId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // می‌توانید متدهای دیگری برای به‌روزرسانی سایر فیلدهای سفارش،
  // دریافت لیست سفارشات با فیلترهای مختلف (مثلاً وضعیت)، و غیره اضافه کنید.
}

module.exports = Order;
