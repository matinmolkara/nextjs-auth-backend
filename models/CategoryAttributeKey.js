const pool = require("../config/db");

class CategoryAttributeKey {
  static async getByCategoryId(categoryId) {
    const res = await pool.query(
      `SELECT cak.*, ak.name, ak.input_type
       FROM category_attribute_keys cak
       JOIN attribute_keys ak ON cak.attribute_id = ak.id
       WHERE cak.category_id = $1`,
      [categoryId]
    );
    return res.rows;
  }

  static async create({ category_id, attribute_id, is_required = false }) {
    const res = await pool.query(
      `INSERT INTO category_attribute_keys (category_id, attribute_id, is_required)
       VALUES ($1, $2, $3) RETURNING *`,
      [category_id, attribute_id, is_required]
    );
    return res.rows[0];
  }
  static async getDetailedAttributesByCategoryId(categoryId) {
    const res = await pool.query(
      `SELECT
          cak.attribute_id,
          ak.name,
          ak.input_type,
          ak.is_custom,
          cak.is_required
       FROM category_attribute_keys cak
       JOIN attribute_keys ak ON cak.attribute_id = ak.id
       WHERE cak.category_id = $1`,
      [categoryId]
    );
    return res.rows;
  }
}

module.exports = CategoryAttributeKey;
