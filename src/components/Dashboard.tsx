import React from 'react';
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

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Today\'s Sales',
      value: '$3,247',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Employees',
      value: '24',
      change: '+2',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Low Stock Items',
      value: '8',
      change: '-3',
      changeType: 'positive',
      icon: Package,
      color: 'bg-orange-500'
    },
    {
      title: 'Orders Today',
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    }
  ];

  const recentSales = [
    { id: 1, customer: 'Walk-in Customer', amount: '$45.50', time: '2:30 PM', items: 3, cashier: 'Sarah M.' },
    { id: 2, customer: 'John Smith', amount: '$127.80', time: '2:15 PM', items: 8, cashier: 'Mike R.' },
    { id: 3, customer: 'Walk-in Customer', amount: '$23.99', time: '2:00 PM', items: 2, cashier: 'Sarah M.' },
    { id: 4, customer: 'Emily Davis', amount: '$89.45', time: '1:45 PM', items: 5, cashier: 'Alex T.' },
    { id: 5, customer: 'Walk-in Customer', amount: '$156.20', time: '1:30 PM', items: 12, cashier: 'Mike R.' }
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Aspirin stock running low (12 units left)', time: '10 min ago' },
    { id: 2, type: 'info', message: 'Employee shift change at 3:00 PM', time: '30 min ago' },
    { id: 3, type: 'success', message: 'Daily sales target achieved!', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'Milk expires tomorrow (15 units)', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business overview for today</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
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
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-green-100">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sale.customer}</p>
                      <p className="text-sm text-gray-500">{sale.items} items • {sale.cashier} • {sale.time}</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Employee Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Shift */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Shift</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">SM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Miller</p>
                  <p className="text-sm text-gray-600">Cashier • 9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <span className="text-green-600 text-sm font-medium">On Duty</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">MR</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mike Rodriguez</p>
                  <p className="text-sm text-gray-600">Manager • 8:00 AM - 6:00 PM</p>
                </div>
              </div>
              <span className="text-blue-600 text-sm font-medium">On Duty</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">AT</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Alex Thompson</p>
                  <p className="text-sm text-gray-600">Stock Clerk • 3:00 PM - 11:00 PM</p>
                </div>
              </div>
              <span className="text-gray-600 text-sm font-medium">Starts at 3:00 PM</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">New Sale</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <Package className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Add Inventory</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Schedule Staff</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;