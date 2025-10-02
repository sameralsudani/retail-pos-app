import React, { useState } from "react";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  Plus,
  Search,
  Filter,
  Package,
  Truck,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  CreditCard as Edit,
  Trash2,
  Eye,
  User,
  Phone,
  Mail,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";

const PurchasesPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { t, language } = useLanguage();
  const [isLoading] = useState(false);

  const purchaseOrders = [
    {
      id: "PO-2025-001",
      supplier: "PharmaCorp",
      supplierEmail: "orders@pharmacorp.com",
      supplierPhone: "+1 (555) 123-4567",
      orderDate: "2025-01-10",
      expectedDate: "2025-01-15",
      status: "pending",
      totalAmount: 2450.0,
      items: [
        { name: "Aspirin 100mg", quantity: 100, unitPrice: 8.99, total: 899.0 },
        {
          name: "Vitamin C 500mg",
          quantity: 50,
          unitPrice: 12.5,
          total: 625.0,
        },
        { name: "Bandages Pack", quantity: 75, unitPrice: 5.99, total: 449.25 },
      ],
    },
    {
      id: "PO-2025-002",
      supplier: "Fresh Farms",
      supplierEmail: "supply@freshfarms.com",
      supplierPhone: "+1 (555) 234-5678",
      orderDate: "2025-01-08",
      expectedDate: "2025-01-12",
      status: "received",
      totalAmount: 1850.0,
      items: [
        { name: "Milk 1L", quantity: 200, unitPrice: 3.49, total: 698.0 },
        {
          name: "Bread Whole Wheat",
          quantity: 150,
          unitPrice: 2.99,
          total: 448.5,
        },
      ],
    },
    {
      id: "PO-2025-003",
      supplier: "HealthPlus",
      supplierEmail: "orders@healthplus.com",
      supplierPhone: "+1 (555) 345-6789",
      orderDate: "2025-01-12",
      expectedDate: "2025-01-18",
      status: "approved",
      totalAmount: 3200.0,
      items: [
        {
          name: "Vitamin D 1000IU",
          quantity: 80,
          unitPrice: 15.99,
          total: 1279.2,
        },
        {
          name: "Omega-3 Fish Oil",
          quantity: 60,
          unitPrice: 24.99,
          total: 1499.4,
        },
      ],
    },
    {
      id: "PO-2025-004",
      supplier: "MedSupply Co",
      supplierEmail: "sales@medsupply.com",
      supplierPhone: "+1 (555) 456-7890",
      orderDate: "2025-01-05",
      expectedDate: "2025-01-10",
      status: "overdue",
      totalAmount: 1650.0,
      items: [
        {
          name: "First Aid Kit",
          quantity: 25,
          unitPrice: 35.99,
          total: 899.75,
        },
        {
          name: "Thermometer Digital",
          quantity: 30,
          unitPrice: 25.0,
          total: 750.0,
        },
      ],
    },
  ];

  const suppliers = [
    {
      id: 1,
      name: "PharmaCorp",
      contact: "John Smith",
      email: "orders@pharmacorp.com",
      phone: "+1 (555) 123-4567",
      address: "123 Medical St, Healthcare City, HC 12345",
      totalOrders: 15,
      totalSpent: 45750.0,
      rating: 4.8,
      status: "active",
    },
    {
      id: 2,
      name: "Fresh Farms",
      contact: "Sarah Johnson",
      email: "supply@freshfarms.com",
      phone: "+1 (555) 234-5678",
      address: "456 Farm Road, Agriculture Valley, AV 67890",
      totalOrders: 22,
      totalSpent: 32400.0,
      rating: 4.6,
      status: "active",
    },
    {
      id: 3,
      name: "HealthPlus",
      contact: "Mike Rodriguez",
      email: "orders@healthplus.com",
      phone: "+1 (555) 345-6789",
      address: "789 Wellness Blvd, Supplement City, SC 13579",
      totalOrders: 8,
      totalSpent: 28900.0,
      rating: 4.9,
      status: "active",
    },
    {
      id: 4,
      name: "MedSupply Co",
      contact: "Emily Davis",
      email: "sales@medsupply.com",
      phone: "+1 (555) 456-7890",
      address: "321 Supply Chain Ave, Distribution Hub, DH 24680",
      totalOrders: 12,
      totalSpent: 19800.0,
      rating: 4.3,
      status: "inactive",
    },
  ];

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "received":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "received":
        return <Package className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <Trash2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(
    (o) => o.status === "pending"
  ).length;
  const overdueOrders = purchaseOrders.filter(
    (o) => o.status === "overdue"
  ).length;
  const totalSpent = purchaseOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const renderPurchaseOrders = () => (
    <div className="space-y-6 m-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.stats.totalOrders")}</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.stats.pending")}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingOrders}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.stats.overdue")}</p>
              <p className="text-2xl font-bold text-red-600">{overdueOrders}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.stats.totalSpent")}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(totalSpent)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("purchases.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t("purchases.filter.allStatus")}</option>
              <option value="pending">{t("purchases.filter.pending")}</option>
              <option value="approved">{t("purchases.filter.approved")}</option>
              <option value="received">{t("purchases.filter.received")}</option>
              <option value="overdue">{t("purchases.filter.overdue")}</option>
            </select>
            <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              {t("purchases.filter.more")}
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("purchases.table.orderDetails")}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("purchases.table.supplier")}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("purchases.table.amount")}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("purchases.table.status")}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("purchases.table.expectedDate")}
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("purchases.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} {t("purchases.table.items")} • {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.supplier}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.supplierEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatAmount(order.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(order.expectedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-6 m-6">
      {/* Supplier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.suppliers.totalSuppliers")}</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.suppliers.activeSuppliers")}</p>
              <p className="text-2xl font-bold text-green-600">{suppliers.filter((s) => s.status === "active").length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.suppliers.totalOrders")}</p>
              <p className="text-2xl font-bold text-blue-600">{suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("purchases.suppliers.totalSpent")}</p>
              <p className="text-2xl font-bold text-orange-600">{formatAmount(suppliers.reduce((sum, s) => sum + s.totalSpent, 0))}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        supplier.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {supplier.status === "active" ? t("purchases.suppliers.status.active") : t("purchases.suppliers.status.inactive")}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {supplier.contact}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {supplier.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {supplier.phone}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t("purchases.suppliers.totalOrders")}</p>
                    <p className="font-semibold text-gray-900">{supplier.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("purchases.suppliers.totalSpent")}</p>
                    <p className="font-semibold text-green-600">{formatAmount(supplier.totalSpent)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{t("purchases.suppliers.rating")}</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {"★".repeat(Math.floor(supplier.rating))}
                      {"☆".repeat(5 - Math.floor(supplier.rating))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {supplier.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  {t("purchases.actions.createOrder")}
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {t("purchases.actions.viewDetails")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("sales.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.users")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("sales.title")}
      />
      <div className="flex items-center justify-end m-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("purchases.actions.newOrder")}
        </button>
      </div>
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 m-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "orders"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">{t("purchases.tab.orders")}</span>
          </button>
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "suppliers"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span className="font-medium">{t("purchases.tab.suppliers")}</span>
          </button>
        </div>
      </div>
      {/* Tab Content */}
      {activeTab === "orders" ? renderPurchaseOrders() : renderSuppliers()}
      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t("purchases.modal.createTitle")}
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("purchases.modal.supplier")}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>{t("purchases.modal.selectSupplier")}</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("purchases.modal.expectedDate")}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t("purchases.modal.orderItems")}
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder={t("purchases.modal.itemName")}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            defaultValue="1"
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-gray-600">$0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  {t("purchases.modal.addItem")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("purchases.modal.notes")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("purchases.modal.notesPlaceholder")}
                  />
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t("purchases.modal.subtotal")}</span>
                      <span className="text-sm text-gray-900">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t("purchases.modal.tax")}</span>
                      <span className="text-sm text-gray-900">$0.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">
                          {t("purchases.modal.total")}
                        </span>
                        <span className="font-semibold text-gray-900">
                          $0.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t("purchases.modal.saveDraft")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("purchases.actions.createOrder")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default PurchasesPage;
