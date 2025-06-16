const pool = require("../config/db");

exports.createMessage = async (req, res) => {
  const { full_name, phone, email, message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO contact_messages (full_name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING *",
      [full_name, phone, email, message]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("خطا در ثبت پیام:", err);
    res.status(500).json({ success: false, message: "خطا در ارسال پیام" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطا در دریافت پیام‌ها" });
  }
};


exports.getMessageById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM contact_messages WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "پیام پیدا نشد" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطا در دریافت پیام" });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM contact_messages WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "پیام پیدا نشد" });
    } else {
      res.json({ success: true, message: "پیام با موفقیت حذف شد", data: result.rows[0] });
    } } catch (err) { 
    res.status(500).json({ success: false, message: "خطا در حذف پیام" }); 
  }
}
