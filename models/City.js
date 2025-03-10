// models/City.js
const pool = require("../config/db");

class City {
  static async getAll() {
    const result = await pool.query("SELECT * FROM cities");
    return result.rows;
  }
  static async getById(id) {
    const result = await pool.query("SELECT * FROM cities WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(category) {
    const { name, parent_id } = category;
    const result = await pool.query(
      "INSERT INTO cities (name, parent_id) VALUES ($1, $2) RETURNING *",
      [name, parent_id]
    );
    return result.rows[0];
  }

  static async update(id, category) {
    const { name, parent_id } = category;
    const result = await pool.query(
      "UPDATE cities SET name = $1, parent_id = $2 WHERE id = $3 RETURNING *",
      [name, parent_id, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM cities WHERE id = $1", [id]);
  }
}

module.exports = City;
