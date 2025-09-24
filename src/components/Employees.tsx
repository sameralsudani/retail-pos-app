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
  Award,
  X,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { employeesAPI } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  employeeId: string;
  hourlyRate: number;
  status: string;
  shift: string;
  hireDate: string;
  avatar: string;
  hoursThisWeek: number;
  performance: number;
  address?: string;
  emergencyContact?: string;
  notes?: string;
};

const Employees: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    averagePerformance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    department: 'Sales',
    email: '',
    phone: '',
    employeeId: '',
    hourlyRate: 0,
    shift: '',
    hireDate: new Date().toISOString().split('T')[0]
  });

  // Load employees on component mount
  React.useEffect(() => {
    loadEmployees();
    loadStats();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading employees from API...');
      
      const response = await employeesAPI.getAll();
      console.log('Employees API response:', response);
      
      if (response.success) {
        interface ApiEmployee {
            _id?: string;
            id?: string;
            name: string;
            position: string;
            department: string;
            email: string;
            phone: string;
            employeeId: string;
            hourlyRate: number;
            status: string;
            shift: string;
            hireDate: string;
            hoursThisWeek?: number;
            performance?: number;
            address?: string;
            emergencyContact?: string;
            notes?: string;
        }

        const mappedEmployees: Employee[] = (response.data as ApiEmployee[]).map((apiEmployee: ApiEmployee): Employee => ({
            id: apiEmployee._id || apiEmployee.id as string,
            name: apiEmployee.name,
            position: apiEmployee.position,
            department: apiEmployee.department,
            email: apiEmployee.email,
            phone: apiEmployee.phone,
            employeeId: apiEmployee.employeeId,
            hourlyRate: apiEmployee.hourlyRate,
            status: apiEmployee.status,
            shift: apiEmployee.shift,
            hireDate: new Date(apiEmployee.hireDate).toISOString().split('T')[0],
            avatar: apiEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            hoursThisWeek: apiEmployee.hoursThisWeek || 0,
            performance: apiEmployee.performance || 85,
            address: apiEmployee.address,
            emergencyContact: apiEmployee.emergencyContact,
            notes: apiEmployee.notes
        }));
        console.log('Mapped employees:', mappedEmployees);
        setEmployees(mappedEmployees);
      } else {
        setError(response.message || 'Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await employeesAPI.getStats();
      if (response.success) {
        setStats({
          totalEmployees: response.data.totalEmployees || 0,
          activeEmployees: response.data.activeEmployees || 0,
          totalPayroll: response.data.totalPayroll || 0,
          averagePerformance: response.data.averagePerformance || 0
        });
      }
    } catch (error) {
      console.error('Error loading employee stats:', error);
    }
  };

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

  const handleAddEmployee = async () => {
    if (newEmployee.name && newEmployee.email && newEmployee.employeeId && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const employeeData = {
          name: newEmployee.name,
          position: newEmployee.position,
          department: newEmployee.department,
          email: newEmployee.email,
          phone: newEmployee.phone,
          employeeId: newEmployee.employeeId,
          hourlyRate: newEmployee.hourlyRate,
          shift: newEmployee.shift,
          hireDate: newEmployee.hireDate
        };
        
        console.log('Creating employee with data:', employeeData);
        const response = await employeesAPI.create(employeeData);
        
        if (response.success) {
          await loadEmployees(); // Reload employees list
          await loadStats(); // Reload stats
          setNewEmployee({
            name: '',
            position: '',
            department: 'Sales',
            email: '',
            phone: '',
            employeeId: '',
            hourlyRate: 0,
            shift: '',
            hireDate: new Date().toISOString().split('T')[0]
          });
          setShowAddModal(false);
        } else {
          setError(response.message || 'Failed to create employee');
        }
      } catch (error) {
        console.error('Error creating employee:', error);
        setError('Failed to create employee. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditEmployee = async () => {
    if (selectedEmployee && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const updateData = {
          name: selectedEmployee.name,
          position: selectedEmployee.position,
          department: selectedEmployee.department,
          email: selectedEmployee.email,
          phone: selectedEmployee.phone,
          hourlyRate: selectedEmployee.hourlyRate,
          shift: selectedEmployee.shift,
          status: selectedEmployee.status,
          hoursThisWeek: selectedEmployee.hoursThisWeek,
          performance: selectedEmployee.performance,
          notes: selectedEmployee.notes
        };
        
        console.log('Updating employee with data:', updateData);
        const response = await employeesAPI.update(selectedEmployee.id, updateData);
        
        if (response.success) {
          await loadEmployees(); // Reload employees list
          await loadStats(); // Reload stats
          setShowEditModal(false);
          setSelectedEmployee(null);
        } else {
          setError(response.message || 'Failed to update employee');
        }
      } catch (error) {
        console.error('Error updating employee:', error);
        setError('Failed to update employee. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (canEdit && confirm(t('employees.delete.confirm'))) {
      try {
        setError(null);
        console.log('Deleting employee:', id);
        
        const response = await employeesAPI.delete(id);
        
        if (response.success) {
          await loadEmployees(); // Reload employees list
          await loadStats(); // Reload stats
        } else {
          setError(response.message || 'Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Failed to delete employee. Please try again.');
      }
    }
  };

  // Permission check
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  // Statistics
  const totalEmployees = stats.totalEmployees;
  const activeEmployees = stats.activeEmployees;
  const totalPayroll = stats.totalPayroll;
  const avgPerformance = stats.averagePerformance;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onMenuClick={() => setShowSidebar(true)} 
          title={t('employees.title')}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading.employees')}</p>
          </div>
        </div>
      </div>
    );
  }

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
                {canEdit ? (
                  <button 
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEditModal(true);
                    }}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {t('employees.edit.details')}
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEditModal(true);
                    }}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {t('employees.view.details')}
                  </button>
                )}
                <button className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  {t('employees.view.schedule')}
                </button>
                {canDelete && (
                  <button 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    {t('employees.delete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('employees.empty.title')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('employees.empty.subtitle')}</p>
        </div>
      )}
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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            {/* Title is handled by Header component */}
          </div>
          {canEdit && (
            <button 
              onClick={() => setShowAddModal(true)}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('employees.add.employee')}
            </button>
          )}
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
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('employees.add.title')}</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.full.name')}</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.full.name.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.position')}</label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.position.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.department')}</label>
                  <select 
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Management">{t('employees.department.management')}</option>
                    <option value="Sales">{t('employees.department.sales')}</option>
                    <option value="Inventory">{t('employees.department.inventory')}</option>
                    <option value="Pharmacy">{t('employees.department.pharmacy')}</option>
                    <option value="Security">{t('employees.department.security')}</option>
                    <option value="Customer Service">{t('employees.department.customer.service')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.hourly.rate')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEmployee.hourlyRate}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.hourly.rate.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.email')}</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.email.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.phone')}</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.phone.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.employee.id')}</label>
                  <input
                    type="text"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('employees.form.employee.id.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.hire.date')}</label>
                  <input
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.shift')}</label>
                  <input
                    type="text"
                    value={newEmployee.shift}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, shift: e.target.value }))}
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
                  type="button"
                  onClick={handleAddEmployee}
                  disabled={!newEmployee.name || !newEmployee.email || !newEmployee.employeeId || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isSubmitting ? t('employees.form.adding') : t('employees.form.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              {canEdit ? t('employees.edit.title') : t('employees.view.title')}
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.full.name')}</label>
                  <input
                    type="text"
                    value={selectedEmployee.name}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, name: e.target.value } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.position')}</label>
                  <input
                    type="text"
                    value={selectedEmployee.position}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, position: e.target.value } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.department')}</label>
                  <select 
                    value={selectedEmployee.department}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, department: e.target.value } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  >
                    <option value="Management">{t('employees.department.management')}</option>
                    <option value="Sales">{t('employees.department.sales')}</option>
                    <option value="Inventory">{t('employees.department.inventory')}</option>
                    <option value="Pharmacy">{t('employees.department.pharmacy')}</option>
                    <option value="Security">{t('employees.department.security')}</option>
                    <option value="Customer Service">{t('employees.department.customer.service')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.status')}</label>
                  <select 
                    value={selectedEmployee.status}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, status: e.target.value } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  >
                    <option value="active">{t('employees.status.active')}</option>
                    <option value="inactive">{t('employees.status.inactive')}</option>
                    <option value="terminated">{t('employees.status.terminated')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.hourly.rate')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedEmployee.hourlyRate}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, hourlyRate: parseFloat(e.target.value) || 0 } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.shift')}</label>
                  <input
                    type="text"
                    value={selectedEmployee.shift}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, shift: e.target.value } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.hours.this.week')}</label>
                  <input
                    type="number"
                    value={selectedEmployee.hoursThisWeek}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, hoursThisWeek: parseInt(e.target.value) || 0 } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employees.form.performance')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedEmployee.performance}
                    onChange={canEdit ? (e) => setSelectedEmployee(prev => prev ? { ...prev, performance: parseInt(e.target.value) || 0 } : prev) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div className={`flex pt-6 ${document.documentElement.dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('employees.form.cancel')}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleEditEmployee}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? t('employees.form.saving') : t('employees.form.save')}
                  </button>
                )}
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