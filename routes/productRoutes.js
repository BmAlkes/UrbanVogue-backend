import express from "express";
import Product from "../models/Product.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc Create a new product
// @route POST /api/products

router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;
    const product = new Product({
      name,
      description,
      price,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, //Reference to the user who created the product
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
//@route PUT /api/products/:id
//@desc Update an existing product ID
// @access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.countInStock = countInStock || product.countInStock;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.sizes = sizes || product.sizes;
    product.colors = colors || product.colors;
    product.collections = collections || product.collections;
    product.material = material || product.material;
    product.gender = gender || product.gender;
    product.images = images || product.images;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isPublished =
      isPublished !== undefined ? isPublished : product.isPublished;
    product.tags = tags || product.tags;
    product.dimensions = dimensions || product.dimensions;
    product.weight = weight || product.weight;
    product.sku = sku || product.sku;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//@route Delete /api/products/:id
//@desc Delete an existing product ID
// @access Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//@route GET /api/products
//@desc Get all products with optional query filters
// @access Public

router.get("/", async (req, res) => {
  try {
    const {
      collection,
      category,
      size,
      color,
      gender,
      minPrince,
      maxPrice,
      sortBy,
      search,
      material,
      brand,
      limit,
    } = req.query;

    const query = {};

    // Filter logic
    if (collection && collection.toString().toLowerCase() !== "all") {
      query.collections = collection;
    }

    if (category && category.toString().toLowerCase() !== "all") {
      query.category = category;
    }

    if (typeof material === "string") {
      query.material = { $in: material.split(",") };
    }

    if (typeof brand === "string") {
      query.brand = { $in: brand.split(",") };
    }

    if (typeof size === "string") {
      query.size = { $in: size.split(",") };
    }

    if (typeof color === "string") {
      query.colors = { $in: color.split(",") }; // antes: [color]
    }

    if (typeof gender === "string") {
      query.gender = gender;
    }

    if (minPrince || maxPrice) {
      query.price = {};
      if (minPrince) query.price.$gte = Number(minPrince);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (typeof search === "string") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort logic
    let sort = {};
    if (typeof sortBy === "string") {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    // Fetch products
    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/best-sellers", async (req, res) => {
  try {
    const bestSellers = await Product.findOne().sort({ rating: -1 }); // Sort by rating and then by price
    if (bestSellers) {
      res.json(bestSellers);
    } else {
      res.status(404).json({ message: "No best sellers found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// @route GET /api/products/new-arrivals
//@desc Get new arrivals products
// @access Public
router.get("/new-arrivals", async (req, res) => {
  try {
    //Fetch latest 8n products
    const newArrivals = await Product.find({})
      .sort({ createdAt: -1 }) // Sort by creation date, descending
      .limit(8); // Limit to 8 products

    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//@route GET /api/products/:id
//@desc Get a single product by ID
// @access Public

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.error(error);
  }
});

// @route GET /api/products/similar/:id
//@desc retrieve similar products based on current product's category gender
// @access Public

router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const similarProducts = await Product.find({
      _id: { $ne: id }, // Exclude the current product
      gender: product.gender,
      category: product.category,
    });
    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/products/best-sellers
//@desc retrieve best-selling products
// @access Public

export default router;
