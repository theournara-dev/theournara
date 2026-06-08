// src/modules/products/products.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import { sendSuccess, sendError } from '../../utils/response';
import prisma from '../../prisma/client';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as any;
    const result = await ProductsService.listProducts({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
    });
    return sendSuccess(res, result, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const product = await ProductsService.getProductBySlug(slug);
    return sendSuccess(res, product, 'Product details retrieved successfully');
  } catch (error: any) {
    return sendError(res, [{ message: error.message }], error.message, 404);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await ProductsService.createProduct(req.body);
    return sendSuccess(res, product, 'Product created successfully', 211);
  } catch (error: any) {
    return sendError(res, [{ message: error.message }], error.message, 400);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await ProductsService.updateProduct(id, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error: any) {
    console.error('Update Product Error:', error);
    return sendError(res, [{ message: error.message }], error.message, 400);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ProductsService.deleteProduct(id);
    return sendSuccess(res, {}, 'Product deleted successfully');
  } catch (error: any) {
    return sendError(res, [{ message: error.message }], error.message, 404);
  }
}

export async function listBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const brands = await prisma.brand.findMany({
      where: { isDeleted: false }
    });
    return sendSuccess(res, brands, 'Brands retrieved successfully');
  } catch (error) {
    next(error);
  }
}
