import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearAll() {
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "CartItem",
        "OrderItem",
        "Review",
        "ProductImage",
        "Product",
        "Address",
        "Order",
        "Cart",
        "Category",
        "User"
      RESTART IDENTITY CASCADE;
    `);
    console.log("All data cleared!");
  } catch (error) {
    console.error("Failed to clear data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAll();

// if you want to Truncate the All tables Record use this command------->>>>[ node prisma/clearAll.js ]