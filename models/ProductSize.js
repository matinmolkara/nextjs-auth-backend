// models/ProductSize.js
const pool = require("../config/db");

class ProductSize {
  static async create(productSize) {
    const { product_id, size_id } = productSize;
    const result = await pool.query(
      "INSERT INTO product_sizes (product_id, size_id) VALUES ($1, $2) RETURNING *",
      [product_id, size_id]
    );
    return result.rows[0];
  }

  static async getProductSizes(product_id) {
    const result = await pool.query(
      `SELECT sizes.* FROM sizes INNER JOIN product_sizes ON sizes.id = product_sizes.size_id WHERE product_sizes.product_id = $1`,
      [product_id]
    );
    return result.rows;
  }
  static async delete(product_id, size_id) {
    await pool.query(
      "DELETE FROM product_sizes WHERE product_id = $1 AND size_id = $2",
      [product_id, size_id]
    );
  }
}

module.exports = ProductSize;
