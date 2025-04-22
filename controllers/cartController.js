const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  try {
    let cartId;
    let userId = req.user?.id; // کاربر ممکن است وارد نشده باشد

    if (userId) {
      const cart = await Cart.findOrCreateByUserId(userId);
      cartId = cart.id;
    } else {
      // منطق برای دریافت cartId از سشن یا کوکی (باید پیاده سازی شود)
      cartId = req.session?.guestCartId || req.cookies?.guestCartId;
      if (!cartId) {
        const newCart = await Cart.createGuestCart(); // متد جدید برای ایجاد سبد مهمان
        cartId = newCart.id;
        // ذخیره cartId در سشن یا کوکی (باید پیاده سازی شود)
        req.session.guestCartId = cartId;
        res.cookie("guestCartId", cartId, { maxAge: 3600000 * 24 * 7 }); // مثال: 7 روز
      }
    }

    if (!cartId) {
      return res.json({ success: true, data: { items: [] } }); // سبد خرید وجود ندارد
    }

    const items = await Cart.getItems(cartId);
    res.json({ success: true, data: { cartId, items } });
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    let cartId;
    const userId = req.user?.id;
    const { productId, quantity, color, size } = req.body;

    if (userId) {
      const cart = await Cart.findOrCreateByUserId(userId);
      cartId = cart.id;
    } else {
      cartId = req.session?.guestCartId || req.cookies?.guestCartId;
      if (!cartId) {
        const newCart = await Cart.createGuestCart();
        cartId = newCart.id;
        req.session.guestCartId = cartId;
        res.cookie("guestCartId", cartId, { maxAge: 3600000 * 24 * 7 });
      }
    }

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid product ID or quantity" });
    }

    const product = await Product.getById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const priceFromDB = product.price;
    const numericPrice = parseFloat(priceFromDB);

    if (priceFromDB == null || isNaN(numericPrice)) {
      console.error(
        `BACKEND: Invalid price found for product ${productId}. DB value:`,
        priceFromDB
      );
      return res.status(400).json({
        success: false,
        error: "Product price is invalid or missing in DB",
      });
    }

    await CartItem.add(cartId, productId, quantity, product.price, color, size);

    const items = await Cart.getItems(cartId);
    res.json({ success: true, data: { cartId, items } });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    let cartId;
    const userId = req.user?.id;
    const { productId, quantity, color, size } = req.body;

    if (userId) {
      const cart = await Cart.findOrCreateByUserId(userId);
      cartId = cart.id;
    } else {
      cartId = req.session?.guestCartId || req.cookies?.guestCartId;
      if (!cartId) {
        return res.status(400).json({ success: false, error: "Invalid cart" });
      }
    }

    if (!productId || !Number.isInteger(quantity) || quantity < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid product ID or quantity" });
    }

    if (quantity === 0) {
      await CartItem.remove(cartId, productId, color, size);
    } else {
      await CartItem.updateQuantity(cartId, productId, quantity, color, size);
    }

    const items = await Cart.getItems(cartId);
    res.json({ success: true, data: { cartId, items } });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    let cartId;
    const userId = req.user?.id;
    const { productId, color, size } = req.body;

    if (userId) {
      const cart = await Cart.findOrCreateByUserId(userId);
      cartId = cart.id;
    } else {
      cartId = req.session?.guestCartId || req.cookies?.guestCartId;
      if (!cartId) {
        return res.status(400).json({ success: false, error: "Invalid cart" });
      }
    }

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid product ID" });
    }

    await CartItem.remove(cartId, productId, color, size);

    const items = await Cart.getItems(cartId);
    res.json({ success: true, data: { cartId, items } });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    let cartId;
    const userId = req.user?.id;

    if (userId) {
      const cart = await Cart.findOrCreateByUserId(userId);
      cartId = cart.id;
    } else {
      cartId = req.session?.guestCartId || req.cookies?.guestCartId;
      if (!cartId) {
        return res.status(400).json({ success: false, error: "Invalid cart" });
      }
    }

    await Cart.clear(cartId);
    res.json({ success: true, data: { cartId, items: [] } });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
