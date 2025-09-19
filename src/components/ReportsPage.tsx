import React, { useState } from 'react';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, BarChart3, PieChart, FileText, Printer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

interface SalesData {
  date: string;
  sales: number;
  transactions: number;
  customers: number;
}

interface ProductSales {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

interface CategorySales {
  category: string;
  sales: number;
  percentage: number;
}

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

  // Load reports data on component mount and when date range changes
  React.useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      loadReportsData();
    }
  }, [user, dateRange]);

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

      // Load all report data in parallel
      const [overview, dailySales, topProducts, categorySales, inventory, customers] = await Promise.all([
        reportsAPI.getOverview(dateParams),
        reportsAPI.getDailySales({ ...dateParams, days: 7 }),
        reportsAPI.getTopProducts({ ...dateParams, limit: 10 }),
        reportsAPI.getCategorySales(dateParams),
        reportsAPI.getInventoryReport(),
        reportsAPI.getCustomerReport({ limit: 10 })
      ]);

      if (overview.success) setOverviewData(overview.data);
      if (dailySales.success) setDailySalesData(dailySales.data);
      if (topProducts.success) setTopProductsData(topProducts.data);
      if (categorySales.success) setCategorySalesData(categorySales.data);
      if (inventory.success) setInventoryData(inventory.data);
      if (customers.success) setCustomerData(customers.data);

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
            <div key={day.date} className="flex items-center space-x-4">
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
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
            {salesData.map((day) => (
              <tr key={day.date} className="hover:bg-gray-50">
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
                  ${(day.sales / day.transactions).toFixed(2)}
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
          <p className="text-2xl font-bold text-blue-600">156</p>
          <p className="text-sm text-gray-600">{t('reports.inventory.total.items')}</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <TrendingDown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-600">12</p>
          <p className="text-sm text-gray-600">{t('reports.inventory.low.stock')}</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <Package className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">3</p>
          <p className="text-sm text-gray-600">{t('reports.inventory.out.of.stock')}</p>
        </div>
      </div>
      <p className="text-gray-600">Detailed inventory analysis and stock movement reports would be displayed here.</p>
    </div>
  );

  const renderContent = () => {
    switch (reportType) {
      case 'overview':
        return renderOverviewReport();
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
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