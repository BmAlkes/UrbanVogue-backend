import express from "express";
import Checkout from "../models/Checkout.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAdress, paymentMethod, totalPrice } = req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }
  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      shippingAddress: shippingAdress,
      checkoutItems: checkoutItems,
      paymentMethod: paymentMethod,
      totalPrice: totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log("Checkout created successfully:", req.user._id);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/checkout/:id/pay
// @desc Update checkout  to mark as paid after sucessful payment
// @access Private

router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails; // Store payment details like transaction ID, etc.
      checkout.paidAt = new Date();
      await checkout.save();

      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Payment status is not valid" });
    }
  } catch (error) {
    console.error("Error updating checkout payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private

router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    
    if (checkout.isPaid && !checkout.isFinalized) {
      // ✅ Agora pode usar diretamente os checkoutItems, pois ambos usam productId
      const finalOrder = await Order.create({
        user: checkout.user,
        shippingAddress: checkout.shippingAddress,
        orderItems: checkout.checkoutItems, // ✅ Sem transformação necessária
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });
      
      // Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.isFinalizedAt = new Date();
      await checkout.save();

      // Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      
      res.status(201).json({
        finalOrder,
      });
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout is already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid yet" });
    }
  } catch (error) {
    console.error("Error finalizing checkout:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;