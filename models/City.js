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

  static async create(city) {
    const { name, province_id } = city;
    const result = await pool.query(
      "INSERT INTO cities (name, province_id) VALUES ($1, $2) RETURNING *",
      [name, province_id]
    );
    return result.rows[0];
  }

  static async update(id, city) {
    const { name, province_id } = city;
    const result = await pool.query(
      "UPDATE cities SET name = $1, province_id = $2 WHERE id = $3 RETURNING *",
      [name, province_id, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM cities WHERE id = $1", [id]);
  }
}

module.exports = City;
