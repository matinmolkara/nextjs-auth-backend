// models/Category.js
const pool = require("../config/db");

class Category {
  static async getAll() {
    const result = await pool.query("SELECT * FROM categories");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(category) {
    const { name, parent_id } = category;
    const result = await pool.query(
      "INSERT INTO categories (name, parent_id) VALUES ($1, $2) RETURNING *",
      [name, parent_id]
    );
    return result.rows[0];
  }

  static async update(id, category) {
    const { name, parent_id } = category;
    const result = await pool.query(
      "UPDATE categories SET name = $1, parent_id = $2 WHERE id = $3 RETURNING *",
      [name, parent_id, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  }
  // اضافه کردن تابع getChildCategories
  static async getChildCategories(parentId) {
    const result = await pool.query(
      "SELECT * FROM categories WHERE parent_id = $1",
      [parentId]
    );
    return result.rows;
  }

  // اضافه کردن تابع getAllWithChildren (اختیاری)
  static async getAllWithChildren() {
    const categories = await Category.getAll();
    const categoriesWithChildren = [];

    for (const category of categories) {
      const children = await Category.getChildCategories(category.id);
      categoriesWithChildren.push({ ...category, children });
    }

    return categoriesWithChildren;
  }

  static async getChildCategories(parentId) {
    const result = await pool.query(
      "SELECT * FROM categories WHERE parent_id = $1",
      [parentId]
    );
    return result.rows;
  }

  // --- NEW STATIC METHOD FOR FILTERING AND PAGINATION ---
  static async getFilteredAndPaginated({
    search,
    level1_id,
    level2_id,
    level3_id,
    limit,
    offset,
  }) {
    let query = "SELECT * FROM categories WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM categories WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    // Apply search filter
    if (search) {
      query += ` AND name ILIKE $${paramIndex}`;
      countQuery += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Apply level filters (by parent_id)
    if (level3_id !== undefined) {
      // If level 3 is filtered, filter by its parent_id
      query += ` AND parent_id = $${paramIndex}`;
      countQuery += ` AND parent_id = $${paramIndex}`;
      params.push(level3_id);
      paramIndex++;
    } else if (level2_id !== undefined) {
      // If level 2 is filtered, filter by its parent_id
      query += ` AND parent_id = $${paramIndex}`;
      countQuery += ` AND parent_id = $${paramIndex}`;
      params.push(level2_id);
      paramIndex++;
    } else if (level1_id !== undefined) {
      // If level 1 is filtered, filter by its parent_id
      // This will show level 2 categories whose parent is level1_id
      query += ` AND parent_id = $${paramIndex}`;
      countQuery += ` AND parent_id = $${paramIndex}`;
      params.push(level1_id);
      paramIndex++;
    }

    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const categoriesResult = await pool.query(query, params);
    const countResult = await pool.query(
      countQuery,
      params.slice(0, params.length - 2)
    ); // Exclude limit/offset for count

    return {
      categories: categoriesResult.rows,
      totalCount: parseInt(countResult.rows[0].count),
    };
  }
}

module.exports = Category;
