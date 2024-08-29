import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import ErrorResponse from "../exceptions/ErrorResponse";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { items } = req.body; // items should be an array of { productId, quantity }

  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if all products exist
  for (const item of items) {
    const productExists = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!productExists) {
      return res
        .status(404)
        .json({ error: `Product with ID ${item.productId} not found` });
    }
  }

  try {
    // Create an order
    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Order created successfully", data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userRole = req.user?.role;

  // Check if the user has the Admin role
  if (userRole !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Fetch all orders with associated order items and user details
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const orderId = parseInt(req.params.orderId, 10);
  const { status } = req.body;
  const userRole = req.user?.role;

  if (
    isNaN(orderId) ||
    !["not accepted", "accepted", "in shipping"].includes(status)
  ) {
    return res.status(400).json({ error: "Invalid order ID or status" });
  }

  if (userRole !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res
      .status(200)
      .json({ message: "Order status updated successfully", data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
