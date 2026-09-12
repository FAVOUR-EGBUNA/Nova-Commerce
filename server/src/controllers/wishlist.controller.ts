import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function getWishlist(
  _req: Request,
  res: Response,
) {
  try {
    const userId = res.locals.userId as string;

    const wishlist = await prisma.wishlistItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
            images: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load wishlist",
    });
  }
}

export async function addToWishlist(
  req: Request,
  res: Response,
) {
  try {
    const userId = res.locals.userId as string;
    const productId = String(req.params.productId);

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product || !product.active) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "Product already saved",
        data: existingItem,
      });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
            images: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: item,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add product to wishlist",
    });
  }
}

export async function removeFromWishlist(
  req: Request,
  res: Response,
) {
  try {
    const userId = res.locals.userId as string;
    const productId = String(req.params.productId);

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    await prisma.wishlistItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove product from wishlist",
    });
  }
}
