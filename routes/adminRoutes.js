import express from "express";
import User from "../models/User.js";

import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//@route GET /api/admin/users
//@desc Get all users
//@access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

//@ Post /api/admin/users
// desc Add a new user (Admin only)
//access Private/Admin

router.post("/", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    user = new User({
      name,
      email,
      password,
      role: role || "customer", // Default role is 'user'
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

//@ route put /api/admin/users/:id
//@ desc Update user info (admin only) - Name, email, role
//@ access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

//@ route delete /api/admin/users/:id
//@ desc Delete a user (admin only)

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const user= await User.findById(req.params.id);
        if(user){
            await user.deleteOne();
            res.status(200).json({message: "User deleted successfully"});
        }else{
            res.status(404).json({message: "User not found"});
        }
    } catch (error) {
        res.status(500).json({message: "Server error"});
    }
})

export default router;
