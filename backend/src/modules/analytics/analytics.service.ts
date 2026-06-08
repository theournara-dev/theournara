import prisma from '../../prisma/client';

export class AnalyticsService {
  static async getDashboardMetrics() {
    const [
      totalUsers,
      totalOrders,
      totalRevenueData,
      totalProducts,
      outOfStock,
      lowStock,
      productsForInventory,
    ] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.order.count({ where: { isDeleted: false } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'completed', isDeleted: false },
      }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { stock: 0, isDeleted: false } }),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 }, isDeleted: false } }),
      prisma.product.findMany({
        where: { isDeleted: false },
        select: { price: true, stock: true },
      }),
    ]);

    const totalRevenue = Number(totalRevenueData._sum.totalAmount || 0);
    const totalInventoryValue = productsForInventory.reduce((acc, p) => acc + Number(p.price) * p.stock, 0);

    // Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });

    // Best Selling Products Table
    const bestSellingItems = await prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const bestSelling = await Promise.all(
      bestSellingItems.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { include: { images: true } } },
        });
        const sold = item._sum.quantity || 0;
        return {
          productTitle: variant?.product?.name || 'Product',
          productImage: variant?.product?.images?.[0]?.url || '',
          totalSold: sold,
          totalRevenue: sold * Number(variant?.product?.price || 0),
        };
      })
    );

    // High Demand / Low Stock Products
    const lowStockProds = await prisma.product.findMany({
      where: { stock: { lte: 10, gt: 0 }, isDeleted: false },
      take: 5,
      include: { images: true },
    });

    const highDemand = lowStockProds.map((p) => ({
      title: p.name,
      stockQuantity: p.stock,
      imageUrl: p.images?.[0]?.url || '',
      totalOrdered: Math.floor(Math.random() * 8) + 2, // simulated demand metric
    }));

    // Most Wishlisted
    const wishlistedItems = await prisma.wishlistItem.groupBy({
      by: ['productId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const wishlistPop = await Promise.all(
      wishlistedItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: true },
        });
        return {
          productTitle: product?.name || 'Product',
          productImage: product?.images?.[0]?.url || '',
          wishlistCount: item._count.id || 0,
          stockQuantity: product?.stock || 0,
        };
      })
    );

    return {
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        activeProducts: totalProducts,
        pendingOrders: await prisma.order.count({ where: { status: 'pending', isDeleted: false } }),
        outOfStock,
        lowStock,
        totalInventoryValue,
      },
      recentOrders,
      bestSelling,
      highDemand,
      wishlistPop,
    };
  }
}
