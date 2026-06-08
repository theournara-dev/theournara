import prisma from './prisma/client';

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true, categories: { include: { category: true } } }
  });
  console.log("=== DB PRODUCTS ===");
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
