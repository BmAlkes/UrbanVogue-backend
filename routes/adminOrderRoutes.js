import express, { request } from "express";
import Order from "../models/Order.js";
import { admin, protect } from "../middleware/authMiddleware.js";
const router = express.Router();

//@route GET /api/admin/orders
//@desc Get all orders (Admin Only)
// @acess Private/Admin

router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Sort by creation date, most recent first
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});


//@route PUT /api/admin/orders/:id
//@desc Update order status (Admin Only)
// @acess Private/Admin

router.put("/:id", protect, admin, async (req, res) => {

    
    try {
        const order = await Order.findById(req.params.id);
    
        if (!order) {
        return res.status(404).json({ message: "Order not found" });
        }
    
        order.status =  req.body.status || order.status;
        req.body.status === "Delivered" ? order.isDelivered = true : order.isDelivered ;
        order.deliveredAt = req.body.status === "Delivered" ? new Date() : order.deliveredAt;
        const updatedOrder = await order.save();
    
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({
        message: "Server error",
        });
    }
})

//@route DELETE /api/admin/orders/:id
//@desc Delete an order (Admin Only)
// @acess Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    await order.deleteOne();
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});


export default router;