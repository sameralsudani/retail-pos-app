import React from "react";
import { Menu, User, Store } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  showActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  title,
  showActions = true,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <button
                onClick={onMenuClick}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* App Icon with gradient background */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-all duration-200">
                  <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  {title || t("header.title")}
                </h1>
                <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {t("header.subtitle")}
                </div>
              </div>
            </div>

            {/* Live Clock */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentTime.toLocaleDateString()} •{" "}
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div
                className={document.documentElement.dir === "rtl" ? "ml-2" : ""}
              >
                <LanguageSwitcher />
              </div>
              {/* User Profile */}
              <div className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-all duration-200 space-x-3">
                <div
                  className={`relative ${
                    document.documentElement.dir === "rtl" ? "mr-3" : "ml-3"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {user?.name || t("header.cashier")}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 capitalize font-medium">
                    {t(`auth.role.${user?.role || "cashier"}`)}
                  </div>
                </div>
              </div>

              {/* Mobile User Avatar */}
              <div className="sm:hidden relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
