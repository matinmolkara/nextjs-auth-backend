// routes/pages.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/pageController");

router.get("/", controller.getAllPages);
router.get("/:slug", controller.getPageBySlug);
router.post("/", controller.createPage);
router.put("/:id", controller.updatePage);
router.delete("/:id", controller.deletePage);

module.exports = router;
