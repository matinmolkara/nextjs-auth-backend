const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser } = require("../models/userModel");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "لطفاً تمام فیلدها را پر کنید" });

  const existingUser = await findUserByEmail(email);
  if (existingUser)
    return res.status(400).json({ message: "ایمیل قبلاً ثبت شده است" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser(name, email, hashedPassword);

  res.status(201).json({ message: "ثبت‌نام موفقیت‌آمیز بود", user: newUser });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "لطفاً تمام فیلدها را پر کنید" });

  const user = await findUserByEmail(email);
  if (!user)
    return res.status(401).json({ message: "کاربری با این ایمیل یافت نشد" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "رمز عبور نادرست است" });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({
    message: "ورود موفقیت‌آمیز بود",
    user: { id: user.id, name: user.name, email: user.email },
  });
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "خروج از حساب کاربری موفقیت‌آمیز بود" });
};
