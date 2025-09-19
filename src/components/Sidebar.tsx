import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, Settings, BarChart3, Package, Store, UserCircle, AlertTriangle, Tag, Users, Truck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      icon: Package,
      label: t('sidebar.orders'),
      onClick: () => {
        navigate('/orders');
        onClose();
      }
    },
    {
      icon: Tag,
      label: t('sidebar.categories'),
      onClick: () => {
        navigate('/categories');
        onClose();
      }
    },
    {
      icon: Truck,
      label: t('sidebar.suppliers'),
      onClick: () => {
        navigate('/suppliers');
        onClose();
      }
    },
    {
      icon: UserCircle,
      label: t('sidebar.profile'),
      onClick: () => {
        navigate('/profile');
        onClose();
      }
    },
    {
      icon: Package,
      label: t('sidebar.inventory'),
      onClick: () => {
        navigate('/inventory');
        onClose();
      }
    }
  ];

  // Add Reports and Settings menu items only for Admin and Manager
  if (user?.role === 'admin' || user?.role === 'manager') {
    // Add Reports at the beginning
    menuItems.unshift({
      icon: BarChart3,
      label: t('sidebar.reports'),
      onClick: () => {
        navigate('/reports');
        onClose();
      }
    });

    // Add Settings at the end
    menuItems.push({
      icon: Settings,
      label: t('sidebar.settings'),
      onClick: () => {
        navigate('/settings');
        onClose();
      }
    });
  }

  // Add Users menu item only for Admin and Manager
  if (user?.role === 'admin' || user?.role === 'manager') {
    const insertIndex = user?.role === 'admin' || user?.role === 'manager' ? 3 : 2; // After Categories
    menuItems.splice(insertIndex, 0, {
      icon: Users,
      label: t('sidebar.users'),
      onClick: () => {
        navigate('/users');
        onClose();
      }
    });
  }

  const handlePOSClick = () => {
    navigate('/pos');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          language === 'ar' ? 'right-0' : 'left-0'
        } ${
          isOpen 
            ? 'translate-x-0' 
            : language === 'ar' 
              ? 'translate-x-full' 
              : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={handlePOSClick}
            className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors min-w-0 flex-1"
          >
            <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{t('header.title')}</h2>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{user?.name || t('header.cashier')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{user?.role || t('sidebar.cashier.role')}</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-3 sm:px-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('sidebar.logout.confirm.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('sidebar.logout.confirm.message')}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('sidebar.logout.cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {t('sidebar.logout.confirm.button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;