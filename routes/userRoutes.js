// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");


router.get("/", userController.getAllUsers);
router.get("/count", userController.getUsersCount);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", userController.deleteUser);


module.exports = router;
