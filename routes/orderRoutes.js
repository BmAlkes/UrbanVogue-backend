import express from "express";
import Order from "../models/Order.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//@route GET /api/orders/my-orders
//@desc Get logged user's orders
//@access Private
router.get("/my-orders", protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({
                path: 'orderItems.productId', // ✅ Usando productId (nome correto do campo)
                select: 'name price image'
            })
            .sort({createdAt: -1});
                
        res.json({
            orders: orders,
            totalOrders: orders.length
        });
             
    } catch (error) {
        console.error("Error in my-orders:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//@route GET /api/orders/:id
//@desc Get order details by ID
//@access Private
router.get("/:id", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate({
                path: 'orderItems.productId', // ✅ Usando productId (nome correto do campo)
                select: 'name price image description'
            });
            
        if(!order){
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.json(order);
    } catch (error) {
        console.error("Error in get order by id:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;