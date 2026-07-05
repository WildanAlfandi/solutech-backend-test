import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  // Seed user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@solutech.test" },
    update: {},
    create: {
      email: "admin@solutech.test",
      password: hashedPassword,
      name: "Admin Solutech",
    },
  });

  console.log("Seeded user:", user.email);

  // Seed products
  const products = [
    { name: "Keyboard Mechanical RGB", description: "Keyboard gaming dengan switch blue", price: 750000, stock: 25 },
    { name: "Mouse Wireless Ergonomic", description: "Mouse wireless dengan sensor presisi tinggi", price: 250000, stock: 40 },
    { name: "Monitor LED 24 Inch", description: "Monitor Full HD 24 inch 75Hz", price: 1800000, stock: 15 },
    { name: "Headset Gaming Surround", description: "Headset dengan mic noise cancelling", price: 450000, stock: 30 },
    { name: "Webcam Full HD 1080p", description: "Webcam untuk meeting dan streaming", price: 350000, stock: 20 },
  ];

  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    console.log("Seeded product:", created.name);
  }

  console.log("Seeding selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });