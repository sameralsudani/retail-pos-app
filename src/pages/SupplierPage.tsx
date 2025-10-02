import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Truck, Eye, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { suppliersAPI } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  productCount?: number;
  status: 'active' | 'inactive';
  paymentTerms: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // State management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentTerms: 'Net 30',
  });

  // Load suppliers on component mount
  React.useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading suppliers from API...');
      
      const response = await suppliersAPI.getAll();
      console.log('Suppliers API response:', response);
      
      if (response.success) {
        interface ApiSupplier {
          _id?: string;
          id?: string;
          name: string;
          contactPerson: string;
          email: string;
          phone: string;
          address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
          };
          productCount?: number;
          isActive: boolean;
          paymentTerms?: string;
          createdAt: string;
          updatedAt: string;
        }

        const mappedSuppliers = response.data.map((apiSupplier: ApiSupplier) => ({
          id: apiSupplier._id || apiSupplier.id,
          name: apiSupplier.name,
          contactPerson: apiSupplier.contactPerson,
          email: apiSupplier.email,
          phone: apiSupplier.phone,
          address: apiSupplier.address || {},
          productCount: apiSupplier.productCount || 0,
          status: apiSupplier.isActive ? 'active' : 'inactive' as 'active' | 'inactive',
          paymentTerms: apiSupplier.paymentTerms || 'Net 30',
          createdAt: new Date(apiSupplier.createdAt),
          updatedAt: new Date(apiSupplier.updatedAt)
        }));
        console.log('Mapped suppliers:', mappedSuppliers);
        setSuppliers(mappedSuppliers);
      } else {
        setError(response.message || 'Failed to load suppliers');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Permission check - only Admin has full access
  const canEdit = user?.role === 'admin';

  const handleAddSupplier = async () => {
    if (newSupplier.name && newSupplier.contactPerson && newSupplier.email && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const supplierData = {
          name: newSupplier.name,
          contactPerson: newSupplier.contactPerson,
          email: newSupplier.email,
          phone: newSupplier.phone,
          address: {
            street: newSupplier.street,
            city: newSupplier.city,
            state: newSupplier.state,
            zipCode: newSupplier.zipCode,
            country: newSupplier.country
          },
          paymentTerms: newSupplier.paymentTerms
        };
        
        console.log('Creating supplier with data:', supplierData);
        const response = await suppliersAPI.create(supplierData);
        
        if (response.success) {
          await loadSuppliers(); // Reload suppliers list
          setNewSupplier({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            paymentTerms: 'Net 30'
          });
          setShowAddModal(false);
        } else {
          setError(response.message || 'Failed to create supplier');
        }
      } catch (error) {
        console.error('Error creating supplier:', error);
        setError('Failed to create supplier. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditSupplier = async () => {
    if (selectedSupplier && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const updateData = {
          name: selectedSupplier.name,
          contactPerson: selectedSupplier.contactPerson,
          email: selectedSupplier.email,
          phone: selectedSupplier.phone,
          address: selectedSupplier.address,
          paymentTerms: selectedSupplier.paymentTerms,
          isActive: selectedSupplier.status === 'active'
        };
        
        console.log('Updating supplier with data:', updateData);
        const response = await suppliersAPI.update(selectedSupplier.id, updateData);
        
        if (response.success) {
          await loadSuppliers(); // Reload suppliers list
          setShowEditModal(false);
          setSelectedSupplier(null);
        } else {
          setError(response.message || 'Failed to update supplier');
        }
      } catch (error) {
        console.error('Error updating supplier:', error);
        setError('Failed to update supplier. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (canEdit && confirm(t('suppliers.delete.confirm'))) {
      try {
        setError(null);
        console.log('Deleting supplier:', id);
        
        const response = await suppliersAPI.delete(id);
        
        if (response.success) {
          await loadSuppliers(); // Reload suppliers list
        } else {
          setError(response.message || 'Failed to delete supplier');
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        setError('Failed to delete supplier. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Statistics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalProducts = suppliers.reduce((sum, s) => sum + (s.productCount || 0), 0);
  const avgProductsPerSupplier = totalSuppliers > 0 ? Math.round(totalProducts / totalSuppliers) : 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onMenuClick={() => setShowSidebar(true)} 
          title={t('suppliers.title')}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading.suppliers')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('suppliers.title')}
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('suppliers.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('suppliers.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900">{activeSuppliers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('suppliers.stats.products')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('suppliers.stats.average')}</p>
                <p className="text-2xl font-bold text-gray-900">{avgProductsPerSupplier}</p>
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
                placeholder={t('suppliers.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('suppliers.filter.all.status')}</option>
                <option value="active">{t('suppliers.status.active')}</option>
                <option value="inactive">{t('suppliers.status.inactive')}</option>
              </select>

              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('suppliers.add.supplier')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('suppliers.table.supplier')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('suppliers.table.contact')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('suppliers.table.location')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('suppliers.table.products')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('suppliers.table.status')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('suppliers.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.paymentTerms}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                      <div className="text-sm text-gray-500">{supplier.email}</div>
                      <div className="text-sm text-gray-500">{supplier.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.address?.city || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{supplier.address?.country || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.productCount || 0}</div>
                      <div className="text-sm text-gray-500">{t('suppliers.products.supplied')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(supplier.status)}`}>
                        {t(`suppliers.status.${supplier.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {canEdit ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title={t('suppliers.actions.edit')}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title={t('suppliers.actions.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setShowEditModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                            title={t('suppliers.actions.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('suppliers.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('suppliers.empty.subtitle')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{t('suppliers.add.title')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.name')} *
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.name.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.contact.person')} *
                  </label>
                  <input
                    type="text"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.contact.person.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.email')} *
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.email.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.phone.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.address')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.street}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.address.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.state')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.state}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.state.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.zip.code')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.zipCode}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.zip.code.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.city')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.city}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.city.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.country')}
                  </label>
                  <input
                    type="text"
                    value={newSupplier.country}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('suppliers.form.country.placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.payment.terms')}
                  </label>
                  <select
                    value={newSupplier.paymentTerms}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('suppliers.form.cancel')}
                </button>
                <button
                  onClick={handleAddSupplier}
                  disabled={!newSupplier.name || !newSupplier.contactPerson || !newSupplier.email || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t('suppliers.form.adding') : t('suppliers.form.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/View Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {canEdit ? t('suppliers.edit.title') : t('suppliers.view.title')}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSupplier(null);
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
                    {t('suppliers.form.name')} *
                  </label>
                  <input
                    type="text"
                    value={selectedSupplier.name}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, name: e.target.value }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.contact.person')} *
                  </label>
                  <input
                    type="text"
                    value={selectedSupplier.contactPerson}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, contactPerson: e.target.value }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.email')} *
                  </label>
                  <input
                    type="email"
                    value={selectedSupplier.email}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, email: e.target.value }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={selectedSupplier.phone}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, phone: e.target.value }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.city')}
                  </label>
                  <input
                    type="text"
                    value={selectedSupplier.address?.city || ''}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.country')}
                  </label>
                  <input
                    type="text"
                    value={selectedSupplier.address?.country || ''}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ 
                      ...prev, 
                      address: { ...prev.address, country: e.target.value }
                    }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.payment.terms')}
                  </label>
                  <select
                    value={selectedSupplier.paymentTerms}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, paymentTerms: e.target.value }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">COD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.status')}
                  </label>
                  <select
                    value={selectedSupplier.status}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, status: e.target.value as 'active' | 'inactive' }) : null) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!canEdit}
                  >
                    <option value="active">{t('suppliers.status.active')}</option>
                    <option value="inactive">{t('suppliers.status.inactive')}</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p>{t('suppliers.info.products.supplied')}: <span className="font-medium">{selectedSupplier.productCount || 0}</span></p>
                  <p>{t('suppliers.info.created')}: <span className="font-medium">{selectedSupplier.createdAt.toLocaleDateString()}</span></p>
                  <p>{t('suppliers.info.updated')}: <span className="font-medium">{selectedSupplier.updatedAt.toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSupplier(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('suppliers.form.cancel')}
                </button>
                {canEdit && (
                  <button
                    onClick={handleEditSupplier}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isSubmitting ? t('suppliers.form.saving') : t('suppliers.form.save')}
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

export default SupplierPage;