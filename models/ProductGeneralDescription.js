const pool = require("../config/db");

class ProductGeneralDescription {
  static async getByProductId(productId) {
    const res = await pool.query(
      "SELECT * FROM product_general_descriptions WHERE product_id = $1",
      [productId]
    );
    return res.rows;
  }

  static async create({ product_id, title, content }) {
    const res = await pool.query(
      "INSERT INTO product_general_descriptions (product_id, title, content) VALUES ($1, $2, $3) RETURNING *",
      [product_id, title, content]
    );
    return res.rows[0];
  }

  static async deleteByProductId(productId) {
    await pool.query(
      "DELETE FROM product_general_descriptions WHERE product_id = $1",
      [productId]
    );
  }
}

module.exports = ProductGeneralDescription;
