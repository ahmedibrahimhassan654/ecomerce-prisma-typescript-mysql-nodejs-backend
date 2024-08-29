import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prismaClient";
import logger from "../utils/logger";
import ErrorResponse from "../exceptions/ErrorResponse";
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const createAddress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { line1, line2, city, country, pinCode } = req.body;

  try {
    const newAddress = await prisma.address.create({
      data: {
        line1,
        line2,
        city,
        country,
        pinCode,
        user: {
          connect: { id: req.user.userId },
        },
      },
    });

    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    res.status(500).json({ error: "Failed to create address" });
  }
};
export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const address = await prisma.address.findUnique({
      where: { id: Number(id) },
    });

    if (!address) {
      return next(new ErrorResponse("Address not found", 404));
    }

    if (address.userId !== req.user.userId && req.user.role !== "ADMIN") {
      return next(
        new ErrorResponse("Not authorized to delete this address", 403)
      );
    }

    await prisma.address.delete({ where: { id: Number(id) } });

    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete address" });
  }
};

export const getAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const address = await prisma.address.findUnique({
      where: { id: Number(id) },
    });

    if (!address) {
      return next(new ErrorResponse("Address not found", 404));
    }

    if (address.userId !== req.user.userId && req.user.role !== "ADMIN") {
      return next(
        new ErrorResponse("Not authorized to view this address", 403)
      );
    }

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ error: "Failed to get address" });
  }
};

export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { line1, line2, city, country, pinCode } = req.body;

  try {
    const address = await prisma.address.findUnique({
      where: { id: Number(id) },
    });

    if (!address) {
      return next(new ErrorResponse("Address not found", 404));
    }

    if (address.userId !== req.user.userId && req.user.role !== "ADMIN") {
      return next(
        new ErrorResponse("Not authorized to update this address", 403)
      );
    }

    const updatedAddress = await prisma.address.update({
      where: { id: Number(id) },
      data: { line1, line2, city, country, pinCode },
    });

    res.status(200).json({ success: true, data: updatedAddress });
  } catch (error) {
    res.status(500).json({ error: "Failed to update address" });
  }
};

// Get My Addresses
export const getMyAddresses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.userId },
    });

    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ error: "Failed to get addresses" });
  }
};
