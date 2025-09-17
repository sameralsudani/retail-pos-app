import React from 'react';
import { Menu, User, Receipt } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  showActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  title,
  showActions = true 
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <button
                onClick={onMenuClick}
                className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {title || t('header.title')}
              </h1>
            </div>
            <div className="hidden md:block text-sm text-gray-500 flex-shrink-0">
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <LanguageSwitcher />
              <div className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <div>
                  <div className="font-medium text-sm">{user?.name || t('header.cashier')}</div>
                  <div className="text-xs text-blue-600 capitalize">{user?.role}</div>
                </div>
              </div>
              <div className="sm:hidden">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;