const { v4: uuidv4 } = require("uuid"); // برای تولید UUID
const pool = require("../config/db");

class Cart {
  // پیدا کردن یا ایجاد سبد خرید برای کاربر ثبت‌نام‌شده
  static async findOrCreateByUserId(userId) {
    const result = await pool.query("SELECT * FROM carts WHERE user_id = $1", [
      userId,
    ]);
    if (result.rows.length > 0) return result.rows[0];

    const uniqueId = uuidv4(); // تولید UUID
    const insert = await pool.query(
      "INSERT INTO carts (user_id, unique_id) VALUES ($1, $2) RETURNING *",
      [userId, uniqueId]
    );
    return insert.rows[0];
  }

  // ایجاد سبد خرید برای کاربر مهمان
  static async createGuestCart() {
    const uniqueId = uuidv4(); // تولید UUID
    const insert = await pool.query(
      "INSERT INTO carts (user_id, unique_id) VALUES (NULL, $1) RETURNING *",
      [uniqueId]
    );
    return insert.rows[0];
  }

  // دریافت تمام آیتم‌های موجود در سبد خرید
  static async getItems(cartId) {
    const result = await pool.query(
      `SELECT ci.*, ci.price AS unit_price, p.title, p.image_urls
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1`,
      [cartId]
    );
    return result.rows;
  }

  // پاک کردن تمام آیتم‌های موجود در سبد خرید
  static async clear(cartId) {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  }

  // پیدا کردن سبد خرید بر اساس UUID
  static async findByUniqueId(uniqueId) {
    const result = await pool.query(
      "SELECT * FROM carts WHERE unique_id = $1",
      [uniqueId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // ادغام سبد خرید مهمان با سبد خرید کاربری
  static async mergeGuestCartWithUserCart(guestCartId, userId) {
    const guestItems = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1",
      [guestCartId]
    );

    const userCart = await this.findOrCreateByUserId(userId);

    for (const guestItem of guestItems.rows) {
      const existingItem = await pool.query(
        `SELECT * FROM cart_items
                WHERE cart_id = $1
                  AND product_id = $2
                  AND color IS NOT DISTINCT FROM $3
                  AND size IS NOT DISTINCT FROM $4`,
        [userCart.id, guestItem.product_id, guestItem.color, guestItem.size]
      );

      if (existingItem.rows.length > 0) {
        await pool.query(
          `UPDATE cart_items
                    SET quantity = quantity + $1
                    WHERE id = $2`,
          [guestItem.quantity, existingItem.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, price, color, size)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userCart.id,
            guestItem.product_id,
            guestItem.quantity,
            guestItem.price,
            guestItem.color,
            guestItem.size,
          ]
        );
      }
    }

    // حذف سبد مهمان پس از ادغام
    await pool.query("DELETE FROM carts WHERE id = $1", [guestCartId]);
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [
      guestCartId,
    ]);
  }
}

module.exports = Cart;
