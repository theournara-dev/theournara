// src/modules/categories/categories.controller.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../../prisma/client';
import { sendSuccess, sendError } from '../../utils/response';

// Tree builder helper
function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
  return categories
    .filter(c => c.parentId === parentId)
    .map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      children: buildCategoryTree(categories, c.id)
    }));
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' }
    });
    const tree = buildCategoryTree(categories, null);
    return sendSuccess(res, tree, 'Categories tree retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findFirst({
      where: { slug, isDeleted: false },
      include: {
        children: { where: { isDeleted: false } },
        parent: true
      }
    });

    if (!category) {
      return sendError(res, [{ message: 'Category not found' }], 'Category not found', 404);
    }

    return sendSuccess(res, category, 'Category details retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug, parentId } = req.body;

    if (!name || !slug) {
      return sendError(res, [{ message: 'Name and slug are required' }], 'Validation failed', 400);
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
        isDeleted: false
      }
    });
    if (existing) {
      return sendError(res, [{ message: 'Category with this name or slug already exists' }], 'Duplicate category', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null
      }
    });

    return sendSuccess(res, category, 'Category created successfully', 211);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, slug, parentId } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      return sendError(res, [{ message: 'Category not found' }], 'Category not found', 404);
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        parentId: parentId !== undefined ? (parentId || null) : undefined
      }
    });

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      return sendError(res, [{ message: 'Category not found' }], 'Category not found', 404);
    }

    // Soft delete
    await prisma.category.update({
      where: { id },
      data: { isDeleted: true }
    });

    return sendSuccess(res, {}, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
}
