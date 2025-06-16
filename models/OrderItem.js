const pool = require("../config/db");

class OrderItem {
  static async create(orderId, productId, quantity, unitPrice, totalPrice) {
    try {
      const result = await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [orderId, productId, quantity, unitPrice, totalPrice]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating order item:", error);
      throw error;
    }
  }

  static async findById(orderItemId) {
    try {
      const result = await pool.query(
        "SELECT * FROM order_items WHERE order_item_id = $1",
        [orderItemId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding order item by ID:", error);
      throw error;
    }
  }

  static async findByOrderId(orderId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          oi.*,
          p.title AS product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        `,
        [orderId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error finding order items by order ID:", error);
      throw error;
    }
  }

  static async update(orderItemId, quantity, unitPrice, totalPrice) {
    try {
      const result = await pool.query(
        `UPDATE order_items
         SET quantity = $1, unit_price = $2, total_price = $3, updated_at = NOW()
         WHERE order_item_id = $4
         RETURNING *`,
        [quantity, unitPrice, totalPrice, orderItemId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating order item:", error);
      throw error;
    }
  }

  static async delete(orderItemId) {
    try {
      await pool.query("DELETE FROM order_items WHERE order_item_id = $1", [
        orderItemId,
      ]);
    } catch (error) {
      console.error("Error deleting order item:", error);
      throw error;
    }
  }

  // می‌توانید متدهای دیگری برای جستجو، فیلتر کردن و غیره اضافه کنید.
}

module.exports = OrderItem;
