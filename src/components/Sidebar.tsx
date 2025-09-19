import React from 'react';
import { X, Home, Package, Users, FileText, Settings, LogOut, BarChart3, ShoppingCart, Tag, Truck, User, Receipt, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (confirm(t('sidebar.logout.confirm.message'))) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const menuItems = [
    { 
      icon: Receipt, 
      label: t('sidebar.pos'), 
      path: '/pos',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: ShoppingCart, 
      label: t('sidebar.orders'), 
      path: '/orders',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: Package, 
      label: t('sidebar.inventory'), 
      path: '/inventory',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: Tag, 
      label: t('sidebar.categories'), 
      path: '/categories',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: Users, 
      label: t('sidebar.customers'), 
      path: '/customers',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: Truck, 
      label: t('sidebar.suppliers'), 
      path: '/suppliers',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: User, 
      label: t('sidebar.users'), 
      path: '/users',
      roles: ['admin', 'manager']
    },
    { 
      icon: BarChart3, 
      label: t('sidebar.reports'), 
      path: '/reports',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: User, 
      label: t('sidebar.profile'), 
      path: '/profile',
      roles: ['admin', 'manager', 'cashier']
    },
    { 
      icon: Settings, 
      label: t('sidebar.settings'), 
      path: '/settings',
      roles: ['admin', 'manager', 'cashier']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 rtl:left-auto rtl:right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 rtl:-translate-x-0' : '-translate-x-full rtl:translate-x-full'}
        lg:relative lg:translate-x-0 lg:rtl:translate-x-0 lg:shadow-none lg:border-r lg:rtl:border-r-0 lg:rtl:border-l lg:border-gray-200 lg:dark:border-gray-700
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('header.title')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 rtl:-left-1 rtl:right-auto w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role ? t(`auth.role.${user.role}`) : t('sidebar.cashier.role')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {user?.employeeId}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`
                  w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-left rtl:text-right transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Theme and Language Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left rtl:text-right"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;