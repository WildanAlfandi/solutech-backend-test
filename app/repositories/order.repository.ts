import { prisma } from "@/app/lib/prisma";
import { Prisma, PrismaClient } from "@prisma/client";

type PrismaOrTx = PrismaClient | Prisma.TransactionClient;

export const orderRepository = {
  findProductForUpdate: (client: PrismaOrTx, productId: string) => {
    return client.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
  },

  decrementStock: (client: PrismaOrTx, productId: string, quantity: number) => {
    return client.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  },

  createOrder: (
    client: PrismaOrTx,
    data: {
      userId: string;
      totalPrice: number;
      items: { productId: string; quantity: number; price: number }[];
    }
  ) => {
    return client.order.create({
      data: {
        userId: data.userId,
        totalPrice: data.totalPrice,
        items: { create: data.items },
      },
      include: { items: { include: { product: true } } },
    });
  },

  findManyByUser: (userId: string) => {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};