// models/Size.js
const pool = require("../config/db");

class Size {
  static async getAll() {
    const result = await pool.query("SELECT * FROM sizes");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM sizes WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(size) {
    const { size: sizeValue, type } = size;
    const result = await pool.query(
      "INSERT INTO sizes (size, type) VALUES ($1, $2) RETURNING *",
      [sizeValue, type]
    );
    return result.rows[0];
  }

  static async update(id, size) {
    const { size: sizeValue, type } = size;
    const result = await pool.query(
      "UPDATE sizes SET size = $1, type = $2 WHERE id = $3 RETURNING *",
      [sizeValue, type, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM sizes WHERE id = $1", [id]);
  }
}

module.exports = Size;
