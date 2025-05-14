import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Delete existing ProductImages first to avoid foreign key constraint violations
  await prisma.productImage.deleteMany();

  // 2. Delete existing Products after deleting ProductImages
  await prisma.product.deleteMany();

  // 3. Delete existing Categories (now safe after deleting products and product images)
  await prisma.category.deleteMany();

  // 4. Create Categories with Slug (Ensure slugs are unique)
  const categories = await prisma.category.createMany({
    data: [
      { name: 'T-Shirts', slug: 't-shirts' },
      { name: 'Hoodies', slug: 'hoodies' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Footwear', slug: 'footwear' },
    ],
  });

  // 5. Fetch Categories after creation (needed to reference by ID)
  const allCategories = await prisma.category.findMany();

  // 6. Create Products associated with Categories
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Cool Cotton T-Shirt',
        description: 'A soft and breathable cotton t-shirt.',
        price: 499,
        stock: 10,
        categoryId: allCategories.find(cat => cat.slug === 't-shirts').id,
        productImages: {
          create: [
            { imageUrl: 'https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1728288912_4778247.jpg?format=webp&w=480&dpr=1.3' },
            { imageUrl: 'https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1728288912_1688005.jpg?format=webp&w=480&dpr=1.3' },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Black Panther: Wakanda Forever Hoodie',
        description: 'Shop for Black Panther: Wakanda Forever Men Oversized Hoodie Online.',
        price: 999,
        stock: 20,
        categoryId: allCategories.find(cat => cat.slug === 'hoodies').id,
        productImages: {
          create: [
            { imageUrl: 'https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1733484447_2823605.jpg?format=webp&w=480&dpr=1.3' },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Snapback: Black Panther',
        description: 'The easiest way to turn "just stepped out" into "stepped out in style". Let your personality shine through the only cap that matters.',
        price: 299,
        stock: 30,
        categoryId: allCategories.find(cat => cat.slug === 'accessories').id,
        productImages: {
          create: [
            { imageUrl: 'https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1742019917_5995411.gif?format=webp&w=480&dpr=1.3' },
          ],
        },
      },
    }),
  ]);

  // 7. Create a User with Firebase UID
  const user = await prisma.user.create({
    data: {
      email: 'test123@gmail.com',
      name: 'Test User',
      firebaseUid: 'Tev0w7R1o8MBGOXx8NDuW4X81Z03', // Use the Firebase UID you provided
    },
  });

  // 8. Create a Cart and Cart Items for the User
  const cart = await prisma.cart.create({
    data: {
      userId: user.id,
      cartItems: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
          },
          {
            productId: products[1].id,
            quantity: 1,
          },
        ],
      },
    },
  });

  // 9. Create an Order for the User
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: 1997, // (2 * 499 + 999)
      orderItems: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            priceAtPurchase: 499,
          },
          {
            productId: products[1].id,
            quantity: 1,
            priceAtPurchase: 999,
          },
        ],
      },
    },
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((error) => {
    console.error('🔥 Error seeding data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
