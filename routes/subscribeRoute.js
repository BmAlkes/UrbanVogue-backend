import express from "express";
// Import the Subscriber model
import Subscriber from "../models/Subscriber.js";


const router = express.Router();

//@route Post /api/subscribe
//@desc handle newsletter subscription
//@access Public
router.post("/", async (req, res) => {
    const { email } = req.body;
    
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }
    
    try {
        // Check if the email already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
        return res.status(400).json({ message: "Email already subscribed" });
        }
    
        // Create a new subscriber
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
    
        res.status(201).json({ message: "Subscription successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
})



export default router;