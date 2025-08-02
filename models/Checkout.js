import mongoose from "mongoose";

const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    size: String,
    color: String,
    
  },
  { _id: false }
);

const CheckoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postCode: { type: String},
      country: { type: String, required: true },
    },
   checkoutItems: [checkoutItemSchema],
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      default: "Pending", // Pending, Completed, Failed
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed, // To store payment details like transaction ID, etc.
    },
    isFinalized: {
      type: Boolean,
      default: false, // Indicates if the checkout process is finalized
    },
    isFinalizedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Checkout = mongoose.model("Checkout", CheckoutSchema);
export default Checkout;
