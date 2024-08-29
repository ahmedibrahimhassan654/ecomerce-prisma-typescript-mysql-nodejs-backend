import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import ErrorResponse from "../exceptions/ErrorResponse";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const addItemToCart = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId; // Ensure req.user is defined
  const { productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (product) {
      let cart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: true }, // Ensure items are included in the query
      });

      // If no cart exists for the user, create one
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
            items: {
              create: { productId, quantity },
            },
          },
          include: { items: true }, // Include items in the response
        });
      } else {
        // Check if the item already exists in the cart
        const existingItem = cart.items.find(
          (item) => item.productId === productId
        );

        if (existingItem) {
          // Update the quantity of the existing item
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
          });
        } else {
          // Add the new item to the cart
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity,
            },
          });
        }
      }

      res
        .status(200)
        .json({ message: "Item added to cart successfully", data: cart });
    } else {
      res.status(404).json({ error: "Product not found" });
    }

    // Find the cart by userId using findFirst
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId; // Ensure req.user is defined

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    // Find the cart for the authenticated user
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }, // Include related items and products
    });

    if (cart) {
      res.status(200).json({ data: cart });
    } else {
      res.status(404).json({ error: "Cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCartItems = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const cartId = parseInt(req.params.cartId, 10);

  if (isNaN(cartId)) {
    return res.status(400).json({ error: "Invalid cart ID" });
  }

  try {
    // Find the cart by cartId
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } }, // Include related items and products
    });

    if (cart) {
      res.status(200).json({ data: cart.items });
    } else {
      res.status(404).json({ error: "Cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteCartItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const itemId = parseInt(req.params.itemId, 10);

  if (isNaN(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    // Find the cart item by its ID
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }, // Include the related cart to ensure the user owns the cart
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Check if the cart belongs to the authenticated user
    const userId = req.user?.userId;
    if (cartItem.cart.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this item" });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.status(200).json({
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
