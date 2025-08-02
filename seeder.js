import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Cart from "./models/Cart.js";
import { products } from "./data/products.js";

dotenv.config();
// connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();
const seedData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    const createdUsers = await User.create({
      name: "Admin User",
      email: "bmalkes@gmail.com",
      password: "123456",
      role: "admin",
    });

    //assign the default user Id to each product

    const userId = createdUsers._id;
    const sampleProducts = products.map((product) => ({
      ...product,
      user: userId, // Assign the created user ID to each product
    }));

    await Product.insertMany(sampleProducts);
    console.log("Data seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error.message);
    process.exit(1);
  }
};
seedData();
