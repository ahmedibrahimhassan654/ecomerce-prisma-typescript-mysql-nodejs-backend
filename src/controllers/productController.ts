import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prismaClient";
import logger from "../utils/logger";
import ErrorResponse from "../exceptions/ErrorResponse";
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, description, price, tags } = req.body;

  if (!name || !price) {
    logger.warn("Create product failed: Missing required fields");
    return next(new ErrorResponse("Name and price are required", 400));
  }

  try {
    const product = await prisma.product.create({
      data: { name, description, price, tags },
    });

    res.status(201).json({ success: true, data: product, createdBy: req.user });
  } catch (error) {
    logger.error("Create product failed: Internal server error");
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res
      .status(200)
      .json({ success: true, lenght: products.length, data: products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (product) {
      res.status(200).json({ success: true, data: product });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { name, description, price, tags } = req.body;
  try {
    const updatedProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (updatedProduct) {
      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: { name, description, price, tags },
      });
      res.status(200).json({ success: true, data: product });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    // Check if the user is authorized to delete the product
    if (req.user.role !== "ADMIN") {
      return next(
        new ErrorResponse("Not authorized to delete this product", 403)
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return next(new ErrorResponse("Product not found", 404));
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.status(204).end(); // 204 No Content, no response body
  } catch (error) {
    next(new ErrorResponse("Failed to delete product", 500));
  }
};
