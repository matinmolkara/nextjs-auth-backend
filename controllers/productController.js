// controllers/productController.js
const Product = require("../models/Product");
const ProductColor = require("../models/ProductColor");
const ProductSize = require("../models/ProductSize");
const AttributeValue = require("../models/AttributeValue");
const ProductGeneralDescription = require("../models/ProductGeneralDescription");
const AttributeKey = require("../models/AttributeKey");
const ProductCategory = require("../models/ProductCategory");

exports.getAllProducts = async (req, res) => {
  try {
    const {
      categoryId,
      brand,
      inventory,
      special_offer,
      search = "",
      page = 1,
      pageSize = 15,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const filters = {
      categoryId,
      brand,
      available: inventory,
      specialOffer: special_offer,
      search,
    };

    const totalCount = await Product.countByFilters(filters);
    const products = await Product.getByFilters({ ...filters, skip, limit });

    res.json({ products, totalCount });
  } catch (error) {
    console.error("Backend Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const colors = await ProductColor.getProductColors(req.params.id);
    const attributes = await Product.getProductAttributes(req.params.id);
    const generalDescriptions = await Product.getGeneralDescriptions(
      req.params.id
    );
    res.json({ ...product, colors, attributes, generalDescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      category_id,
      brand_id,
      special_offer,
      best_seller,
      has_color,
      has_size,
      inventory,
      image_urls, // حالا مستقیماً از فرانت‌اند دریافت می‌شود
    } = req.body;

    const color_ids = JSON.parse(req.body.color_ids || "[]");
    const attributes = JSON.parse(req.body.attributes || "[]");
    const descriptions = JSON.parse(req.body.descriptions || "[]");
    const sizes = JSON.parse(req.body.sizes || "[]");

    // حالا دیگر نیازی به req.files نداریم
    // image_urls مستقیماً از فرانت‌اند می‌آید

    const product = await Product.create({
      title,
      description,
      price,
      real_price,
      discount,
      image_urls, // استفاده از URL های دریافتی از فرانت‌اند
      category_id,
      brand_id,
      special_offer,
      best_seller,
      has_color,
      has_size,
      inventory,
    });

    if (color_ids && color_ids.length > 0) {
      for (const color_id of color_ids) {
        await ProductColor.create({ product_id: product.id, color_id });
      }
    }

    if (sizes.length > 0) {
      for (const size_id of sizes) {
        await ProductSize.create({ product_id: product.id, size_id });
      }
    }

    for (const attr of attributes) {
      let attribute_id;

      if (attr.isCustom) {
        const key = await AttributeKey.createOrFindByName(attr.key);
        attribute_id = key.id;
      } else {
        attribute_id = attr.attribute_id;
      }

      await AttributeValue.create({
        product_id: product.id,
        attribute_id,
        value: attr.value,
      });
    }

    // توضیحات عمومی
    for (const { title, content } of descriptions) {
      await ProductGeneralDescription.create({
        product_id: product.id,
        title,
        content,
      });
    }

    await ProductCategory.create({
      product_id: product.id,
      category_id: product.category_id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.getById(req.params.id);
    if (!existingProduct) throw new Error("محصول یافت نشد");

    const {
      title,
      description,
      price,
      real_price,
      discount,
      category_id,
      brand_id,
      special_offer,
      best_seller,
      has_color,
      has_size,
      inventory,
      image_urls, // حالا مستقیماً از فرانت‌اند دریافت می‌شود
    } = req.body;

    const color_ids = Array.isArray(req.body.color_ids)
      ? req.body.color_ids
      : req.body.color_ids
      ? [req.body.color_ids]
      : null;

    const sizes = Array.isArray(req.body.sizes)
      ? req.body.sizes
      : req.body.sizes
      ? [req.body.sizes]
      : null;

    const attributes =
      req.body.attributes && req.body.attributes !== "null"
        ? JSON.parse(req.body.attributes)
        : null;

    const descriptions =
      req.body.descriptions && req.body.descriptions !== "null"
        ? JSON.parse(req.body.descriptions)
        : null;

    // حالا image_urls مستقیماً از فرانت‌اند می‌آید
    // دیگر نیازی به req.files نداریم
    const finalImageUrls = image_urls || existingProduct.image_urls || [];

    const updatedFields = {
      title: title ?? existingProduct.title,
      description: description ?? existingProduct.description,
      price: price ?? existingProduct.price,
      real_price: real_price ?? existingProduct.real_price,
      discount: discount ?? existingProduct.discount,
      image_urls: finalImageUrls,
      category_id: category_id ?? existingProduct.category_id,
      brand_id: brand_id ?? existingProduct.brand_id,
      special_offer: special_offer ?? existingProduct.special_offer,
      best_seller: best_seller ?? existingProduct.best_seller,
      has_color:
        has_color !== undefined ? has_color : existingProduct.has_color,
      has_size: has_size !== undefined ? has_size : existingProduct.has_size,
      inventory: inventory ?? existingProduct.inventory,
    };

    const product = await Product.update(req.params.id, updatedFields);

    if (color_ids !== null) {
      await ProductColor.deleteProductColors(req.params.id);
      for (const color_id of color_ids) {
        await ProductColor.create({ product_id: req.params.id, color_id });
      }
    }

    if (sizes !== null) {
      await ProductSize.deleteProductSizes(req.params.id);
      for (const size of sizes) {
        await ProductSize.create({ product_id: req.params.id, size });
      }
    }

    if (Array.isArray(attributes)) {
      for (const attr of attributes) {
        let attribute_id = attr.attribute_id;
        if (attr.isCustom) {
          const key = await AttributeKey.createOrFindByName(attr.key);
          attribute_id = key.id;
        }

        const existing = await AttributeValue.findByProductAndAttribute(
          req.params.id,
          attribute_id
        );

        if (existing) {
          await AttributeValue.updateValue(
            req.params.id,
            attribute_id,
            attr.value
          );
        } else {
          await AttributeValue.create({
            product_id: req.params.id,
            attribute_id,
            value: attr.value,
          });
        }
      }
    }

    if (Array.isArray(descriptions) && descriptions.length > 0) {
      await ProductGeneralDescription.deleteByProductId(req.params.id);
      for (const { title, content } of descriptions) {
        if (title && content) {
          await ProductGeneralDescription.create({
            product_id: req.params.id,
            title,
            content,
          });
        }
      }
    }

    res.json(product);
  } catch (error) {
    console.error("❌ updateProduct error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductColors = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const colors = await ProductColor.getProductColors(productId);
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductSizes = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const sizes = await ProductSize.getProductSizes(productId);
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.decreaseProductInventory = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "مقدار نامعتبر برای کسر موجودی" });
    }

    const updatedProduct = await Product.decreaseInventory(productId, quantity);
    if (!updatedProduct) {
      return res
        .status(400)
        .json({ message: "موجودی کافی نیست یا محصول یافت نشد" });
    }

    res.json({
      message: "موجودی با موفقیت کاهش یافت",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.increaseProductInventory = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "مقدار نامعتبر برای افزایش موجودی" });
    }

    const updatedProduct = await Product.increaseInventory(productId, quantity);
    if (!updatedProduct) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json({
      message: "موجودی با موفقیت افزایش یافت",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByBrandId = async (req, res) => {
  try {
    const products = await Product.getByBrandId(req.params.brand_id);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
