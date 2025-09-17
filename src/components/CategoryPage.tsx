import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Tag, Eye, Save, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Sample categories data
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Beverages',
      description: 'Hot and cold drinks, coffee, tea, juices',
      color: '#3B82F6',
      productCount: 15,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Bakery',
      description: 'Fresh bread, pastries, and baked goods',
      color: '#F59E0B',
      productCount: 8,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Electronics',
      description: 'Phones, accessories, and electronic devices',
      color: '#8B5CF6',
      productCount: 12,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '4',
      name: 'Produce',
      description: 'Fresh fruits and vegetables',
      color: '#10B981',
      productCount: 25,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '5',
      name: 'Stationery',
      description: 'Office supplies, pens, notebooks',
      color: '#EF4444',
      productCount: 18,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: '6',
      name: 'Clothing',
      description: 'Apparel and fashion items',
      color: '#EC4899',
      productCount: 22,
      createdAt: new Date('2024-01-06'),
      updatedAt: new Date('2024-01-25')
    }
  ]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Permission check - only Admin has full access
  const canEdit = user?.role === 'admin';

  const handleAddCategory = () => {
    if (newCategory.name && canEdit) {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCategories(prev => [...prev, category]);
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      setShowAddModal(false);
    }
  };

  const handleEditCategory = () => {
    if (selectedCategory && canEdit) {
      setCategories(prev => prev.map(cat =>
        cat.id === selectedCategory.id 
          ? { ...selectedCategory, updatedAt: new Date() }
          : cat
      ));
      setShowEditModal(false);
      setSelectedCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (canEdit && confirm(t('categories.delete.confirm'))) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ];

  // Statistics
  const totalCategories = categories.length;
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const avgProductsPerCategory = Math.round(totalProducts / totalCategories);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('categories.title')}
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.products')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.average')}</p>
                <p className="text-2xl font-bold text-gray-900">{avgProductsPerCategory}</p>
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
                placeholder={t('categories.search.placeholder')}
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
                <span>{t('categories.add.category')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    {canEdit ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title={t('categories.actions.edit')}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title={t('categories.actions.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                        title={t('categories.actions.view')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{category.productCount} {t('categories.products')}</span>
                  <span>{t('categories.updated')}: {category.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('categories.empty.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('categories.empty.subtitle')}</p>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{t('categories.add.title')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categories.form.name')} *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('categories.form.name.placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categories.form.description')}
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('categories.form.description.placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('categories.form.color')}
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color ? 'border-gray-400' : 'border-gray-200'
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('categories.form.cancel')}
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t('categories.form.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/View Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {canEdit ? t('categories.edit.title') : t('categories.view.title')}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categories.form.name')} *
                </label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  onChange={canEdit ? (e) => setSelectedCategory(prev => prev ? ({ ...prev, name: e.target.value }) : null) : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categories.form.description')}
                </label>
                <textarea
                  value={selectedCategory.description}
                  onChange={canEdit ? (e) => setSelectedCategory(prev => prev ? ({ ...prev, description: e.target.value }) : null) : undefined}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('categories.form.color')}
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={canEdit ? () => setSelectedCategory(prev => prev ? ({ ...prev, color }) : null) : undefined}
                      disabled={!canEdit}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedCategory.color === color ? 'border-gray-400' : 'border-gray-200'
                      } ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p>{t('categories.info.products')}: <span className="font-medium">{selectedCategory.productCount}</span></p>
                  <p>{t('categories.info.created')}: <span className="font-medium">{selectedCategory.createdAt.toLocaleDateString()}</span></p>
                  <p>{t('categories.info.updated')}: <span className="font-medium">{selectedCategory.updatedAt.toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('categories.form.cancel')}
                </button>
                {canEdit && (
                  <button
                    onClick={handleEditCategory}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('categories.form.save')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
};

export default CategoryPage;