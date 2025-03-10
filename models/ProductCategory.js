// models/ProductCategory.js
const pool = require("../config/db");

class ProductCategory {
  static async create(productCategory) {
    const { product_id, category_id } = productCategory;
    const result = await pool.query(
      "INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) RETURNING *",
      [product_id, category_id]
    );
    return result.rows[0];
  }

  static async delete(product_id, category_id) {
    await pool.query(
      "DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2",
      [product_id, category_id]
    );
  }

  static async findByProductId(product_id) {
    const result = await pool.query(
      "SELECT * FROM product_categories WHERE product_id = $1",
      [product_id]
    );
    return result.rows;
  }

  static async findByCategoryId(category_id) {
    const result = await pool.query(
      "SELECT * FROM product_categories WHERE category_id = $1",
      [category_id]
    );
    return result.rows;
  }
}

module.exports = ProductCategory;
