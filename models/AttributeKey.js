const pool = require("../config/db");

class AttributeKey {
  static async getAll() {
    const res = await pool.query("SELECT * FROM attribute_keys");
    return res.rows;
  }

  static async create({ name, input_type, is_custom = false }) {
    const res = await pool.query(
      `INSERT INTO attribute_keys (name, input_type, is_custom)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, input_type, is_custom]
    );
    return res.rows[0];
  }

  static async findByName(name) {
    const res = await pool.query(
      "SELECT * FROM attribute_keys WHERE name = $1",
      [name]
    );
    return res.rows[0];
  }

  static async createOrFindByName(name) {
    let key = await this.findByName(name);
    if (!key) {
      key = await this.create({ name, input_type: "text", is_custom: true });
    }
    return key;
  }

  static async deleteById(id) {
    await pool.query("DELETE FROM attribute_keys WHERE id = $1", [id]);
  }

  // بررسی وجود ویژگی
 
}

module.exports = AttributeKey;
