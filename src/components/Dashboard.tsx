import React from 'react';
import { useState } from 'react';
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Clock,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [showSidebar, setShowSidebar] = useState(false);

  const stats = [
    {
      title: t('dashboard.stats.today.sales'),
      value: '$3,247',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: t('dashboard.stats.active.employees'),
      value: '24',
      change: '+2',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: t('dashboard.stats.low.stock'),
      value: '8',
      change: '-3',
      changeType: 'positive',
      icon: Package,
      color: 'bg-orange-500'
    },
    {
      title: t('dashboard.stats.orders.today'),
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    }
  ];

  const recentSales = [
    { id: 1, customer: 'Walk-in Customer', amount: '$45.50', time: '2:30 PM', items: 3, cashier: 'Sarah M.', itemsLabel: t('dashboard.items') },
    { id: 2, customer: 'John Smith', amount: '$127.80', time: '2:15 PM', items: 8, cashier: 'Mike R.', itemsLabel: t('dashboard.items') },
    { id: 3, customer: 'Walk-in Customer', amount: '$23.99', time: '2:00 PM', items: 2, cashier: 'Sarah M.', itemsLabel: t('dashboard.items') },
    { id: 4, customer: 'Emily Davis', amount: '$89.45', time: '1:45 PM', items: 5, cashier: 'Alex T.', itemsLabel: t('dashboard.items') },
    { id: 5, customer: 'Walk-in Customer', amount: '$156.20', time: '1:30 PM', items: 12, cashier: 'Mike R.', itemsLabel: t('dashboard.items') }
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Aspirin stock running low (12 units left)', time: '10 min ago' },
    { id: 2, type: 'info', message: 'Employee shift change at 3:00 PM', time: '30 min ago' },
    { id: 3, type: 'success', message: 'Daily sales target achieved!', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'Milk expires tomorrow (15 units)', time: '2 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('dashboard.title')}
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.welcome')}</p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.last.updated')}: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ml-1 ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.recent.sales')}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className={`flex items-center ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                      <div className="p-2 rounded-full bg-green-100">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{sale.customer}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{sale.items} {sale.itemsLabel} • {sale.cashier} • {sale.time}</p>
                      </div>
                    </div>
                    <div className="font-semibold text-green-600">
                      {sale.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.alerts.notifications')}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className={`p-1 rounded-full ${
                      alert.type === 'warning' ? 'bg-orange-100' :
                      alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      ) : alert.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                {t('dashboard.view.all.notifications')}
              </button>
            </div>
          </div>
        </div>

        {/* Employee Schedule & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Shift */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.current.shift')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className={`flex items-center ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">SM</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Sarah Miller</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cashier • 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('dashboard.on.duty')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className={`flex items-center ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">MR</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Mike Rodriguez</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manager • 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">{t('dashboard.on.duty')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`flex items-center ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">AT</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Alex Thompson</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stock Clerk • 3:00 PM - 11:00 PM</p>
                  </div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('dashboard.starts.at')} 3:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.quick.actions')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('dashboard.new.sale')}</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('dashboard.add.inventory')}</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('dashboard.schedule.staff')}</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('dashboard.view.reports')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
};

export default Dashboard;