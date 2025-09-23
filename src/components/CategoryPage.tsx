import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Eye,
  Save,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { categoriesAPI } from "../services/api";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  image?: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // Load categories on component mount
  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading categories from API...");

      const response = await categoriesAPI.getAll();
      console.log("Categories API response:", response);

      if (response.success) {
        const mappedCategories = response.data.map((apiCategory) => ({
          id: apiCategory._id || apiCategory.id,
          name: apiCategory.name,
          description: apiCategory.description || "",
          color: apiCategory.color || "#3B82F6",
          image: apiCategory.image || undefined,
          productCount: apiCategory.productCount || 0,
          createdAt: new Date(apiCategory.createdAt),
          updatedAt: new Date(apiCategory.updatedAt),
        }));
        console.log("Mapped categories:", mappedCategories);
        setCategories(mappedCategories);
      } else {
        setError(response.message || "Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Permission check - only Admin has full access
  const canEdit = user?.role === "admin";

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

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setEditSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const removeEditImage = () => {
    setEditSelectedImage(null);
    setEditImagePreview(null);
  };

  const handleAddCategory = async () => {
    if (newCategory.name && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);

        if (selectedImage) {
          // Use FormData for image upload
          const formData = new FormData();
          formData.append("name", newCategory.name);
          formData.append("description", newCategory.description);
          formData.append("color", newCategory.color);
          formData.append("image", selectedImage);

          console.log("Creating category with image...");
          const response = await categoriesAPI.createWithImage(formData);

          if (response.success) {
            await loadCategories(); // Reload categories list
            setNewCategory({ name: "", description: "", color: "#3B82F6" });
            setSelectedImage(null);
            setImagePreview(null);
            setShowAddModal(false);
          } else {
            setError(response.message || "Failed to create category");
          }
        } else {
          // Regular JSON request without image
          const categoryData = {
            name: newCategory.name,
            description: newCategory.description,
            color: newCategory.color,
          };

          console.log("Creating category without image:", categoryData);
          const response = await categoriesAPI.create(categoryData);

          if (response.success) {
            await loadCategories(); // Reload categories list
            setNewCategory({ name: "", description: "", color: "#3B82F6" });
            setShowAddModal(false);
          } else {
            setError(response.message || "Failed to create category");
          }
        }
      } catch (error) {
        console.error("Error creating category:", error);
        setError("Failed to create category. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditCategory = async () => {
    if (selectedCategory && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);

        if (editSelectedImage) {
          // Use FormData for image upload
          const formData = new FormData();
          formData.append("name", selectedCategory.name);
          formData.append("description", selectedCategory.description);
          formData.append("color", selectedCategory.color);
          formData.append("image", editSelectedImage);

          console.log("Updating category with image...");
          const response = await categoriesAPI.updateWithImage(
            selectedCategory.id,
            formData
          );

          if (response.success) {
            await loadCategories(); // Reload categories list
            setShowEditModal(false);
            setSelectedCategory(null);
            setEditSelectedImage(null);
            setEditImagePreview(null);
          } else {
            setError(response.message || "Failed to update category");
          }
        } else {
          // Regular JSON request without image
          const updateData = {
            name: selectedCategory.name,
            description: selectedCategory.description,
            color: selectedCategory.color,
          };

          console.log("Updating category without image:", updateData);
          const response = await categoriesAPI.update(
            selectedCategory.id,
            updateData
          );

          if (response.success) {
            await loadCategories(); // Reload categories list
            setShowEditModal(false);
            setSelectedCategory(null);
          } else {
            setError(response.message || "Failed to update category");
          }
        }
      } catch (error) {
        console.error("Error updating category:", error);
        setError("Failed to update category. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (canEdit && confirm(t("categories.delete.confirm"))) {
      try {
        setError(null);
        console.log("Deleting category:", id);

        const response = await categoriesAPI.delete(id);

        if (response.success) {
          await loadCategories(); // Reload categories list
        } else {
          setError(response.message || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        setError("Failed to delete category. Please try again.");
      }
    }
  };

  const colorOptions = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6B7280",
    "#14B8A6",
  ];

  // Statistics
  const totalCategories = categories.length;
  const totalProducts = categories.reduce(
    (sum, cat) => sum + cat.productCount,
    0
  );
  const avgProductsPerCategory =
    totalCategories > 0 ? Math.round(totalProducts / totalCategories) : 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("categories.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.categories")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("categories.title")}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className={`p-2 bg-blue-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("categories.stats.total")}
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {totalCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className={`p-2 bg-blue-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("categories.stats.products")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>

           <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className={`p-2 bg-blue-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">
                  {t("categories.stats.average")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgProductsPerCategory}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("categories.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{t("categories.add.category")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Category Image */}
              {category.image && (
                <div className="h-32 bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {canEdit ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setEditImagePreview(category.image || null);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title={t("categories.actions.edit")}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title={t("categories.actions.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditImagePreview(category.image || null);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                        title={t("categories.actions.view")}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {category.productCount} {t("categories.products")}
                  </span>
                  <span>
                    {t("categories.updated")}:{" "}
                    {category.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("categories.empty.title")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("categories.empty.subtitle")}
            </p>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("categories.add.title")}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setNewCategory({
                    name: "",
                    description: "",
                    color: "#3B82F6",
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("categories.form.image")}
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
                          title={t("categories.form.image.remove")}
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
                          {selectedImage
                            ? selectedImage.name
                            : t("categories.form.image.choose")}
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
                      {t("categories.form.image.help")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("categories.form.name")} *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("categories.form.name.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("categories.form.description")}
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("categories.form.description.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("categories.form.color")}
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setNewCategory((prev) => ({ ...prev, color }))
                      }
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color
                          ? "border-gray-400"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setNewCategory({
                      name: "",
                      description: "",
                      color: "#3B82F6",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("categories.form.cancel")}
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? t("categories.form.adding")
                    : t("categories.form.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/View Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {canEdit
                  ? t("categories.edit.title")
                  : t("categories.view.title")}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  setEditSelectedImage(null);
                  setEditImagePreview(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("categories.form.image")}
                </label>
                <div className="flex items-center space-x-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    {editImagePreview ? (
                      <div className="relative">
                        <img
                          src={editImagePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                        />
                        {canEdit && (
                          <button
                            onClick={removeEditImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title={t("categories.form.image.remove")}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  {canEdit && (
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {editSelectedImage
                              ? editSelectedImage.name
                              : t("categories.form.image.choose")}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {t("categories.form.image.help")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("categories.form.name")} *
                </label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedCategory((prev) =>
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
                  {t("categories.form.description")}
                </label>
                <textarea
                  value={selectedCategory.description}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedCategory((prev) =>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("categories.form.color")}
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={
                        canEdit
                          ? () =>
                              setSelectedCategory((prev) =>
                                prev ? { ...prev, color } : null
                              )
                          : undefined
                      }
                      disabled={!canEdit}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedCategory.color === color
                          ? "border-gray-400"
                          : "border-gray-200"
                      } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p>
                    {t("categories.info.products")}:{" "}
                    <span className="font-medium">
                      {selectedCategory.productCount}
                    </span>
                  </p>
                  <p>
                    {t("categories.info.created")}:{" "}
                    <span className="font-medium">
                      {selectedCategory.createdAt.toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    {t("categories.info.updated")}:{" "}
                    <span className="font-medium">
                      {selectedCategory.updatedAt.toLocaleDateString()}
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
                    setSelectedCategory(null);
                    setEditSelectedImage(null);
                    setEditImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("categories.form.cancel")}
                </button>
                {canEdit && (
                  <button
                    onClick={handleEditCategory}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? t("categories.form.saving")
                      : t("categories.form.save")}
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

export default CategoryPage;
