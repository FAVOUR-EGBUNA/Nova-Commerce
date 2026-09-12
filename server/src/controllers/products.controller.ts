import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!product || !product.active) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product",
    });
  }
}
