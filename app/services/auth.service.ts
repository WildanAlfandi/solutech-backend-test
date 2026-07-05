import bcrypt from "bcryptjs";
import { userRepository } from "@/app/repositories/user.repository";
import { signToken } from "@/app/lib/jwt";

export class AuthError extends Error {}

export const authService = {
  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError("Email atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthError("Email atau password salah");
    }

    const token = signToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  },
};