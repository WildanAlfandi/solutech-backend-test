import { prisma } from "@/app/lib/prisma";

export const userRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },
};