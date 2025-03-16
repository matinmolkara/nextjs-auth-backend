// models/Product.js
const pool = require("../config/db");

class Product {
  static async getAll() {
    const result = await pool.query("SELECT * FROM products");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(product) {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      image_urls,
      category_id,
      brand_id,
      special_offer,
    } = product;
    const result = await pool.query(
      "INSERT INTO products (title, description, price, real_price, discount, image_urls, category_id, brand_id, special_offer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        title,
        description,
        price,
        real_price,
        discount,
        image_urls,
        category_id,
        brand_id,
        special_offer,
      ]
    );
    return result.rows[0];
  }

  static async update(id, product) {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      image_urls,
      category_id,
      brand_id,
      special_offer,
    } = product;
    const result = await pool.query(
      "UPDATE products SET title = $1, description = $2, price = $3, real_price = $4, discount = $5, image_urls = $6, category_id = $7, brand_id = $8, special_offer = $9 WHERE id = $10 RETURNING *",
      [
        title,
        description,
        price,
        real_price,
        discount,
        image_urls,
        category_id,
        brand_id,
        special_offer,
        id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
  }
}

module.exports = Product;
