// models/Color.js
const pool = require("../config/db");

class Color {
  static async getAll() {
    const result = await pool.query("SELECT * FROM colors");
    return result.rows;
  }
  static async getById(id) {
    const result = await pool.query("SELECT * FROM colors WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(color) {
    const { name, code } = color;
    const result = await pool.query(
      "INSERT INTO colors (name, code) VALUES ($1, $2) RETURNING *",
      [name, code]
    );
    return result.rows[0];
  }

  static async update(id, color) {
    const { name, code } = color;
    const result = await pool.query(
      "UPDATE colors SET name = $1, code = $2 WHERE id = $3 RETURNING *",
      [name, code, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM colors WHERE id = $1", [id]);
  }
}

module.exports = Color;
