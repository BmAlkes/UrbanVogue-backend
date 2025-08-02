import express from "express";
import Product from "../models/Product.js";
import { admin, protect } from "../middleware/authMiddleware.js";
const router = express.Router();

//@route GET /api/admin/products
//@desc Get all products
//@access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
