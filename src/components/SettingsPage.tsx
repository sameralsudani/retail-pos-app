import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Database, Printer, Receipt, Save, X, Check, AlertTriangle, Globe, DollarSign, Percent, Clock, Store } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface SystemSettings {
  // Store Information
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  
  // Tax Settings
  taxRate: number;
  taxIncluded: boolean;
  
  // Receipt Settings
  receiptHeader: string;
  receiptFooter: string;
  printLogo: boolean;
  autoprint: boolean;
  
  // System Settings
  currency: string;
  dateFormat: string;
  timeFormat: '12' | '24';
  lowStockThreshold: number;
  
  // Notification Settings
  lowStockAlerts: boolean;
  emailNotifications: boolean;
  soundEffects: boolean;
  
  // Security Settings
  sessionTimeout: number;
  requirePasswordChange: boolean;
  twoFactorAuth: boolean;
  
  // Display Settings
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showProductImages: boolean;
}

const SettingsPage = () => {
  const { t } = useLanguage();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    // Store Information
    storeName: 'RetailPOS Store',
    storeAddress: '123 Main Street, City, State 12345',
    storePhone: '(555) 123-4567',
    storeEmail: 'info@retailpos.com',
    
    // Tax Settings
    taxRate: 8.0,
    taxIncluded: false,
    
    // Receipt Settings
    receiptHeader: 'Thank you for your business!',
    receiptFooter: 'Please keep this receipt for your records',
    printLogo: true,
    autoprint: false,
    
    // System Settings
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    lowStockThreshold: 10,
    
    // Notification Settings
    lowStockAlerts: true,
    emailNotifications: true,
    soundEffects: true,
    
    // Security Settings
    sessionTimeout: 30,
    requirePasswordChange: false,
    twoFactorAuth: false,
    
    // Display Settings
    theme: 'light',
    compactMode: false,
    showProductImages: true
  });

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to backend/database
    setShowSaveConfirm(true);
    setHasChanges(false);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const handleReset = () => {
    if (confirm(t('settings.reset.confirm'))) {
      // Reset to defaults
      setSettings({
        storeName: 'RetailPOS Store',
        storeAddress: '123 Main Street, City, State 12345',
        storePhone: '(555) 123-4567',
        storeEmail: 'info@retailpos.com',
        taxRate: 8.0,
        taxIncluded: false,
        receiptHeader: 'Thank you for your business!',
        receiptFooter: 'Please keep this receipt for your records',
        printLogo: true,
        autoprint: false,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
        lowStockThreshold: 10,
        lowStockAlerts: true,
        emailNotifications: true,
        soundEffects: true,
        sessionTimeout: 30,
        requirePasswordChange: false,
        twoFactorAuth: false,
        theme: 'light',
        compactMode: false,
        showProductImages: true
      });
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: 'store', label: t('settings.tabs.store'), icon: Store },
    { id: 'system', label: t('settings.tabs.system'), icon: Settings },
    { id: 'receipt', label: t('settings.tabs.receipt'), icon: Receipt },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'display', label: t('settings.tabs.display'), icon: Palette }
  ];

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.store.info')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.store.name')}
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleSettingChange('storeName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.store.phone')}
            </label>
            <input
              type="tel"
              value={settings.storePhone}
              onChange={(e) => handleSettingChange('storePhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.store.address')}
            </label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.store.email')}
            </label>
            <input
              type="email"
              value={settings.storeEmail}
              onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.tax.settings')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.tax.rate')} (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.taxIncluded}
                onChange={(e) => handleSettingChange('taxIncluded', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('settings.tax.included')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.system.general')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.system.currency')}
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SAR">SAR (ر.س)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.system.date.format')}
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.system.time.format')}
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value as '12' | '24')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="12">{t('settings.system.time.12')}</option>
              <option value="24">{t('settings.system.time.24')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.system.low.stock.threshold')}
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceiptSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.receipt.customization')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.receipt.header')}
            </label>
            <textarea
              value={settings.receiptHeader}
              onChange={(e) => handleSettingChange('receiptHeader', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.receipt.footer')}
            </label>
            <textarea
              value={settings.receiptFooter}
              onChange={(e) => handleSettingChange('receiptFooter', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.receipt.printing')}</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.printLogo}
              onChange={(e) => handleSettingChange('printLogo', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.receipt.print.logo')}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoprint}
              onChange={(e) => handleSettingChange('autoprint', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.receipt.auto.print')}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.notifications.alerts')}</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.lowStockAlerts}
              onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.notifications.low.stock')}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.notifications.email')}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.notifications.sound')}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.security.access')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.security.session.timeout')} ({t('settings.security.minutes')})
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.requirePasswordChange}
              onChange={(e) => handleSettingChange('requirePasswordChange', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.security.password.change')}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.security.two.factor')}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.display.appearance')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.display.theme')}
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">{t('settings.display.theme.light')}</option>
              <option value="dark">{t('settings.display.theme.dark')}</option>
              <option value="auto">{t('settings.display.theme.auto')}</option>
            </select>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.display.compact.mode')}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showProductImages}
              onChange={(e) => handleSettingChange('showProductImages', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('settings.display.product.images')}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
        return renderStoreSettings();
      case 'system':
        return renderSystemSettings();
      case 'receipt':
        return renderReceiptSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'display':
        return renderDisplaySettings();
      default:
        return renderStoreSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title={t('settings.title')}
      />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Save Confirmation */}
        {showSaveConfirm && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>{t('settings.saved.successfully')}</span>
          </div>
        )}

        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t('settings.unsaved.changes')}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('settings.reset.defaults')}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{t('settings.save.changes')}</span>
            </button>
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

export default SettingsPage;