import type { Request, Response } from "express";
import { z } from "zod";

import prisma from "../config/prisma.js";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1),
  badge: z.string().nullable().optional(),
  active: z.boolean().optional(),
  image: z.string().url().optional(),
});

const updateProductSchema = productSchema.partial();

export async function getAdminProducts(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
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
    console.error("Get admin products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load products.",
    });
  }
}

export async function createAdminProduct(req: Request, res: Response) {
  try {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details.",
        errors: parsed.error.flatten(),
      });
    }

    const {
      name,
      slug,
      description,
      price,
      stock,
      categoryId,
      badge,
      active,
      image,
    } = parsed.data;

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this slug already exists.",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        stock,
        categoryId,
        badge: badge ?? null,
        active: active ?? true,

        ...(image
          ? {
              images: {
                create: {
                  url: image,
                  altText: name,
                  position: 0,
                },
              },
            }
          : {}),
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

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
}

export async function updateAdminProduct(req: Request, res: Response) {
  try {
    const productId = String(req.params.productId);

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product details.",
        errors: parsed.error.flatten(),
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const { image, categoryId, ...productData } = parsed.data;

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          ...productData,

          ...(categoryId
            ? {
                categoryId,
              }
            : {}),
        },
      });

      if (image) {
        const firstImage = await tx.productImage.findFirst({
          where: {
            productId,
          },
          orderBy: {
            position: "asc",
          },
        });

        if (firstImage) {
          await tx.productImage.update({
            where: {
              id: firstImage.id,
            },
            data: {
              url: image,
              altText: productData.name ?? existingProduct.name,
            },
          });
        } else {
          await tx.productImage.create({
            data: {
              productId,
              url: image,
              altText: productData.name ?? existingProduct.name,
              position: 0,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: {
          id: productId,
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
    });

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
}

export async function deleteAdminProduct(req: Request, res: Response) {
  try {
    const productId = String(req.params.productId);

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const orderItems = await prisma.orderItem.count({
      where: {
        productId,
      },
    });

    if (orderItems > 0) {
      const updatedProduct = await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          active: false,
        },
      });

      return res.json({
        success: true,
        message:
          "Product has existing orders, so it was deactivated instead of deleted.",
        data: updatedProduct,
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
}
