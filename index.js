const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const addressRoutes = require("./routes/addressRoutes");
const userRoutes = require("./routes/userRoutes");
const brandRoutes = require("./routes/brandRoutes");
const sizeRoutes = require("./routes/sizeRoutes");
const colorRoutes = require("./routes/colorRoutes");
const provinceRoutes = require("./routes/provinceRoutes");
const cityRoutes = require("./routes/cityRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productCategoryRoutes = require("./routes/productCategoryRoutes");
const productColorRoutes = require("./routes/productColorRoutes");
const productSizeRoutes = require("./routes/productSizeRoutes");
const commentRoutes = require("./routes/commentRoutes");



const app = express();

 // برای دسترسی به تصاویر آپلود شده
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/provinces", provinceRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/productsizes", productSizeRoutes);
app.use("/api/productcolors", productColorRoutes);
app.use("/api/productcategories", productCategoryRoutes);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
console.log("Upload object before export:", upload);
module.exports = { upload };
app.listen(PORT, () => console.log(`🚀 server is runnig on port ${PORT}`));
