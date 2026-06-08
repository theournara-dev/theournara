"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.getCategoryBySlug = getCategoryBySlug;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const client_1 = __importDefault(require("../../prisma/client"));
const response_1 = require("../../utils/response");
// Tree builder helper
function buildCategoryTree(categories, parentId = null) {
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
async function listCategories(req, res, next) {
    try {
        const categories = await client_1.default.category.findMany({
            where: { isDeleted: false },
            orderBy: { name: 'asc' }
        });
        const tree = buildCategoryTree(categories, null);
        return (0, response_1.sendSuccess)(res, tree, 'Categories tree retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function getCategoryBySlug(req, res, next) {
    try {
        const { slug } = req.params;
        const category = await client_1.default.category.findFirst({
            where: { slug, isDeleted: false },
            include: {
                children: { where: { isDeleted: false } },
                parent: true
            }
        });
        if (!category) {
            return (0, response_1.sendError)(res, [{ message: 'Category not found' }], 'Category not found', 404);
        }
        return (0, response_1.sendSuccess)(res, category, 'Category details retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
async function createCategory(req, res, next) {
    try {
        const { name, slug, parentId } = req.body;
        if (!name || !slug) {
            return (0, response_1.sendError)(res, [{ message: 'Name and slug are required' }], 'Validation failed', 400);
        }
        const existing = await client_1.default.category.findFirst({
            where: {
                OR: [{ name }, { slug }],
                isDeleted: false
            }
        });
        if (existing) {
            return (0, response_1.sendError)(res, [{ message: 'Category with this name or slug already exists' }], 'Duplicate category', 400);
        }
        const category = await client_1.default.category.create({
            data: {
                name,
                slug,
                parentId: parentId || null
            }
        });
        return (0, response_1.sendSuccess)(res, category, 'Category created successfully', 211);
    }
    catch (error) {
        next(error);
    }
}
async function updateCategory(req, res, next) {
    try {
        const { id } = req.params;
        const { name, slug, parentId } = req.body;
        const existing = await client_1.default.category.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Category not found' }], 'Category not found', 404);
        }
        const category = await client_1.default.category.update({
            where: { id },
            data: {
                name: name || undefined,
                slug: slug || undefined,
                parentId: parentId !== undefined ? (parentId || null) : undefined
            }
        });
        return (0, response_1.sendSuccess)(res, category, 'Category updated successfully');
    }
    catch (error) {
        next(error);
    }
}
async function deleteCategory(req, res, next) {
    try {
        const { id } = req.params;
        const existing = await client_1.default.category.findUnique({ where: { id } });
        if (!existing || existing.isDeleted) {
            return (0, response_1.sendError)(res, [{ message: 'Category not found' }], 'Category not found', 404);
        }
        // Soft delete
        await client_1.default.category.update({
            where: { id },
            data: { isDeleted: true }
        });
        return (0, response_1.sendSuccess)(res, {}, 'Category deleted successfully');
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=categories.controller.js.map