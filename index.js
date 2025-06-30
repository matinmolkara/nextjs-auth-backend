const express = require("express");

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
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productAttributesRoutes = require("./routes/productAttributesRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const pageRoutes = require("./routes/pageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");



const app = express();

 // برای دسترسی به تصاویر آپلود شده
app.use(
  cors({
    origin: ["https://luxurykharid.vercel.app/", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

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
app.use("/api/product-attributes", productAttributesRoutes);
app.use("/api/attributes", attributeRoutes); 
app.use("/api/pages", pageRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/uploads", express.static("uploads"));




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 server is runnig on port ${PORT}`));
