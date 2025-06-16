const pool = require("../config/db");

class Payment {
  static async create({ orderId, amount, gateway }) {
    const result = await pool.query(
      `INSERT INTO payments (order_id, amount, gateway) 
       VALUES ($1, $2, $3) RETURNING *`,
      [orderId, amount, gateway]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, refId = null, message = null) {
    const result = await pool.query(
      `UPDATE payments 
       SET status = $1, ref_id = $2, message = $3, paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE NULL END 
       WHERE id = $4 RETURNING *`,
      [status, refId, message, id]
    );
    return result.rows[0];
  }

  static async findByOrderId(orderId) {
    const res = await pool.query("SELECT * FROM payments WHERE order_id = $1", [
      orderId,
    ]);
    return res.rows[0];
  }
}

module.exports = Payment;
