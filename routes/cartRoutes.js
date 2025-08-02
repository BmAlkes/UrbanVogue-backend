import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Helper function to get cart for guest or user
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guest: guestId });
  }
  return null;
};

//@route Post /api/cart
//@desc Add a product to the cart for a guest or logged in user
//@access Public

router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await getCart(userId, guestId);

    if (cart) {
      const productIndex = cart.products.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (productIndex > -1) {
        const updatedQty = cart.products[productIndex].quantity + quantity;

        if (updatedQty < 1) {
          // Remove o item se a nova quantidade for menor que 1
          cart.products.splice(productIndex, 1);
        } else {
          // Atualiza a quantidade
          cart.products[productIndex].quantity = updatedQty;
        }
      } else {
        // Adiciona novo produto ao carrinho
        cart.products.push({
          productId,
          name: product.name,
          price: product.price,
          image: product?.images?.[0]?.url || "",
          size,
          color,
          quantity,
        });
      }

      // Atualiza o preço total
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      // Criar novo carrinho se ainda não existir
      const newCart = await Cart.create({
        user: userId || undefined,
        guestId: guestId || "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            price: product.price,
            image: product?.images?.[0]?.url || "",
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });

      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

//@route Put /api/cart
//@desc Update a product in the cart for a guest or logged in user
//@access Public

router.put("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    let cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (productIndex > -1) {
      // If product exists in the cart, update the quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1); // Remove product if quantity is 0
      }

      // Recalculate total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error ${error}` });
  }
});

//@route DELETE /api/cart
//@desc Remove a product from the cart
//@access Public

router.delete("/", async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body; // ✅ Acessar diretamente do req.body
  console.log("🛠️ REQ.BODY:", req.body);

  try {
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    const productIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );
    
    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error ${error}` });
  }
});

//@route GET /api/cart
//@desc Get logged-in user's or guest's cart
//@access Public
router.get("/", async (req, res) => {
  const { guestId, userId } = req.query;

  try {
    const cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error ${error}` });
  }
});

//@route POST /api/cart/merge
//@desc Merge guest cart with logged-in user's cart
//@access Private

router.post("/merge", protect, async (req, res) => {
  try {
    const { guestId } = req.body; // Assumindo que guestId vem do body da requisição

    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    // Verificar se o guest cart existe
    if (!guestCart) {
      return res.status(404).json({ message: "Guest cart not found" });
    }

    if (guestCart.products.length === 0) {
      return res.status(404).json({ message: "Guest cart is empty" });
    }

    if (userCart) {
      // Se o usuário já tem um carrinho, fazer merge dos produtos
      guestCart.products.forEach((item) => {
        const productIndex = userCart.products.findIndex(
          (p) =>
            p.productId.toString() === item.productId.toString() &&
            p.size === item.size &&
            p.color === item.color
        );
        if (productIndex > -1) {
          // Se o produto já existe, atualizar quantidade
          userCart.products[productIndex].quantity += item.quantity;
        } else {
          // Se o produto não existe, adicionar ao carrinho do usuário
          userCart.products.push(item);
        }
      });

      // Recalcular preço total
      userCart.totalPrice = userCart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await userCart.save();

      // Deletar carrinho guest após o merge
      try {
        await Cart.findOneAndDelete({ guestId });
      } catch (error) {
        console.log("Error deleting guest cart:", error);
      }

      res.status(200).json(userCart);
    } else {
      // Se o usuário não tem carrinho existente, atribuir o carrinho guest ao usuário
      guestCart.user = req.user._id;
      guestCart.guestId = undefined; // Limpar guestId já que agora é um carrinho de usuário
      await guestCart.save();
      res.status(200).json(guestCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

export default router;
