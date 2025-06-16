const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware"); // فرض می‌کنیم یک middleware برای احراز هویت دارید

router.use(authMiddleware);

router.post("/", orderController.createOrder);
router.get("/me", orderController.getUserOrders);
router.get("/:orderId", orderController.getOrderById);

// روت برای به‌روزرسانی وضعیت سفارش (فقط برای مدیر)
router.put(
  "/:orderId/status",
  isAdmin, // اعمال middleware isAdmin
  orderController.updateOrderStatus
);


router.get(
  "/admin/orders",
  isAdmin, // فقط مدیر اجازه داره
  orderController.getFilteredOrders
);

// حذف سفارش - فقط مدیر
router.delete(
  "/:orderId",
  isAdmin, // فقط ادمین مجازه
  orderController.deleteOrder
);


module.exports = router;
