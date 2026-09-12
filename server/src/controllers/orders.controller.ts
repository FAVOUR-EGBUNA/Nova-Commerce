import { Request, Response } from "express";
import { z } from "zod";

import prisma from "../config/prisma.js";

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingState: z.string().min(2),
  shippingPostal: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

function createReference() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `NOVA-${Date.now()}-${random}`;
}

export async function createOrder(req: Request, res: Response) {
  try {
    const userId = res.locals.userId as string;
    const data = createOrderSchema.parse(req.body);

    const productIds = data.items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        active: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    let subtotal = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock`,
        });
      }

      subtotal += product.price * item.quantity;
    }

    const deliveryFee = subtotal >= 100000 ? 0 : 5000;
    const total = subtotal + deliveryFee;
    const reference = createReference();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          reference,
          userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail.toLowerCase(),
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingPostal: data.shippingPostal || null,
          subtotal,
          deliveryFee,
          total,
          status: "PROCESSING",

          // NOVA currently uses a simulated portfolio payment flow.
          paymentStatus: "PAID",

          items: {
            create: data.items.map((item) => {
              const product = productMap.get(item.productId)!;

              return {
                productId: product.id,
                quantity: item.quantity,
                unitPrice: product.price,
              };
            }),
          },
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: {
                      position: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      });

      for (const item of data.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message ?? "Invalid order information",
      });
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
}

export async function getMyOrders(_req: Request, res: Response) {
  try {
    const userId = res.locals.userId as string;

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    position: "asc",
                  },
                },
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
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
}

export async function getOrderByReference(req: Request, res: Response) {
  try {
    const userId = res.locals.userId as string;
    const reference = String(req.params.reference);

    const order = await prisma.order.findFirst({
      where: {
        reference,
        userId,
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    position: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load order",
    });
  }
}
