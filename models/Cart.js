import mongoose from "mongoose";

const CartItemsSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
},
{_id:false});

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // Allow for guest carts
    },
    guestId: {
        type: String,
        default: null, // Allow for guest carts
    },
    products: [CartItemsSchema],
    totalPrice: {
        type: Number,
        default: 0,
        required: true,
    },
},{timestamps: true});

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;