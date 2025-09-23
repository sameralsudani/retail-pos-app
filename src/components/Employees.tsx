import React, { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Clock,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  DollarSign,
  Award
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Employees: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [showSidebar, setShowSidebar] = useState(false);

  const employees = [
    {
      id: 1,
      name: 'Sarah Miller',
      position: 'Store Manager',
      department: 'Management',
      email: 'sarah.miller@store.com',
      phone: '+1 (555) 123-4567',
      hourlyRate: 25.00,
      status: 'active',
      shift: '9:00 AM - 5:00 PM',
      hireDate: '2023-03-15',
      avatar: 'SM',
      hoursThisWeek: 40,
      performance: 95
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      position: 'Cashier',
      department: 'Sales',
      email: 'mike.rodriguez@store.com',
      phone: '+1 (555) 234-5678',
      hourlyRate: 18.50,
      status: 'active',
      shift: '8:00 AM - 6:00 PM',
      hireDate: '2023-07-22',
      avatar: 'MR',
      hoursThisWeek: 45,
      performance: 88
    },
    {
      id: 3,
      name: 'Alex Thompson',
      position: 'Stock Clerk',
      department: 'Inventory',
      email: 'alex.thompson@store.com',
      phone: '+1 (555) 345-6789',
      hourlyRate: 16.00,
      status: 'active',
      shift: '3:00 PM - 11:00 PM',
      hireDate: '2024-01-10',
      avatar: 'AT',
      hoursThisWeek: 38,
      performance: 92
    },
    {
      id: 4,
      name: 'Emily Davis',
      position: 'Pharmacist',
      department: 'Pharmacy',
      email: 'emily.davis@store.com',
      phone: '+1 (555) 456-7890',
      hourlyRate: 45.00,
      status: 'active',
      shift: '10:00 AM - 6:00 PM',
      hireDate: '2022-11-05',
      avatar: 'ED',
      hoursThisWeek: 40,
      performance: 98
    },
    {
      id: 5,
      name: 'James Wilson',
      position: 'Security Guard',
      department: 'Security',
      email: 'james.wilson@store.com',
      phone: '+1 (555) 567-8901',
      hourlyRate: 20.00,
      status: 'inactive',
      shift: '11:00 PM - 7:00 AM',
      hireDate: '2023-09-12',
      avatar: 'JW',
      hoursThisWeek: 0,
      performance: 85
    }
  ];

  const schedules = [
    { id: 1, employee: 'Sarah Miller', monday: '9-5', tuesday: '9-5', wednesday: '9-5', thursday: '9-5', friday: '9-5', saturday: 'Off', sunday: 'Off' },
    { id: 2, employee: 'Mike Rodriguez', monday: '8-6', tuesday: '8-6', wednesday: '8-6', thursday: '8-6', friday: '8-6', saturday: '10-4', sunday: 'Off' },
    { id: 3, employee: 'Alex Thompson', monday: '3-11', tuesday: '3-11', wednesday: '3-11', thursday: '3-11', friday: '3-11', saturday: 'Off', sunday: 'Off' },
    { id: 4, employee: 'Emily Davis', monday: '10-6', tuesday: '10-6', wednesday: '10-6', thursday: '10-6', friday: '10-6', saturday: 'Off', sunday: 'Off' },
    { id: 5, employee: 'James Wilson', monday: 'Off', tuesday: 'Off', wednesday: 'Off', thursday: 'Off', friday: 'Off', saturday: 'Off', sunday: 'Off' }
  ];

  const departments = ['all', 'Management', 'Sales', 'Inventory', 'Pharmacy', 'Security'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalPayroll = employees.reduce((sum, emp) => sum + (emp.hoursThisWeek * emp.hourlyRate), 0);
  const avgPerformance = employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length;

  const renderEmployeeList = () => (
    <div className="space-y-6">
      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('employees.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('employees.stats.active.today')}</p>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('employees.stats.weekly.payroll')}</p>
              <p className="text-2xl font-bold text-purple-600">${totalPayroll.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('employees.stats.avg.performance')}</p>
              <p className="text-2xl font-bold text-orange-600">{avgPerformance.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 ${document.documentElement.dir === 'rtl' ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('employees.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${document.documentElement.dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
            </div>
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? t('employees.filter.all.departments') : t(`employees.department.${dept.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{employee.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{employee.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${document.documentElement.dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Mail className={`w-4 h-4 text-gray-400 ${document.documentElement.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {employee.email}
                </div>
                <div className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${document.documentElement.dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Phone className={`w-4 h-4 text-gray-400 ${document.documentElement.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {employee.phone}
                </div>
                <div className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${document.documentElement.dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Clock className={`w-4 h-4 text-gray-400 ${document.documentElement.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {employee.shift}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('employees.hourly.rate')}</p>
                  <p className="font-semibold text-green-600">${employee.hourlyRate}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('employees.this.week')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{employee.hoursThisWeek}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('employees.department')}</p>
                  <p className="font-semibold text-blue-600">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('employees.performance')}</p>
                  <p className="font-semibold text-orange-600">{employee.performance}%</p>
                </div>
              </div>

              <div className={`flex ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <button className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  {t('employees.edit.details')}
                </button>
                <button className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  {t('employees.view.schedule')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('employees.weekly.schedule')}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${document.documentElement.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t('employees.employee')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.monday')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.tuesday')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.wednesday')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.thursday')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.friday')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.saturday')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('employees.sunday')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{schedule.employee}</div>
                </td>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <td key={day} className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      schedule[day as keyof typeof schedule] === 'Off'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {schedule[day as keyof typeof schedule] === 'Off' ? t('employees.off') : schedule[day as keyof typeof schedule]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('employees.title')}
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
           
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('employees.add.employee')}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className={`flex ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users className={`w-4 h-4 inline ${document.documentElement.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('employees.tab.employees')}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar className={`w-4 h-4 inline ${document.documentElement.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('employees.tab.schedule')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'employees' ? renderEmployeeList() : renderSchedule()}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('employees.add.title')}</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.full.name')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.full.name.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.position')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.position.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.department')}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option>{t('employees.department.management')}</option>
                    <option>{t('employees.department.sales')}</option>
                    <option>{t('employees.department.inventory')}</option>
                    <option>{t('employees.department.pharmacy')}</option>
                    <option>{t('employees.department.security')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.hourly.rate')}</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.hourly.rate.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.email')}</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.email.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.phone')}</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.phone.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.hire.date')}</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.shift')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.shift.placeholder')}
                  />
                </div>
              </div>
              <div className={`flex pt-6 ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('employees.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('employees.form.add')}
                </button>
              </div>
            </form>
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

export default Employees;