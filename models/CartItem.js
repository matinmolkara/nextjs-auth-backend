const pool = require("../config/db");

class CartItem {
  static async add(cartId, productId, quantity, price, color, size) {
    try {
      // بررسی وجود آیتم مشابه (با مدیریت null برای color و size)
      const existing = await pool.query(
        `SELECT * FROM cart_items
         WHERE cart_id = $1
           AND product_id = $2
           AND color IS NOT DISTINCT FROM $3  -- Changed from =
           AND size IS NOT DISTINCT FROM $4`, // Changed from =
        [cartId, productId, color, size]
      );

      if (existing.rows.length > 0) {
        // اگر وجود داشت، تعداد را آپدیت کن
        return await pool.query(
          `UPDATE cart_items
           SET quantity = quantity + $1
           WHERE cart_id = $2
             AND product_id = $3
             AND color IS NOT DISTINCT FROM $4  -- Changed from =
             AND size IS NOT DISTINCT FROM $5  -- Changed from =
           RETURNING *`,
          [quantity, cartId, productId, color, size]
        );
      } else {
        // اگر وجود نداشت، آیتم جدید را اضافه کن
        // مقادیر null به درستی در INSERT قرار می‌گیرند
        return await pool.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, price, color, size)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [cartId, productId, quantity, price, color, size]
        );
      }
    } catch (err) {
      console.error("Error in CartItem.add:", err);
      throw err; // Re-throw the error to be caught by the controller
    }
  }

  static async updateQuantity(cartId, productId, quantity, color, size) {
    try {
      return await pool.query(
        `UPDATE cart_items
         SET quantity = $1
         WHERE cart_id = $2
           AND product_id = $3
           AND color IS NOT DISTINCT FROM $4  -- Changed from =
           AND size IS NOT DISTINCT FROM $5  -- Changed from =
         RETURNING *`,
        [quantity, cartId, productId, color, size]
      );
    } catch (err) {
      console.error("Error in CartItem.updateQuantity:", err);
      throw err;
    }
  }

  static async remove(cartId, productId, color, size) {
    try {
      return await pool.query(
        `DELETE FROM cart_items
         WHERE cart_id = $1
           AND product_id = $2
           AND color IS NOT DISTINCT FROM $3  -- Changed from =
           AND size IS NOT DISTINCT FROM $4`, // Changed from =
        [cartId, productId, color, size]
      );
    } catch (err) {
      console.error("Error in CartItem.remove:", err);
      throw err;
    }
  }
}

module.exports = CartItem;
