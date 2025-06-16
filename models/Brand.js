// models/Brand.js
const pool = require("../config/db");

class Brand {
  static async getAll() {
    const result = await pool.query("SELECT * FROM brands");
    return result.rows;
  }
  static async countAll(search = "") {
    const result = await pool.query(
      "SELECT COUNT(*) FROM brands WHERE name ILIKE $1",
      [`%${search}%`]
    );
    return parseInt(result.rows[0].count, 10);
  }
  static async getById(id) {
    const result = await pool.query("SELECT * FROM brands WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(brand) {
    const { name } = brand;
    const result = await pool.query(
      "INSERT INTO brands (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0];
  }

  static async update(id, brand) {
    const { name } = brand;
    const result = await pool.query(
      "UPDATE brands SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM brands WHERE id = $1", [id]);
  }
}

module.exports = Brand;
