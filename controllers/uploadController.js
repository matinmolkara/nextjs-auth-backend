exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, error: "هیچ فایلی ارسال نشد" });
  }

  const filePath = `/uploads/${req.file.filename}`;
  return res.json({ success: true, path: filePath });
};
