import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "info", "warn"],
});

// Graceful shutdown to close Prisma connection properly
const shutdownGracefully = async () => {
  try {
    await prisma.$disconnect();
    console.log("🔌 Prisma connection closed gracefully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during Prisma shutdown:", error);
    process.exit(1);
  }
};

// Handle unexpected errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚡ Unhandled Rejection at:", promise, "reason:", reason);
  shutdownGracefully();
});

process.on("uncaughtException", (error) => {
  console.error("🔥 Uncaught Exception:", error);
  shutdownGracefully();
});

export default prisma;
