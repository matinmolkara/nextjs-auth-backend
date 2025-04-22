const pool = require("../config/db");

class Cart {
  static async findOrCreateByUserId(userId) {
    const result = await pool.query("SELECT * FROM carts WHERE user_id = $1", [
      userId,
    ]);
    if (result.rows.length > 0) return result.rows[0];

    const insert = await pool.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
    return insert.rows[0];
  }

  static async createGuestCart() {
    const insert = await pool.query(
      "INSERT INTO carts (user_id) VALUES (NULL) RETURNING *", // user_id می‌تواند null باشد برای سبد مهمان
      []
    );
    return insert.rows[0];
  }

  static async getItems(cartId) {
    const result = await pool.query(
      `SELECT ci.*, p.title, p.image_urls
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1`,
      [cartId]
    );
    return result.rows;
  }

  static async clear(cartId) {
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  }

  // متد جدید برای ادغام سبد مهمان با سبد کاربری بعد از ورود
  static async mergeGuestCartWithUserCart(guestCartId, userId) {
    const guestItems = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1",
      [guestCartId]
    );

    const userCart = await this.findOrCreateByUserId(userId);

    for (const guestItem of guestItems.rows) {
      // بررسی وجود آیتم در سبد کاربر و ادغام یا اضافه کردن
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
          [
            existingItem.rows[0].quantity + guestItem.quantity,
            existingItem.rows[0].id,
          ]
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

    // حذف سبد مهمان بعد از ادغام
    await pool.query("DELETE FROM carts WHERE id = $1", [guestCartId]);
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [
      guestCartId,
    ]);
  }
}

module.exports = Cart;
