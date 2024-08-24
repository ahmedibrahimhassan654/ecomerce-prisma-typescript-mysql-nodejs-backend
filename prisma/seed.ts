import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: "Alice", email: "alice@example.com", password: "password123" },
    { name: "Bob", email: "bob@example.com", password: "password123" },
    { name: "Charlie", email: "charlie@example.com", password: "password123" },
    { name: "David", email: "david@example.com", password: "password123" },
    { name: "Eve", email: "eve@example.com", password: "password123" },
    { name: "Frank", email: "frank@example.com", password: "password123" },
    { name: "Grace", email: "grace@example.com", password: "password123" },
    { name: "Hank", email: "hank@example.com", password: "password123" },
    { name: "Ivy", email: "ivy@example.com", password: "password123" },
    { name: "Jack", email: "jack@example.com", password: "password123" },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
