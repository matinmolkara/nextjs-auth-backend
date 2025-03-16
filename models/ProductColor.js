// models/ProductColor.js
const pool = require("../config/db");

class ProductColor {
  static async create(productColor) {
    const { product_id, color_id } = productColor;
    const result = await pool.query(
      "INSERT INTO product_colors (product_id, color_id) VALUES ($1, $2) RETURNING *",
      [product_id, color_id]
    );
    return result.rows[0];
  }

  static async delete(product_id, color_id) {
    await pool.query(
      "DELETE FROM product_colors WHERE product_id = $1 AND color_id = $2",
      [product_id, color_id]
    );
  }
  static async getProductColors(product_id) {
    const result = await pool.query(
      `SELECT colors.* FROM colors INNER JOIN product_colors ON colors.id = product_colors.color_id WHERE product_colors.product_id = $1`,
      [product_id]
    );
    return result.rows;
  }



  static async deleteProductColors(product_id) {
    await pool.query("DELETE FROM product_colors WHERE product_id = $1", [
      product_id,
    ]);
  }
}

module.exports = ProductColor;
