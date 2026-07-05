import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "@/app/lib/jwt";

export function getAuthUser(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}