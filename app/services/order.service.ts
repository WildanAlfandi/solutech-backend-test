import { prisma } from "@/app/lib/prisma";
import { orderRepository } from "@/app/repositories/order.repository";

export class InsufficientStockError extends Error {}
export class ProductNotFoundError extends Error {}

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export const orderService = {
  create: async (userId: string, items: OrderItemInput[]) => {
    return prisma.$transaction(async (tx) => {
      let totalPrice = 0;
      const orderItemsData: {
        productId: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of items) {
        const product = await orderRepository.findProductForUpdate(
          tx,
          item.productId
        );

        if (!product) {
          throw new ProductNotFoundError(
            `Product dengan id ${item.productId} tidak ditemukan`
          );
        }

        if (product.stock < item.quantity) {
          throw new InsufficientStockError(
            `Stok tidak cukup untuk product "${product.name}" (tersedia: ${product.stock}, diminta: ${item.quantity})`
          );
        }

        const priceNumber = Number(product.price);
        totalPrice += priceNumber * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: priceNumber,
        });

        await orderRepository.decrementStock(tx, product.id, item.quantity);
      }

      const order = await orderRepository.createOrder(tx, {
        userId,
        totalPrice,
        items: orderItemsData,
      });

      return order;
    });
  },

  listByUser: (userId: string) => {
    return orderRepository.findManyByUser(userId);
  },
};