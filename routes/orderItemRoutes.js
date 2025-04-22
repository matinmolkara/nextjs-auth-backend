const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");
const { authMiddleware } = require("../middlewares/authMiddleware"); // برای محافظت از مسیرها (در صورت نیاز)
// const { adminMiddleware } = require("../middlewares/adminMiddleware"); // برای محافظت از مسیرهای مدیریت

// برای ایجاد یک آیتم سفارش (احتمالاً فقط توسط مدیر)
router.post(
  "/",
  /* authMiddleware, adminMiddleware, */ orderItemController.createOrderItem
);

// برای دریافت یک آیتم سفارش بر اساس ID
router.get(
  "/:orderItemId",
  /* authMiddleware, */ orderItemController.getOrderItemById
);

// برای دریافت تمام آیتم‌های مربوط به یک سفارش خاص
router.get(
  "/order/:orderId",
  /* authMiddleware, */ orderItemController.getOrderItemsByOrderId
);

// برای به‌روزرسانی یک آیتم سفارش (احتمالاً فقط توسط مدیر)
router.put(
  "/:orderItemId",
  /* authMiddleware, adminMiddleware, */ orderItemController.updateOrderItem
);

// برای حذف یک آیتم سفارش (احتمالاً فقط توسط مدیر)
router.delete(
  "/:orderItemId",
  /* authMiddleware, adminMiddleware, */ orderItemController.deleteOrderItem
);

module.exports = router;
