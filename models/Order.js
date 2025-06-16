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
    notes,
    orderStatus
  ) {
    try {
      const result = await pool.query(
        `INSERT INTO orders (user_id, cart_id, total_amount, payment_method, payment_status, shipping_address, billing_address, shipping_method, shipping_cost, notes, order_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          orderStatus,
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

  static async updateStatus(orderId, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE orders SET ${setClause} WHERE order_id = $${
        keys.length + 1
      } RETURNING *`,
      [...values, orderId]
    );
    return result.rows[0];
  }

  static async updateStatusByPayment(paymentId) {
    const result = await pool.query(
      `UPDATE orders SET order_status = 'در حال پردازش', payment_status = 'پرداخت شده'
     WHERE id = (SELECT order_id FROM payments WHERE id = $1)
     RETURNING *`,
      [paymentId]
    );
    return result.rows[0];
  }
  static async updateFields(orderId, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE orders SET ${setClause}, updated_at = NOW() WHERE order_id = $${
        keys.length + 1
      } RETURNING *`,
      [...values, orderId]
    );
    return result.rows[0];
  }

  static async findByCartId(cartId) {
    try {
      const result = await pool.query(
        "SELECT * FROM orders WHERE cart_id = $1 LIMIT 1",
        [cartId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getFilteredOrders({
    search,
    paymentStatus,
    dateFilter,
    limit,
    offset,
  }) {
    try {
      let conditions = [];
      let values = [];
      let idx = 1;

      if (search) {
        conditions.push(`LOWER(u.name) LIKE LOWER($${idx++})`);
        values.push(`%${search}%`);
      }

      if (paymentStatus) {
        conditions.push(`o.payment_status = $${idx++}`);
        values.push(paymentStatus);
      }

      if (dateFilter === "today") {
        conditions.push(`DATE(o.order_date) = CURRENT_DATE`);
      } else if (dateFilter === "month") {
        conditions.push(
          `DATE_PART('month', o.order_date) = DATE_PART('month', CURRENT_DATE)`
        );
      } else if (dateFilter === "year") {
        conditions.push(
          `DATE_PART('year', o.order_date) = DATE_PART('year', CURRENT_DATE)`
        );
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const result = await pool.query(
        `
        SELECT 
          o.order_id,
          o.order_date,
          o.total_amount,
          o.payment_status,
          o.order_status,
          u.name AS customer_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ${whereClause}
        ORDER BY o.order_date DESC
        LIMIT $${idx++} OFFSET $${idx}
        `,
        [...values, limit, offset]
      );

      return result.rows;
    } catch (err) {
      console.error("🛑 SQL Error in getFilteredOrders:", err.message);
      throw err;
    }
  }



  static async delete(orderId) {
    try {
      const result = await pool.query(
        `DELETE FROM orders WHERE order_id = $1 RETURNING *`,
        [orderId]
      );
      return result.rows[0]; // برمی‌گردونه که چی حذف شده
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }
}




module.exports = Order;
