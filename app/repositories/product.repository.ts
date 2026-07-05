import { prisma } from "@/app/lib/prisma";

export const productRepository = {
  create: (data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
  }) => {
    return prisma.product.create({ data });
  },

  findMany: (params: { skip: number; take: number; search?: string }) => {
    const { skip, take, search } = params;

    return prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(search
          ? { name: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  count: (search?: string) => {
    return prisma.product.count({
      where: {
        deletedAt: null,
        ...(search
          ? { name: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
    });
  },

  findById: (id: string) => {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
  },

  update: (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>
  ) => {
    return prisma.product.update({ where: { id }, data });
  },

  softDelete: (id: string) => {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};