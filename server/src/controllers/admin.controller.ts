import { Request, Response } from "express";
import { z } from "zod";

import prisma from "../config/prisma.js";

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function getAdminDashboard(_req: Request, res: Response) {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      paidOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({
        where: {
          active: true,
        },
      }),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.order.count(),

      prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
        },
        select: {
          total: true,
        },
      }),

      prisma.product.findMany({
        where: {
          active: true,
          stock: {
            lte: 10,
          },
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
          stock: "asc",
        },
        take: 6,
      }),

      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      }),
    ]);

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );

    return res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalCustomers,
          totalOrders,
          totalRevenue,
        },
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard",
    });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const orderId = String(req.params.orderId);

    const data = updateOrderStatusSchema.parse(req.body);

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: data.status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message ?? "Invalid order status",
      });
    }

    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update order status",
    });
  }
}
