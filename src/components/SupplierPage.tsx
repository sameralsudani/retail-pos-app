import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Truck, Eye, Save, X, AlertTriangle, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  productsSupplied: number;
  status: 'active' | 'inactive';
  paymentTerms: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
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
    address: '',
    city: '',
    country: '',
    paymentTerms: 'Net 30',
    status: 'active' as 'active' | 'inactive'
  });

  // Sample suppliers data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Fresh Foods Co.',
      contactPerson: 'John Smith',
      email: 'john@freshfoods.com',
      phone: '(555) 123-4567',
      address: '123 Supply Street',
      city: 'New York',
      country: 'USA',
      productsSupplied: 45,
      status: 'active',
      paymentTerms: 'Net 30',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Tech Solutions Ltd.',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@techsolutions.com',
      phone: '(555) 987-6543',
      address: '456 Technology Ave',
      city: 'San Francisco',
      country: 'USA',
      productsSupplied: 28,
      status: 'active',
      paymentTerms: 'Net 15',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Global Beverages Inc.',
      contactPerson: 'Mike Davis',
      email: 'mike@globalbev.com',
      phone: '(555) 456-7890',
      address: '789 Beverage Blvd',
      city: 'Chicago',
      country: 'USA',
      productsSupplied: 67,
      status: 'active',
      paymentTerms: 'Net 45',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '4',
      name: 'Office Supplies Pro',
      contactPerson: 'Lisa Wilson',
      email: 'lisa@officesupplies.com',
      phone: '(555) 321-0987',
      address: '321 Office Park',
      city: 'Boston',
      country: 'USA',
      productsSupplied: 34,
      status: 'inactive',
      paymentTerms: 'Net 30',
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '5',
      name: 'Fashion Forward',
      contactPerson: 'Emma Brown',
      email: 'emma@fashionforward.com',
      phone: '(555) 654-3210',
      address: '654 Fashion District',
      city: 'Los Angeles',
      country: 'USA',
      productsSupplied: 52,
      status: 'active',
      paymentTerms: 'Net 60',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-25')
    }
  ]);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Permission check - only Admin has full access
  const canEdit = user?.role === 'admin';

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.contactPerson && newSupplier.email && canEdit) {
      const supplier: Supplier = {
        id: Date.now().toString(),
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        city: newSupplier.city,
        country: newSupplier.country,
        productsSupplied: 0,
        status: newSupplier.status,
        paymentTerms: newSupplier.paymentTerms,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSuppliers(prev => [...prev, supplier]);
      setNewSupplier({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        paymentTerms: 'Net 30',
        status: 'active'
      });
      setShowAddModal(false);
    }
  };

  const handleEditSupplier = () => {
    if (selectedSupplier && canEdit) {
      setSuppliers(prev => prev.map(s =>
        s.id === selectedSupplier.id 
          ? { ...selectedSupplier, updatedAt: new Date() }
          : s
      ));
      setShowEditModal(false);
      setSelectedSupplier(null);
    }
  };

  const handleDeleteSupplier = (id: string) => {
    if (canEdit && confirm(t('suppliers.delete.confirm'))) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
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
  const totalProducts = suppliers.reduce((sum, s) => sum + s.productsSupplied, 0);
  const avgProductsPerSupplier = Math.round(totalProducts / totalSuppliers);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('suppliers.title')}
      />

      <div className="p-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suppliers.table.supplier')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suppliers.table.contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suppliers.table.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suppliers.table.products')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('suppliers.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <div className="text-sm text-gray-900">{supplier.city}</div>
                      <div className="text-sm text-gray-500">{supplier.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.productsSupplied}</div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('suppliers.form.status')}
                  </label>
                  <select
                    value={newSupplier.status}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">{t('suppliers.status.active')}</option>
                    <option value="inactive">{t('suppliers.status.inactive')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.form.address')}
                </label>
                <textarea
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('suppliers.form.address.placeholder')}
                />
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
                  disabled={!newSupplier.name || !newSupplier.contactPerson || !newSupplier.email}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t('suppliers.form.add')}
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
                    value={selectedSupplier.city}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, city: e.target.value }) : null) : undefined}
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
                    value={selectedSupplier.country}
                    onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, country: e.target.value }) : null) : undefined}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.form.address')}
                </label>
                <textarea
                  value={selectedSupplier.address}
                  onChange={canEdit ? (e) => setSelectedSupplier(prev => prev ? ({ ...prev, address: e.target.value }) : null) : undefined}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p>{t('suppliers.info.products.supplied')}: <span className="font-medium">{selectedSupplier.productsSupplied}</span></p>
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('suppliers.form.save')}
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