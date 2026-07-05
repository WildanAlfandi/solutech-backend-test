import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { productService } from "@/app/services/product.service";
import { getAuthUser, unauthorizedResponse } from "@/app/lib/auth-middleware";

const createProductSchema = z.object({
  name: z.string().min(1, "Nama product wajib diisi"),
  description: z.string().optional(),
  price: z.number().positive("Harga harus lebih dari 0"),
  stock: z.number().int().nonnegative("Stok tidak boleh negatif"),
});

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? undefined;

  const result = await productService.list({ page, limit, search });

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await productService.create(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}