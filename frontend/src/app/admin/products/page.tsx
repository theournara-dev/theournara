'use client';

import React, { useState, useEffect } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus, Edit, Trash2, Loader2, Package, Tag,
  FolderOpen, FolderPlus, HelpCircle, AlertCircle
} from 'lucide-react';

export default function AdminProductsPage() {
  // Tabs: 'products' | 'categories'
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  
  // Brands & Categories state
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Modals / Form State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    brandId: '',
    categoryId: '',
    images: [] as any[],
    videos: [] as any[],
    variants: [] as any[]
  });
  const [newVariant, setNewVariant] = useState({ name: '', sku: '', additionalPrice: '0', stock: '0' });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const media = res.data.data;
        const mediaUrl = media.url;
        const isVideo = file.type.startsWith('video/');

        if (isVideo) {
          setProductForm(prev => ({
            ...prev,
            videos: [...prev.videos, { url: mediaUrl }]
          }));
        } else {
          setProductForm(prev => ({
            ...prev,
            images: [...prev.images, { url: mediaUrl }]
          }));
        }
      }
      alert('Media uploaded successfully! 🎉');
    } catch (err: any) {
      console.error('Failed to upload media', err);
      alert(err.response?.data?.message || 'Failed to upload media.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState('');

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, []);

  // Sync slug based on name in product form
  useEffect(() => {
    if (!editingProduct && productForm.name) {
      setProductForm(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  }, [productForm.name]);

  const fetchProducts = async (search = '') => {
    setProductsLoading(true);
    try {
      const res = await api.get('/products', {
        params: { search, limit: 100 }
      });
      // Handle the paginated result structure
      setProducts(res.data.data.products || res.data.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get('/products/brands');
      setBrands(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch brands', err);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.brandId || !productForm.categoryId) {
      alert('Please select a brand and category');
      return;
    }

    const payload = {
      name: productForm.name,
      slug: productForm.slug,
      description: productForm.description,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      brandId: productForm.brandId,
      categoryIds: [productForm.categoryId],
      variants: productForm.variants.map(v => ({
        id: v.id || undefined,
        name: v.name,
        sku: v.sku,
        additionalPrice: Number(v.additionalPrice),
        stock: Number(v.stock)
      })),
      images: productForm.images.map(img => ({ url: img.url })),
      videos: productForm.videos.map(vid => ({ url: vid.url }))
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        alert('Product updated successfully! 🎉');
      } else {
        await api.post('/products', payload);
        alert('Product created successfully! 🎉');
      }
      setProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Failed to save product', err);
      if (err.response?.data) {
        console.error('Server response data:', err.response.data);
      }
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const errorDetails = errors.map((e: any) => e.field ? `${e.field}: ${e.message}` : e.message).join('\n');
        alert(`Failed to save product:\n${errorDetails}`);
      } else {
        alert(err.response?.data?.message || 'Failed to save product. Check fields.');
      }
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      brandId: brands[0]?.id || '',
      categoryId: '',
      images: [],
      videos: [],
      variants: []
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: any) => {
    setEditingProduct(product);
    
    const catId = product.categories?.[0]?.categoryId || product.categories?.[0]?.category?.id || '';

    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      brandId: product.brandId || '',
      categoryId: catId,
      images: product.images || [],
      videos: product.videos || [],
      variants: product.variants || []
    });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  // Variants handlers
  const addVariantToForm = () => {
    if (!newVariant.name || !newVariant.sku) {
      alert('Variant name and SKU are required');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }]
    }));
    setNewVariant({ name: '', sku: '', additionalPrice: '0', stock: '0' });
  };

  const removeVariantFromForm = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Categories Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !newCategorySlug) return;
    
    const payload = {
      name: newCategoryName,
      slug: newCategorySlug,
      parentId: newCategoryParentId || null
    };

    try {
      await api.post('/categories', payload);
      alert('Category created successfully!');
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryParentId('');
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deleting this category will unlink it from products. Are you sure?')) return;
    try {
      await api.delete(`/categories/${id}`);
      alert('Category deleted successfully.');
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Render categories in a clean recursive list for tree view
  const renderCategoryNode = (cat: any) => {
    return (
      <div key={cat.id} className="pl-6 border-l-2 border-purple-100 mt-2 space-y-2">
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-purple-200 transition-colors">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-bold text-gray-800">{cat.name}</span>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">/{cat.slug}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
            onClick={() => handleDeleteCategory(cat.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {cat.children && cat.children.length > 0 && (
          <div className="space-y-1">
            {cat.children.map((child: any) => renderCategoryNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Flattened categories for selecting parents/dropdowns
  const getFlatCategories = (nodes: any[], depth = 0): any[] => {
    let list: any[] = [];
    nodes.forEach(node => {
      list.push({ id: node.id, name: `${'—'.repeat(depth)} ${node.name}` });
      if (node.children && node.children.length > 0) {
        list = [...list, ...getFlatCategories(node.children, depth + 1)];
      }
    });
    return list;
  };

  const flatCategories = getFlatCategories(categories);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Product Catalog</h1>
          <p className="text-xs text-gray-400 mt-1">Manage products, variants, brands, and categories</p>
        </div>
        
        {activeTab === 'products' && (
          <Button onClick={openAddProductModal} className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2">
            <Plus className="h-4.5 w-4.5" />
            Add Product
          </Button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
            activeTab === 'products'
              ? 'border-purple-950 text-purple-950'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all ${
            activeTab === 'categories'
              ? 'border-purple-950 text-purple-950'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Categories Tree
        </button>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">All Products</CardTitle>
                <CardDescription className="text-xs">Browse, edit or delete products from the list</CardDescription>
              </div>
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  fetchProducts(e.target.value);
                }}
                className="w-full sm:max-w-xs rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {productsLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="text-xs font-semibold">Loading catalog data...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400 font-semibold">
                No products found in the database.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Brand</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const imgUrl = product.images?.[0]?.url || '';
                    return (
                      <tr key={product.id} className="hover:bg-purple-50/10 transition-colors">
                        <td className="py-4 px-6">
                          <img
                            src={resolveMediaUrl(imgUrl, 80)}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover bg-gray-50 border"
                          />
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-800">
                          <p>{product.name}</p>
                          <span className="text-[10px] text-gray-400 font-medium">/{product.slug}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-500">
                          {product.brand?.name || 'Unknown'}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-purple-950">
                          ₹{Number(product.price).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            product.stock === 0
                              ? 'bg-red-50 text-red-600'
                              : product.stock <= 10
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditProductModal(product)}
                            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Category Form */}
          <div className="lg:col-span-1">
            <Card className="rounded-3xl border-gray-100 shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Create Category</CardTitle>
                <CardDescription className="text-xs">Add a new category or subcategory to taxonomy</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="catName" className="text-xs font-bold text-gray-700">Category Name</Label>
                    <Input
                      id="catName"
                      placeholder="e.g. Cleansers"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catSlug" className="text-xs font-bold text-gray-700">Slug URL path</Label>
                    <Input
                      id="catSlug"
                      placeholder="e.g. cleansers"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catParent" className="text-xs font-bold text-gray-700">Parent Category (Optional)</Label>
                    <select
                      id="catParent"
                      value={newCategoryParentId}
                      onChange={(e) => setNewCategoryParentId(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-purple-900"
                    >
                      <option value="">None (Top-Level Category)</option>
                      {flatCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-purple-950 text-white hover:bg-purple-900 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                    <FolderPlus className="h-4.5 w-4.5" />
                    Create Category
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tree View list */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Taxonomy Tree</CardTitle>
                <CardDescription className="text-xs">Visual breakdown of your category tree structures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoriesLoading ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="text-xs font-semibold">Loading hierarchy tree...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="py-20 text-center text-xs text-gray-400 font-semibold">
                    No categories have been created yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.filter(c => !c.parentId).map((topCat) => (
                      <div key={topCat.id} className="space-y-1">
                        <div className="flex items-center justify-between bg-purple-50/50 p-4 rounded-2xl border border-purple-100 shadow-sm hover:border-purple-200 transition-all">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5 text-purple-950" />
                            <span className="font-extrabold text-purple-950 text-sm">{topCat.name}</span>
                            <span className="text-[10px] text-purple-500 font-bold bg-white border border-purple-100 px-2 py-0.5 rounded-full">
                              /{topCat.slug}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            onClick={() => handleDeleteCategory(topCat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {topCat.children && topCat.children.map((child: any) => renderCategoryNode(child))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* PRODUCTS CREATE / EDIT DIALOG */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Form to manage catalog products, variants, and product media.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="prodName" className="text-xs font-bold text-gray-700">Product Name</Label>
                <Input
                  id="prodName"
                  placeholder="e.g. Hyaluronic Acid 2% + B5"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="prodSlug" className="text-xs font-bold text-gray-700">Slug path</Label>
                <Input
                  id="prodSlug"
                  placeholder="e.g. hyaluronic-acid-serum"
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prodDesc" className="text-xs font-bold text-gray-700">Description</Label>
              <textarea
                id="prodDesc"
                rows={3}
                placeholder="Detailed description of the product..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-purple-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="prodPrice" className="text-xs font-bold text-gray-700">Base Price (₹)</Label>
                <Input
                  id="prodPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="prodStock" className="text-xs font-bold text-gray-700">Base Stock quantity</Label>
                <Input
                  id="prodStock"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="prodBrand" className="text-xs font-bold text-gray-700">Brand</Label>
                <select
                  id="prodBrand"
                  value={productForm.brandId}
                  onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-purple-900"
                  required
                >
                  <option value="" disabled>Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="prodCategory" className="text-xs font-bold text-gray-700">Primary Category</Label>
                <select
                  id="prodCategory"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-purple-900"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {flatCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MEDIA UPLOAD SECTION */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                <FolderOpen className="h-4.5 w-4.5 text-purple-950" />
                Product Media (Images & Videos)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload box */}
                <div className="border-2 border-dashed border-gray-200 hover:border-purple-300 rounded-2xl p-6 text-center transition-colors relative flex flex-col items-center justify-center bg-gray-50/50 min-h-[120px]">
                  <input 
                    type="file" 
                    id="fileUpload" 
                    multiple 
                    accept="image/*,video/*"
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      <p className="text-xs font-semibold text-gray-500">Uploading media...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="h-8 w-8 text-gray-400" />
                      <p className="text-xs font-bold text-gray-600">Drag & drop or click to upload</p>
                      <p className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP, MP4 (Max 50MB)</p>
                    </div>
                  )}
                </div>

                {/* Manual input */}
                <div className="flex flex-col justify-center gap-2 border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                  <Label htmlFor="manualMedia" className="text-xs font-bold text-gray-700">Add Media by URL</Label>
                  <Input 
                    id="manualMedia" 
                    placeholder="e.g. /uploads/image.jpg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (!val) return;
                        const isVideo = val.endsWith('.mp4') || val.endsWith('.webm') || val.endsWith('.mov');
                        if (isVideo) {
                          setProductForm(prev => ({ ...prev, videos: [...prev.videos, { url: val }] }));
                        } else {
                          setProductForm(prev => ({ ...prev, images: [...prev.images, { url: val }] }));
                        }
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <p className="text-[10px] text-gray-400">Type URL path and press Enter to add manually.</p>
                </div>
              </div>

              {/* Preview grids */}
              {(productForm.images.length > 0 || productForm.videos.length > 0) && (
                <div className="space-y-4">
                  {/* Images list */}
                  {productForm.images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Images</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {productForm.images.map((img, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square bg-gray-50 flex items-center justify-center">
                            <img 
                              src={resolveMediaUrl(img.url)} 
                              alt="preview" 
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos list */}
                  {productForm.videos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Videos</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {productForm.videos.map((vid, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-black aspect-video flex items-center justify-center">
                            <video 
                              src={resolveMediaUrl(vid.url)} 
                              controls 
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* VARIANTS MANAGEMENT */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1">
                <Package className="h-4 w-4 text-purple-950" />
                Product Variants
              </h3>
              
              <div className="grid grid-cols-4 gap-2 items-end bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold text-gray-600">Name (e.g. 30ml bottle)</Label>
                  <Input
                    placeholder="30ml bottle"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-600">SKU code</Label>
                  <Input
                    placeholder="SKU-123"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-600">Addt. Price (₹)</Label>
                  <Input
                    type="number"
                    value={newVariant.additionalPrice}
                    onChange={(e) => setNewVariant({ ...newVariant, additionalPrice: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-3 space-y-1 mt-2">
                  <Label className="text-[10px] font-bold text-gray-600">Stock qty</Label>
                  <Input
                    type="number"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addVariantToForm}
                  className="bg-purple-950 text-white hover:bg-purple-900 h-8 text-xs font-bold rounded-xl mt-2 w-full flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              {productForm.variants.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {productForm.variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="text-xs">
                        <p className="font-bold text-gray-800">{v.name}</p>
                        <span className="text-[10px] text-gray-400">SKU: {v.sku} | Addt: ₹{v.additionalPrice} | Stock: {v.stock}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                        onClick={() => removeVariantFromForm(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-gray-100 pt-6">
              <Button type="submit" className="bg-purple-950 text-white hover:bg-purple-900 rounded-xl px-6 font-bold text-xs py-2.5">
                Save Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
