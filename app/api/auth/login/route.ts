import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService, AuthError } from "@/app/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const result = await authService.login(email, password);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}