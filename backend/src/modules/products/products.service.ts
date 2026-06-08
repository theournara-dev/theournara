// src/modules/products/products.service.ts
import { Prisma } from '@prisma/client';
import prisma from '../../prisma/client';

export class ProductsService {
  static async listProducts(filters: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  }) {
    const { page, limit, search, category, brand, minPrice, maxPrice, sortBy } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    // Text search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Brand filter
    if (brand) {
      where.brand = {
        OR: [
          { id: brand },
          { name: { contains: brand, mode: 'insensitive' } }
        ]
      };
    }

    // Category filter
    if (category) {
      where.categories = {
        some: {
          category: {
            OR: [
              { id: category },
              { slug: category }
            ]
          }
        }
      };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: true,
          images: true,
          variants: {
            where: { isDeleted: false },
            include: { shades: { where: { isDeleted: false } } }
          },
          categories: {
            include: { category: true }
          },
          reviews: {
            where: { isDeleted: false },
            select: { rating: true }
          }
        }
      }),
      prisma.product.count({ where }),
    ]);

    // Format products to include review stats
    const formattedProducts = products.map((prod) => {
      const reviewCount = prod.reviews.length;
      const averageRating = reviewCount > 0
        ? prod.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

      return {
        ...prod,
        reviewCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
      };
    });

    return {
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      include: {
        brand: true,
        images: { where: { isDeleted: false } },
        videos: { where: { isDeleted: false } },
        categories: {
          include: { category: true }
        },
        variants: {
          where: { isDeleted: false },
          include: { shades: { where: { isDeleted: false } } }
        },
        reviews: {
          where: { isDeleted: false },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            votes: true
          }
        },
        questions: {
          where: { isDeleted: false },
          include: {
            user: { select: { id: true, firstName: true } },
            answers: {
              where: { isDeleted: false },
              include: { user: { select: { id: true, firstName: true } } }
            }
          }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const reviewCount = product.reviews.length;
    const averageRating = reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    return {
      ...product,
      reviewCount,
      averageRating: parseFloat(averageRating.toFixed(1)),
    };
  }

  static async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    brandId: string;
    categoryIds: string[];
    variants?: Array<{ name: string; sku: string; additionalPrice: number; stock: number }>;
    images?: Array<{ url: string; altText?: string }>;
    videos?: Array<{ url: string; thumbnail?: string }>;
  }) {
    // Check if slug is unique
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new Error('Product slug must be unique');
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        brandId: data.brandId,
        categories: {
          create: data.categoryIds.map(catId => ({
            categoryId: catId
          }))
        },
        variants: data.variants ? {
          create: data.variants.map(v => ({
            name: v.name,
            sku: v.sku,
            additionalPrice: v.additionalPrice,
            stock: v.stock
          }))
        } : undefined,
        images: data.images ? {
          create: data.images.map(img => ({
            url: img.url,
            altText: img.altText
          }))
        } : undefined,
        videos: data.videos ? {
          create: data.videos.map(vid => ({
            url: vid.url,
            thumbnail: vid.thumbnail
          }))
        } : undefined
      },
      include: {
        categories: { include: { category: true } },
        variants: true,
        images: true,
        videos: true
      }
    });

    return product;
  }

  static async updateProduct(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    brandId: string;
    categoryIds: string[];
    variants: Array<{ id?: string; name: string; sku: string; additionalPrice: number; stock: number }>;
    images: Array<{ url: string; altText?: string }>;
    videos: Array<{ url: string; thumbnail?: string }>;
  }>) {
    const { categoryIds, variants, images, videos, ...fields } = data;

    // Verify product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new Error('Product not found');
    }

    // Check slug uniqueness if updating slug
    if (fields.slug && fields.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug: fields.slug } });
      if (slugExists) {
        throw new Error('Product slug must be unique');
      }
    }

    const updateData: Prisma.ProductUpdateInput = { ...fields };

    if (categoryIds) {
      // Re-map categories
      updateData.categories = {
        deleteMany: {}, // Clear old categories
        create: categoryIds.map(catId => ({
          categoryId: catId
        }))
      };
    }

    // Perform inside a transaction to maintain consistency
    return await prisma.$transaction(async (tx) => {
      // 1. Process variants if provided
      if (variants) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id, isDeleted: false }
        });

        const payloadVariantIds = variants.map(v => v.id).filter(Boolean) as string[];

        // Soft delete variants that are not in the payload
        const variantsToSoftDelete = existingVariants.filter(v => !payloadVariantIds.includes(v.id));
        if (variantsToSoftDelete.length > 0) {
          await tx.productVariant.updateMany({
            where: { id: { in: variantsToSoftDelete.map(v => v.id) } },
            data: { isDeleted: true }
          });
        }

        // Upsert variants
        for (const v of variants) {
          const variantData = {
            name: v.name,
            sku: v.sku,
            additionalPrice: v.additionalPrice,
            stock: v.stock
          };

          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: variantData
            });
          } else {
            await tx.productVariant.create({
              data: {
                ...variantData,
                productId: id
              }
            });
          }
        }
      }

      // 2. Process images if provided
      if (images) {
        // Soft delete old images
        await tx.productImage.updateMany({
          where: { productId: id },
          data: { isDeleted: true }
        });

        // Create new ones
        for (const img of images) {
          await tx.productImage.create({
            data: {
              url: img.url,
              altText: img.altText,
              productId: id
            }
          });
        }
      }

      // 3. Process videos if provided
      if (videos) {
        // Soft delete old videos
        await tx.productVideo.updateMany({
          where: { productId: id },
          data: { isDeleted: true }
        });

        // Create new ones
        for (const vid of videos) {
          await tx.productVideo.create({
            data: {
              url: vid.url,
              thumbnail: vid.thumbnail,
              productId: id
            }
          });
        }
      }

      // 4. Update the core product details
      const product = await tx.product.update({
        where: { id },
        data: updateData,
        include: {
          categories: { include: { category: true } },
          variants: { where: { isDeleted: false } },
          images: { where: { isDeleted: false } },
          videos: { where: { isDeleted: false } }
        }
      });

      return product;
    });
  }

  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new Error('Product not found');
    }

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });

    return true;
  }
}
