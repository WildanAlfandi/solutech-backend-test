import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  orderService,
  InsufficientStockError,
  ProductNotFoundError,
} from "@/app/services/order.service";
import { getAuthUser, unauthorizedResponse } from "@/app/lib/auth-middleware";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("productId harus berupa UUID valid"),
        quantity: z.number().int().positive("quantity harus lebih dari 0"),
      })
    )
    .min(1, "Order harus memiliki minimal 1 item"),
});

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await orderService.create(authUser.userId, parsed.data.items);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  const orders = await orderService.listByUser(authUser.userId);
  return NextResponse.json(orders, { status: 200 });
}