// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // 1. Roles
  console.log('Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'End customer user account',
    },
  });

  // 2. Admin User
  console.log('Seeding default Admin user...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@theournara.com' },
    update: {},
    create: {
      email: 'admin@theournara.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
    },
  });

  // Link Admin user to Admin Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 3. Brands
  console.log('Seeding brands...');
  const brand1 = await prisma.brand.upsert({
    where: { name: 'The Ordinary' },
    update: {},
    create: { name: 'The Ordinary', logoUrl: '/uploads/brands/ordinary.png' },
  });

  const brand2 = await prisma.brand.upsert({
    where: { name: 'CeraVe' },
    update: {},
    create: { name: 'CeraVe', logoUrl: '/uploads/brands/cerave.png' },
  });

  const brand3 = await prisma.brand.upsert({
    where: { name: 'Laneige' },
    update: {},
    create: { name: 'Laneige', logoUrl: '/uploads/brands/laneige.png' },
  });

  // 4. Categories
  console.log('Seeding categories...');
  const skincare = await prisma.category.upsert({
    where: { name: 'Skincare' },
    update: {},
    create: { name: 'Skincare', slug: 'skincare' },
  });

  const moisturizers = await prisma.category.upsert({
    where: { name: 'Moisturizers' },
    update: {},
    create: {
      name: 'Moisturizers',
      slug: 'moisturizers',
      parentId: skincare.id,
    },
  });

  const cleansers = await prisma.category.upsert({
    where: { name: 'Cleansers' },
    update: {},
    create: {
      name: 'Cleansers',
      slug: 'cleansers',
      parentId: skincare.id,
    },
  });

  const serums = await prisma.category.upsert({
    where: { name: 'Serums' },
    update: {},
    create: {
      name: 'Serums',
      slug: 'serums',
      parentId: skincare.id,
    },
  });

  // 5. Products & Variants
  console.log('Seeding products, variants and shades...');
  const prod1 = await prisma.product.upsert({
    where: { slug: 'hyaluronic-acid-serum' },
    update: {},
    create: {
      name: 'Hyaluronic Acid 2% + B5',
      slug: 'hyaluronic-acid-serum',
      description: 'A hydrating serum with ultra-pure, vegan hyaluronic acid.',
      price: 9.99,
      stock: 120,
      brandId: brand1.id,
    },
  });

  await prisma.categoryProduct.upsert({
    where: {
      categoryId_productId: {
        categoryId: serums.id,
        productId: prod1.id,
      },
    },
    update: {},
    create: {
      categoryId: serums.id,
      productId: prod1.id,
    },
  });

  const variant1_1 = await prisma.productVariant.upsert({
    where: { sku: 'ORD-HA-30' },
    update: {},
    create: {
      productId: prod1.id,
      sku: 'ORD-HA-30',
      name: '30ml bottle',
      additionalPrice: 0.00,
      stock: 80,
    },
  });

  const variant1_2 = await prisma.productVariant.upsert({
    where: { sku: 'ORD-HA-60' },
    update: {},
    create: {
      productId: prod1.id,
      sku: 'ORD-HA-60',
      name: '60ml bottle',
      additionalPrice: 7.00,
      stock: 40,
    },
  });

  const prod2 = await prisma.product.upsert({
    where: { slug: 'cerave-moisturizing-cream' },
    update: {},
    create: {
      name: 'Moisturizing Cream',
      slug: 'cerave-moisturizing-cream',
      description: 'A rich cream that provides 24-hour hydration and helps restore the protective skin barrier.',
      price: 15.99,
      stock: 200,
      brandId: brand2.id,
    },
  });

  await prisma.categoryProduct.upsert({
    where: {
      categoryId_productId: {
        categoryId: moisturizers.id,
        productId: prod2.id,
      },
    },
    update: {},
    create: {
      categoryId: moisturizers.id,
      productId: prod2.id,
    },
  });

  const variant2_1 = await prisma.productVariant.upsert({
    where: { sku: 'CRV-MC-454' },
    update: {},
    create: {
      productId: prod2.id,
      sku: 'CRV-MC-454',
      name: '454g tub',
      additionalPrice: 0.00,
      stock: 150,
    },
  });

  const variant2_2 = await prisma.productVariant.upsert({
    where: { sku: 'CRV-MC-177' },
    update: {},
    create: {
      productId: prod2.id,
      sku: 'CRV-MC-177',
      name: '177ml tube',
      additionalPrice: -4.50,
      stock: 50,
    },
  });

  // 6. Skin Quiz Questions
  console.log('Seeding Skin Quiz...');
  const quizQ1 = await prisma.skinQuizQuestion.create({
    data: {
      question: 'What is your primary skin type?',
      options: {
        create: [
          { text: 'Extremely dry, tight or flaky', value: 'dry' },
          { text: 'Greasy, shiny, prone to breakout', value: 'oily' },
          { text: 'Combines oily areas (T-zone) with dry patches', value: 'combination' },
          { text: 'Balanced, smooth, with no major concerns', value: 'normal' },
        ],
      },
    },
  });

  const quizQ2 = await prisma.skinQuizQuestion.create({
    data: {
      question: 'What is your main skin concern?',
      options: {
        create: [
          { text: 'Acne, blackheads, or enlarged pores', value: 'acne' },
          { text: 'Fine lines, wrinkles, or sagging skin', value: 'aging' },
          { text: 'Redness, irritation, or general sensitivity', value: 'sensitive' },
          { text: 'Dark spots, hyperpigmentation, or dullness', value: 'pigmentation' },
        ],
      },
    },
  });

  // 7. Coupons & Offers
  console.log('Seeding coupons & offers...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10.00,
      usageLimit: 500,
      minOrderValue: 20.00,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT15' },
    update: {},
    create: {
      code: 'FLAT15',
      discountType: 'amount',
      discountValue: 15.00,
      usageLimit: 100,
      minOrderValue: 50.00,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
