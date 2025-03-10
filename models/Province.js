// models/Province.js
const pool = require("../config/db");

class Province {
  static async getAll() {
    const result = await pool.query("SELECT * FROM provinces");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM provinces WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(province) {
    const { name } = province;
    const result = await pool.query(
      "INSERT INTO provinces (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0];
  }

  static async update(id, province) {
    const { name } = province;
    const result = await pool.query(
      "UPDATE provinces SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM provinces WHERE id = $1", [id]);
  }
}

module.exports = Province;
