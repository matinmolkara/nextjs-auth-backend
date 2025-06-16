const pool = require("../config/db");

class AttributeValue {
  static async getByProductId(productId) {
    const res = await pool.query(
      `SELECT av.*, ak.name, ak.input_type, ak.is_custom
       FROM attribute_values av
       JOIN attribute_keys ak ON av.attribute_id = ak.id
       WHERE av.product_id = $1`,
      [productId]
    );
    return res.rows;
  }

  static async create({ product_id, attribute_id, value }) {
    const res = await pool.query(
      `INSERT INTO attribute_values (product_id, attribute_id, value)
       VALUES ($1, $2, $3) RETURNING *`,
      [product_id, attribute_id, value]
    );
    return res.rows[0];
  }

  static async deleteByProductId(productId) {
    await pool.query("DELETE FROM attribute_values WHERE product_id = $1", [
      productId,
    ]);
  }

  static async findByProductAndAttribute(product_id, attribute_id) {
    const result = await pool.query(
      "SELECT * FROM attribute_values WHERE product_id = $1 AND attribute_id = $2 LIMIT 1",
      [product_id, attribute_id]
    );
    return result.rows[0] || null;
  }

  // آپدیت مقدار
  static async updateValue(product_id, attribute_id, value) {
    return pool.query(
      "UPDATE attribute_values SET value = $1 WHERE product_id = $2 AND attribute_id = $3",
      [value, product_id, attribute_id]
    );
  }
}

module.exports = AttributeValue;
