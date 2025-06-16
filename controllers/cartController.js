const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  try {
    let uniqueId = req.cookies?.guestCartId || req.session?.guestCartId;
    let cart;

    if (req.user?.id) {
      cart = await Cart.findOrCreateByUserId(req.user.id);
    } else if (uniqueId) {
      cart = await Cart.findByUniqueId(uniqueId);
    } else {
      const newCart = await Cart.createGuestCart();
      uniqueId = newCart.unique_id;
      cart = newCart;

      // ذخیره UUID در کوکی یا سشن
      req.session.guestCartId = uniqueId;
      res.cookie("guestCartId", uniqueId, { maxAge: 3600000 * 24 * 7 });
    }

    if (!cart) {
      return res.json({ success: true, data: { items: [] } });
    }

    const items = await Cart.getItems(cart.id);
    res.json({ success: true, data: { cartId: cart.id, uniqueId, items } });
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    let uniqueId = req.cookies?.guestCartId || req.session?.guestCartId;
    let cartId;
    const { productId, quantity, color, size } = req.body;

    if (req.user?.id) {
      const cart = await Cart.findOrCreateByUserId(req.user.id);
      cartId = cart.id;
    } else if (uniqueId) {
      const cart = await Cart.findByUniqueId(uniqueId);
      if (!cart) {
        const newCart = await Cart.createGuestCart();
        uniqueId = newCart.unique_id;
        cartId = newCart.id;

        req.session.guestCartId = uniqueId;
        res.cookie("guestCartId", uniqueId, { maxAge: 3600000 * 24 * 7 });
      } else {
        cartId = cart.id;
      }
    } else {
      const newCart = await Cart.createGuestCart();
      uniqueId = newCart.unique_id;
      cartId = newCart.id;

      req.session.guestCartId = uniqueId;
      res.cookie("guestCartId", uniqueId, { maxAge: 3600000 * 24 * 7 });
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
    res.json({ success: true, data: { cartId, uniqueId, items } });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    let uniqueId = req.cookies?.guestCartId || req.session?.guestCartId;
    let cartId;
    const { productId, quantity, color, size } = req.body;

    if (req.user?.id) {
      const cart = await Cart.findOrCreateByUserId(req.user.id);
      cartId = cart.id;
    } else if (uniqueId) {
      const cart = await Cart.findByUniqueId(uniqueId);
      if (!cart) {
        return res.status(400).json({ success: false, error: "Invalid cart" });
      }
      cartId = cart.id;
    } else {
      return res.status(400).json({ success: false, error: "Invalid cart" });
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
    res.json({ success: true, data: { cartId, uniqueId, items } });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    let uniqueId = req.cookies?.guestCartId || req.session?.guestCartId;
    let cartId;
    const { productId, color, size } = req.body;

    if (req.user?.id) {
      const cart = await Cart.findOrCreateByUserId(req.user.id);
      cartId = cart.id;
    } else if (uniqueId) {
      const cart = await Cart.findByUniqueId(uniqueId);
      if (!cart) {
        return res.status(400).json({ success: false, error: "Invalid cart" });
      }
      cartId = cart.id;
    } else {
      return res.status(400).json({ success: false, error: "Invalid cart" });
    }

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid product ID" });
    }

    await CartItem.remove(cartId, productId, color, size);

    const items = await Cart.getItems(cartId);
    res.json({ success: true, data: { cartId, uniqueId, items } });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    let uniqueId = req.cookies?.guestCartId || req.session?.guestCartId;
    let cartId;

    if (req.user?.id) {
      const cart = await Cart.findOrCreateByUserId(req.user.id);
      cartId = cart.id;
    } else if (uniqueId) {
      const cart = await Cart.findByUniqueId(uniqueId);
      if (!cart) {
        return res.status(400).json({ success: false, error: "Invalid cart" });
      }
      cartId = cart.id;
    } else {
      return res.status(400).json({ success: false, error: "Invalid cart" });
    }

    await Cart.clear(cartId);
    res.json({ success: true, data: { cartId, uniqueId, items: [] } });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};



exports.mergeGuestCartWithUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const guestItems = req.body.items;
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "سبد مهمان خالی است یا معتبر نیست" });
    }

    const userCart = await Cart.findOrCreateByUserId(userId);

    for (const item of guestItems) {
      const { product_id, quantity, color, size } = item;
      const product = await Product.getById(product_id);
      if (!product) continue;

      await CartItem.add(
        userCart.id,
        product_id,
        quantity,
        product.price,
        color,
        size
      );
    }

    const updatedItems = await Cart.getItems(userCart.id);
    res.json({
      success: true,
      data: { cartId: userCart.id, items: updatedItems },
    });
  } catch (error) {
    console.error("Error merging guest cart:", error);
    res.status(500).json({ success: false, error: "خطا در ادغام سبد مهمان" });
  }
};