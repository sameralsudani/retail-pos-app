import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, BarChart3, PieChart, FileText, Printer, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const ReportsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Report data state
  const [overviewData, setOverviewData] = useState<any>(null);
  const [dailySalesData, setDailySalesData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  // Permission check - only Admin and Manager can access reports
  const canViewReports = user?.role === 'admin' || user?.role === 'manager';

  // Load reports data on component mount and when date range changes
  useEffect(() => {
    if (canViewReports) {
      loadReportsData();
    }
  }, [canViewReports, dateRange]);

  const getDateRangeParams = () => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        endDate = now;
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        endDate = now;
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        endDate = now;
        break;
      default:
        return {};
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  const loadReportsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dateParams = getDateRangeParams();
      console.log('Loading reports with date params:', dateParams);

      // Load overview data
      try {
        const overview = await reportsAPI.getOverview(dateParams);
        if (overview.success) {
          setOverviewData(overview.data);
        }
      } catch (error) {
        console.error('Error loading overview:', error);
      }

      // Load daily sales data
      try {
        const dailySales = await reportsAPI.getDailySales({ ...dateParams, days: 7 });
        if (dailySales.success) {
          setDailySalesData(dailySales.data);
        }
      } catch (error) {
        console.error('Error loading daily sales:', error);
      }

      // Load top products data
      try {
        const topProducts = await reportsAPI.getTopProducts({ ...dateParams, limit: 10 });
        if (topProducts.success) {
          setTopProductsData(topProducts.data);
        }
      } catch (error) {
        console.error('Error loading top products:', error);
      }

      // Load category sales data
      try {
        const categorySales = await reportsAPI.getCategorySales(dateParams);
        if (categorySales.success) {
          setCategorySalesData(categorySales.data);
        }
      } catch (error) {
        console.error('Error loading category sales:', error);
      }

      // Load inventory data
      try {
        const inventory = await reportsAPI.getInventoryReport();
        if (inventory.success) {
          setInventoryData(inventory.data);
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
      }

      // Load customer data
      try {
        const customers = await reportsAPI.getCustomerReport({ limit: 10 });
        if (customers.success) {
          setCustomerData(customers.data);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
      }

    } catch (error) {
      console.error('Error loading reports data:', error);
      setError('Failed to load reports data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // In a real app, this would generate and download the report
    alert(t('reports.export.success'));
  };

  const handlePrint = () => {
    window.print();
  };

  // Sample data for fallback
  const sampleSalesData = [
    { date: '2024-01-15', sales: 1250.75, transactions: 45, customers: 32 },
    { date: '2024-01-14', sales: 980.50, transactions: 38, customers: 28 },
    { date: '2024-01-13', sales: 1450.25, transactions: 52, customers: 41 },
    { date: '2024-01-12', sales: 1120.00, transactions: 42, customers: 35 },
    { date: '2024-01-11', sales: 1680.90, transactions: 58, customers: 48 },
    { date: '2024-01-10', sales: 1340.60, transactions: 47, customers: 39 },
    { date: '2024-01-09', sales: 1580.30, transactions: 55, customers: 44 }
  ];

  const sampleTopProducts = [
    { name: 'Premium Coffee Beans', category: 'beverages', quantity: 45, revenue: 1124.55 },
    { name: 'Wireless Headphones', category: 'electronics', quantity: 23, revenue: 2069.77 },
    { name: 'Organic Apples', category: 'produce', quantity: 156, revenue: 778.44 },
    { name: 'Designer T-Shirt', category: 'clothing', quantity: 28, revenue: 979.72 },
    { name: 'Notebook Set', category: 'stationery', quantity: 42, revenue: 671.58 }
  ];

  const sampleCategorySales = [
    { category: 'electronics', sales: 3250.75, percentage: 35.2 },
    { category: 'clothing', sales: 2180.50, percentage: 23.6 },
    { category: 'beverages', sales: 1890.25, percentage: 20.5 },
    { category: 'produce', sales: 1120.80, percentage: 12.1 },
    { category: 'stationery', sales: 780.40, percentage: 8.6 }
  ];

  // Use real data if available, otherwise fallback to sample data
  const salesData = dailySalesData.length > 0 ? dailySalesData : sampleSalesData;
  const topProducts = topProductsData.length > 0 ? topProductsData : sampleTopProducts;
  const categorySales = categorySalesData.length > 0 ? categorySalesData : sampleCategorySales;

  // Calculate metrics from data
  const totalSales = overviewData?.sales?.totalRevenue || salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalTransactions = overviewData?.sales?.totalTransactions || salesData.reduce((sum, day) => sum + day.transactions, 0);
  const totalCustomers = overviewData?.customers?.totalCustomers || Math.max(...salesData.map(d => d.customers));
  const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Sample trends (in a real app, this would be calculated from historical data)
  const salesTrend = 12.5;
  const transactionsTrend = -2.3;
  const customersTrend = 8.7;

  // Access control
  if (!canViewReports) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You do not have permission to access reports</p>
        </div>
      </div>
    );
  }

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('reports.metrics.total.sales')}</p>
              <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+{salesTrend}%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('reports.metrics.transactions')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">{transactionsTrend}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('reports.metrics.customers')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+{customersTrend}%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('reports.metrics.avg.transaction')}</p>
              <p className="text-2xl font-bold text-gray-900">${avgTransactionValue.toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+5.2%</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.chart.daily.sales')}</h3>
        <div className="space-y-4">
          {salesData.map((day, index) => (
            <div key={day.date || index} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">${day.sales.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">{day.transactions} transactions</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(day.sales / Math.max(...salesData.map(d => d.sales))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.chart.top.products')}</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{product.quantity} {t('reports.product.sold')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.chart.category.sales')}</h3>
          <div className="space-y-3">
            {categorySales.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 capitalize">{category.category}</span>
                  <span className="text-sm text-gray-600">${category.sales.toFixed(2)} ({category.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.sales')}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.table.date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.table.sales')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.table.transactions')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.table.customers')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.table.avg.transaction')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesData.map((day, index) => (
              <tr key={day.date || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(day.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${day.sales.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.transactions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.customers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${day.transactions > 0 ? (day.sales / day.transactions).toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.inventory')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{inventoryData?.stats?.totalProducts || 156}</p>
          <p className="text-sm text-gray-600">{t('reports.inventory.total.items')}</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <TrendingDown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-600">{inventoryData?.stats?.lowStockCount || 12}</p>
          <p className="text-sm text-gray-600">{t('reports.inventory.low.stock')}</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <Package className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{inventoryData?.stats?.outOfStockCount || 3}</p>
          <p className="text-sm text-gray-600">{t('reports.inventory.out.of.stock')}</p>
        </div>
      </div>
      
      {/* Low Stock Products */}
      {inventoryData?.lowStockProducts && inventoryData.lowStockProducts.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Low Stock Products</h4>
          <div className="space-y-2">
            {inventoryData.lowStockProducts.slice(0, 5).map((product, index) => (
              <div key={product._id || index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-600">{product.stock} left</p>
                  <p className="text-xs text-gray-500">Reorder at {product.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomersReport = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.customers')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{customerData?.stats?.totalCustomers || 89}</p>
          <p className="text-sm text-gray-600">Total Customers</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">${customerData?.stats?.averageSpent?.toFixed(2) || '125.50'}</p>
          <p className="text-sm text-gray-600">Average Spent</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{Math.round(customerData?.stats?.averageLoyaltyPoints || 245)}</p>
          <p className="text-sm text-gray-600">Avg Loyalty Points</p>
        </div>
      </div>

      {/* Top Customers */}
      {customerData?.topCustomers && customerData.topCustomers.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Top Customers</h4>
          <div className="space-y-2">
            {customerData.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">${customer.totalSpent?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-500">{customer.loyaltyPoints || 0} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProductsReport = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.products')}</h3>
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <div key={product.name || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500 capitalize">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">${product.revenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{product.quantity} units sold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports data...</p>
          </div>
        </div>
      );
    }

    switch (reportType) {
      case 'overview':
        return renderOverviewReport();
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'customers':
        return renderCustomersReport();
      case 'products':
        return renderProductsReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('reports.title')}
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

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">{t('reports.date.today')}</option>
                  <option value="yesterday">{t('reports.date.yesterday')}</option>
                  <option value="week">{t('reports.date.week')}</option>
                  <option value="month">{t('reports.date.month')}</option>
                  <option value="quarter">{t('reports.date.quarter')}</option>
                  <option value="year">{t('reports.date.year')}</option>
                  <option value="custom">{t('reports.date.custom')}</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="overview">{t('reports.overview')}</option>
                  <option value="sales">{t('reports.sales')}</option>
                  <option value="inventory">{t('reports.inventory')}</option>
                  <option value="customers">{t('reports.customers')}</option>
                  <option value="products">{t('reports.products')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>{t('reports.export.print')}</span>
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('reports.export.pdf')}</span>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('reports.export.excel')}</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('reports.export.csv')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {renderContent()}
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
};

export default ReportsPage;