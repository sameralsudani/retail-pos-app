import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { productsAPI, categoriesAPI, suppliersAPI } from "../services/api";
import { Product } from "../types";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface InventoryItem extends Product {
  id: string;
  lastRestocked: Date;
  costPrice: number;
  reorderLevel: number;
}

const InventoryPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  console.log("🚀 ~ InventoryPage ~ inventory:", inventory)
  interface Category {
    _id: string;
    name: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  interface Supplier {
    _id: string;
    name: string;
    // Add other supplier fields if needed
  }
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form state
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    category: "",
    sku: "",
    stock: 0,
    costPrice: 0,
    reorderLevel: 10,
    supplier: "",
    description: "",
    image: "",
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load data on component mount
  const loadInitialData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([loadProducts(), loadCategories(), loadSuppliers()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();

      if (response.success) {
        interface ProductAPIResponse {
          _id?: string;
          id?: string;
          name: string;
          price: number;
          category?: { name: string } | string;
          sku: string;
          stock: number;
          image?: string;
          description?: string;
          costPrice?: number;
          reorderLevel?: number;
          supplier?: { name: string } | string;
          updatedAt?: string;
        }

        const products: InventoryItem[] = response.data.map(
          (product: ProductAPIResponse): InventoryItem => ({
            _id: product._id || "",
            id: product._id || product.id || "",
            name: product.name,
            price: product.price,
            category: (
              (product.category && typeof product.category === "object"
                ? product.category.name
                : product.category) || ""
            ).toLowerCase(),
            sku: product.sku,
            stock: product.stock,
            image:
              product.image ||
              "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300",
            description: product.description || "",
            costPrice: product.costPrice || product.price * 0.7,
            reorderLevel: product.reorderLevel || 10,
            supplier:
              (product.supplier && typeof product.supplier === "object"
                ? product.supplier.name
                : product.supplier) || "Unknown Supplier",
            lastRestocked: new Date(product.updatedAt || "2024-01-10"),
          })
        );
        setInventory(products);
      } else {
        setError("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Failed to load products");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const categoryOptions = [
    "all",
    ...new Set(inventory.map((item) => item.category)),
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && item.stock <= item.reorderLevel) ||
      (stockFilter === "out" && item.stock === 0) ||
      (stockFilter === "in" && item.stock > item.reorderLevel);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0)
      return {
        status: "out",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      };
    if (item.stock <= item.reorderLevel)
      return {
        status: "low",
        color: "bg-yellow-100 text-yellow-800",
        icon: TrendingDown,
      };
    return {
      status: "good",
      color: "bg-green-100 text-green-800",
      icon: TrendingUp,
    };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.sku && newItem.price && newItem.category) {
      try {
        setIsSubmitting(true);
        setError(null);

        // Find category ID
        const category = categories.find(
          (cat) => cat.name.toLowerCase() === newItem.category?.toLowerCase()
        );
        if (!category) {
          setError("Invalid category selected");
          return;
        }

        // Find supplier ID if supplier is selected
        let supplierId = undefined;
        if (newItem.supplier) {
          const supplier = suppliers.find(
            (sup) => sup.name.toLowerCase() === newItem.supplier?.toLowerCase()
          );
          supplierId = supplier?._id;
        }

        // Prepare form data for file upload
        const formData = new FormData();
        formData.append("name", newItem.name);
        formData.append("description", newItem.description || "");
        formData.append("price", newItem.price.toString());
        formData.append("costPrice", (newItem.costPrice || 0).toString());
        formData.append("category", category._id);
        formData.append("sku", newItem.sku);
        formData.append("stock", (newItem.stock || 0).toString());
        formData.append(
          "reorderLevel",
          (newItem.reorderLevel || 10).toString()
        );
        if (supplierId) {
          formData.append("supplier", supplierId);
        }
        if (selectedImage) {
          formData.append("image", selectedImage);
        }

        const response = await productsAPI.createWithImage(formData);

        if (response.success) {
          await loadProducts(); // Reload products
          setNewItem({
            name: "",
            price: 0,
            category: "",
            sku: "",
            stock: 0,
            costPrice: 0,
            reorderLevel: 10,
            supplier: "",
            description: "",
            image: "",
          });
          setSelectedImage(null);
          setImagePreview(null);
          setShowAddModal(false);
        } else {
          setError(response.message || "Failed to create product");
        }
      } catch (error) {
        console.error("Error creating product:", error);
        setError("Failed to create product. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditItem = async () => {
    if (selectedItem && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);

        // Find category ID if category changed
        let categoryId = selectedItem.category;
        if (typeof selectedItem.category === "string") {
          const category = categories.find(
            (cat) =>
              cat.name.toLowerCase() === selectedItem.category.toLowerCase()
          );
          categoryId = category?._id || selectedItem.category;
        }

        const updateData = {
          name: selectedItem.name,
          description: selectedItem.description,
          price: selectedItem.price,
          costPrice: selectedItem.costPrice,
          stock: selectedItem.stock,
          reorderLevel: selectedItem.reorderLevel,
          category: categoryId,
        };

        const response = await productsAPI.update(selectedItem.id, updateData);

        if (response.success) {
          await loadProducts(); // Reload products
          setShowEditModal(false);
          setSelectedItem(null);
        } else {
          setError(response.message || "Failed to update product");
        }
      } catch (error) {
        console.error("Error updating product:", error);
        setError("Failed to update product. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (canEdit && confirm(t("inventory.delete.confirm"))) {
      try {
        setError(null);
        const response = await productsAPI.delete(id);

        if (response.success) {
          await loadProducts(); // Reload products
        } else {
          setError(response.message || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Failed to delete product. Please try again.");
      }
    }
  };

  // Statistics
  const totalItems = inventory.length;
  console.log("🚀 ~ InventoryPage ~ totalItems:", totalItems)
  const lowStockItems = inventory.filter(
    (item) => item.stock <= item.reorderLevel
  ).length;
  const outOfStockItems = inventory.filter((item) => item.stock === 0).length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.price * item.stock,
    0
  );

  // Check if user has write permissions (Admin or Manager only)
  const canEdit = user?.role === "admin" || user?.role === "manager";

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("inventory.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.inventory")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("inventory.title")}
      />

      <div className="p-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-2 bg-blue-100 rounded-lg ${document.documentElement.dir === 'rtl' ? 'mr-4' : 'ml-4'}`}> 
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("inventory.stats.total.items")}
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-2 bg-yellow-100 rounded-lg ${document.documentElement.dir === 'rtl' ? 'mr-4' : 'ml-4'}`}> 
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("inventory.stats.low.stock")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {lowStockItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-2 bg-red-100 rounded-lg ${document.documentElement.dir === 'rtl' ? 'mr-4' : 'ml-4'}`}> 
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("inventory.stats.out.of.stock")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {outOfStockItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-2 bg-green-100 rounded-lg ${document.documentElement.dir === 'rtl' ? 'mr-4' : 'ml-4'}`}>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("inventory.stats.total.value")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("inventory.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">
                    {t("inventory.filter.all.categories")}
                  </option>
                  {categoryOptions
                    .filter((cat) => cat !== "all")
                    .map((category) => (
                      <option key={category} value={category}>
                        {t(`category.${category.toLowerCase()}`)}
                      </option>
                    ))}
                </select>
              </div>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("inventory.filter.all.stock")}</option>
                <option value="in">{t("inventory.filter.in.stock")}</option>
                <option value="low">{t("inventory.filter.low.stock")}</option>
                <option value="out">
                  {t("inventory.filter.out.of.stock")}
                </option>
              </select>

              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t("inventory.add.item")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.product")}
                  </th>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.sku")}
                  </th>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.category")}
                  </th>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.stock")}
                  </th>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.price")}
                  </th>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.supplier")}
                  </th>
                  <th className="w-48 ltr:pl-6 rtl:pr-6 ltr:text-left rtl:text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const StatusIcon = stockStatus.icon;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="w-48 ltr:pl-6 rtl:pr-6 py-4 whitespace-nowrap">
                        <div className="flex items-center ltr:flex-row rtl:flex-row-reverse rtl:justify-end">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover mx-3 ltr:order-1 rtl:order-2"
                          />
                          <div className="ltr:ml-3 rtl:mr-3 ltr:order-2 rtl:order-1">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="w-48 ltr:pl-6 rtl:pr-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {item.sku}
                        </div>
                      </td>
                      <td className="w-48 ltr:pl-6 rtl:pr-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {t(`category.${item.category}`)}
                        </span>
                      </td>
                      <td className="w-48 ltr:pl-6 rtl:pr-6 py-4 whitespace-nowrap">
                        <div className="flex items-center ltr:space-x-2 rtl:space-x-reverse">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span>{item.stock}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            / {item.reorderLevel}
                          </span>
                        </div>
                      </td>
                      <td className="w-48 ltr:pl-6 rtl:pr-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cost: ${item.costPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="w-48 ltr:pl-6 rtl:pr-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.supplier}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t("inventory.last.restocked")}: {item.lastRestocked.toLocaleDateString()}
                        </div>
                      </td>
                      {/* Actions */}
                    <td className="w-48 py-4 whitespace-nowrap text-sm font-medium ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <div className="flex items-center ltr:space-x-2 rtl:space-x-reverse rtl:space-x-2 ltr:flex-row rtl:flex-row-reverse rtl:justify-end">
                        {canEdit ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowEditModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                title={t("inventory.actions.edit")}
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                title={t("inventory.actions.delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowEditModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                              title={t("inventory.actions.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("inventory.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("inventory.empty.subtitle")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("inventory.add.title")}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setNewItem({
                    name: "",
                    price: 0,
                    category: "",
                    sku: "",
                    stock: 0,
                    costPrice: 0,
                    reorderLevel: 10,
                    supplier: "",
                    description: "",
                    image: "",
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("inventory.form.image")}
                </label>
                <div className="flex items-center space-x-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title={t("inventory.form.image.remove")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {selectedImage ? selectedImage.name : "Choose image"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("inventory.form.image.help")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.name")} *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("inventory.form.name.placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.sku")} *
                  </label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("inventory.form.sku.placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.category")} *
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t("inventory.form.select.category")}
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category._id}
                        value={category.name.toLowerCase()}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.supplier")}
                  </label>
                  <select
                    value={newItem.supplier}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t("inventory.form.select.supplier")}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.cost.price")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.costPrice}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        costPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.selling.price")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.stock")} *
                  </label>
                  <input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.reorder.level")} *
                  </label>
                  <input
                    type="number"
                    value={newItem.reorderLevel}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        reorderLevel: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.form.description")}
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("inventory.form.description.placeholder")}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setNewItem({
                      name: "",
                      price: 0,
                      category: "",
                      sku: "",
                      stock: 0,
                      costPrice: 0,
                      reorderLevel: 10,
                      supplier: "",
                      description: "",
                      image: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("inventory.form.cancel")}
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={
                    !newItem.name ||
                    !newItem.sku ||
                    !newItem.price ||
                    !newItem.category ||
                    isSubmitting
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? t("inventory.form.adding")
                    : t("inventory.form.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {canEdit
                  ? t("inventory.edit.title")
                  : t("inventory.view.title")}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.name")} *
                  </label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={
                      canEdit
                        ? (e) =>
                            setSelectedItem((prev) =>
                              prev ? { ...prev, name: e.target.value } : null
                            )
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.sku")} *
                  </label>
                  <input
                    type="text"
                    value={selectedItem.sku}
                    onChange={
                      canEdit
                        ? (e) =>
                            setSelectedItem((prev) =>
                              prev ? { ...prev, sku: e.target.value } : null
                            )
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.stock")} *
                  </label>
                  <input
                    type="number"
                    value={selectedItem.stock}
                    onChange={
                      canEdit
                        ? (e) =>
                            setSelectedItem((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    stock: parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.selling.price")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedItem.price}
                    onChange={
                      canEdit
                        ? (e) =>
                            setSelectedItem((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    price: parseFloat(e.target.value) || 0,
                                  }
                                : null
                            )
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.cost.price")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedItem.costPrice}
                    onChange={
                      canEdit
                        ? (e) =>
                            setSelectedItem((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    costPrice: parseFloat(e.target.value) || 0,
                                  }
                                : null
                            )
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.reorder.level")}
                  </label>
                  <input
                    type="number"
                    value={selectedItem.reorderLevel}
                    onChange={
                      canEdit
                        ? (e) =>
                            setSelectedItem((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    reorderLevel: parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                        : undefined
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.form.description")}
                </label>
                <textarea
                  value={selectedItem.description}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedItem((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null
                          )
                      : undefined
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p>
                    {t("inventory.info.supplier")}:{" "}
                    <span className="font-medium">{selectedItem.supplier}</span>
                  </p>
                  <p>
                    {t("inventory.info.last.restocked")}:{" "}
                    <span className="font-medium">
                      {selectedItem.lastRestocked.toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    {t("inventory.info.created")}:{" "}
                    <span className="font-medium">
                      {selectedItem.lastRestocked.toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("inventory.form.cancel")}
                </button>
                {canEdit && (
                  <button
                    onClick={handleEditItem}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? t("inventory.form.saving")
                      : t("inventory.form.save")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default InventoryPage;
