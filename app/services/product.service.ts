import { productRepository } from "@/app/repositories/product.repository";

export class ProductNotFoundError extends Error {}

export const productService = {
  create: (data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
  }) => {
    return productRepository.create(data);
  },

  list: async (params: { page: number; limit: number; search?: string }) => {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      productRepository.findMany({ skip, take: limit, search }),
      productRepository.count(search),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError("Product tidak ditemukan");
    }
    return product;
  },

  update: async (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>
  ) => {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new ProductNotFoundError("Product tidak ditemukan");
    }
    return productRepository.update(id, data);
  },

  softDelete: async (id: string) => {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new ProductNotFoundError("Product tidak ditemukan");
    }
    return productRepository.softDelete(id);
  },
};