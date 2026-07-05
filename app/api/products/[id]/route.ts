import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  productService,
  ProductNotFoundError,
} from "@/app/services/product.service";
import { getAuthUser, unauthorizedResponse } from "@/app/lib/auth-middleware";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const product = await productService.getById(id);
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await productService.update(id, parsed.data);
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    await productService.softDelete(id);
    return NextResponse.json(
      { message: "Product berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
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