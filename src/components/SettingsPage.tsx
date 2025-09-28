import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Receipt,
  Save,
  X,
  Check,
  AlertTriangle,
  Store,
  DollarSign,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { settingsAPI } from "../services/api";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useCurrency } from '../contexts/CurrencyContext';

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
  timeFormat: "12" | "24";
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
  theme: "light" | "dark" | "auto";
  compactMode: boolean;
  showProductImages: boolean;
}

const SettingsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
   const { exchangeRate, setExchangeRate } = useCurrency();
  const [tempExchangeRate, setTempExchangeRate] = useState(exchangeRate.toString());
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("store");
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<SystemSettings>({
    // Store Information
    storeName: "RetailPOS Store",
    storeAddress: "123 Main Street, City, State 12345",
    storePhone: "(555) 123-4567",
    storeEmail: "info@retailpos.com",

    // Tax Settings
    taxRate: 8.0,
    taxIncluded: false,

    // Receipt Settings
    receiptHeader: "Thank you for your business!",
    receiptFooter: "Please keep this receipt for your records",
    printLogo: true,
    autoprint: false,

    // System Settings
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12",
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
    theme: "light",
    compactMode: false,
    showProductImages: true,
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await settingsAPI.getSettings();

      if (response.success) {
        const apiSettings = response.data;
        setSettings({
          storeName: apiSettings.storeName || "RetailPOS Store",
          storeAddress:
            apiSettings.storeAddress || "123 Main Street, City, State 12345",
          storePhone: apiSettings.storePhone || "(555) 123-4567",
          storeEmail: apiSettings.storeEmail || "info@retailpos.com",
          taxRate: apiSettings.taxRate || 8.0,
          taxIncluded: apiSettings.taxIncluded || false,
          receiptHeader:
            apiSettings.receiptHeader || "Thank you for your business!",
          receiptFooter:
            apiSettings.receiptFooter ||
            "Please keep this receipt for your records",
          printLogo:
            apiSettings.printLogo !== undefined ? apiSettings.printLogo : true,
          autoprint: apiSettings.autoprint || false,
          currency: apiSettings.currency || "USD",
          dateFormat: apiSettings.dateFormat || "MM/DD/YYYY",
          timeFormat: apiSettings.timeFormat || "12",
          lowStockThreshold: apiSettings.lowStockThreshold || 10,
          lowStockAlerts:
            apiSettings.lowStockAlerts !== undefined
              ? apiSettings.lowStockAlerts
              : true,
          emailNotifications:
            apiSettings.emailNotifications !== undefined
              ? apiSettings.emailNotifications
              : true,
          soundEffects:
            apiSettings.soundEffects !== undefined
              ? apiSettings.soundEffects
              : true,
          sessionTimeout: apiSettings.sessionTimeout || 30,
          requirePasswordChange: apiSettings.requirePasswordChange || false,
          twoFactorAuth: apiSettings.twoFactorAuth || false,
          theme: apiSettings.theme || "light",
          compactMode: apiSettings.compactMode || false,
          showProductImages:
            apiSettings.showProductImages !== undefined
              ? apiSettings.showProductImages
              : true,
        });
        // Sync currency context
        if (apiSettings.exchangeRate) {
          setExchangeRate(apiSettings.exchangeRate);
          setTempExchangeRate(apiSettings.exchangeRate);
        }
        // Optionally sync display currency context here if needed
        console.log("Settings loaded successfully");
      } else {
        setError(response.message || "Failed to load settings");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setError("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      console.log("Saving settings:", settings);
      const response = await settingsAPI.updateSettings(settings);

      if (response.success) {
        setHasChanges(false);
        setSuccess(t("settings.saved.successfully"));
        setShowSaveConfirm(true);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setShowSaveConfirm(false);
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(t("settings.reset.confirm"))) {
      try {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        console.log("Resetting settings to defaults...");
        const response = await settingsAPI.resetSettings();

        if (response.success) {
          await loadSettings(); // Reload settings from server
          setHasChanges(false);
          setSuccess("Settings reset to defaults successfully");

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(response.message || "Failed to reset settings");
        }
      } catch (error) {
        console.error("Error resetting settings:", error);
        setError("Failed to reset settings. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Permission check - only Admin has full access, Manager has read-only
  const canEdit = user?.role === "admin";
  const canView = user?.role === "admin" || user?.role === "manager";

  // Access control
  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You do not have permission to access settings
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("settings.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "store", label: t("settings.tabs.store"), icon: Store },
    { id: "system", label: t("settings.tabs.system"), icon: Settings },
    { id: "receipt", label: t("settings.tabs.receipt"), icon: Receipt },
    { id: "currency", label: t("settings.tabs.currency"), icon: DollarSign },
    {
      id: "notifications",
      label: t("settings.tabs.notifications"),
      icon: Bell,
    },
    { id: "security", label: t("settings.tabs.security"), icon: Shield },
    { id: "display", label: t("settings.tabs.display"), icon: Palette },
  ];

  const renderCurrencySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("settings.currency.exchangeRate.title")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.currency.exchangeRate.current")}
            </label>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  1 USD = {exchangeRate.toLocaleString()} IQD
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t("settings.currency.exchangeRate.current.desc")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.currency.exchangeRate.update")}
            </label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">1 USD =</span>
                  <input
                    type="number"
                    value={tempExchangeRate}
                    onChange={(e) => setTempExchangeRate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("settings.currency.exchangeRate.placeholder")}
                  />
                  <span className="text-sm text-gray-600 ml-2">IQD</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const newRate = parseFloat(tempExchangeRate);
                  if (newRate > 0) {
                    setExchangeRate(newRate);
                    await settingsAPI.updateSettings({ ...settings, exchangeRate: newRate });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("settings.currency.exchangeRate.update.button")}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {t("settings.currency.exchangeRate.examples")}
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                1 USD = {parseFloat(tempExchangeRate || "0").toLocaleString()} IQD
              </p>
              <p>
                1,000 IQD = {(1000 / parseFloat(tempExchangeRate || "1")).toFixed(2)} USD
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  {t("settings.currency.exchangeRate.note.title")}
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {t("settings.currency.exchangeRate.note.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("settings.currency.display.title")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.currency.display.default")}
            </label>
            <select
              value={settings.currency}
              onChange={async (e) => {
                handleSettingChange("currency", e.target.value);
                await settingsAPI.updateSettings({ ...settings, currency: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            >
              <option value="USD">{t("settings.currency.display.usd")}</option>
              <option value="IQD">{t("settings.currency.display.iqd")}</option>
            </select>
          </div>
          
        </div>
      </div>
    </div>
  );

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.store.info")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.store.name")}
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleSettingChange("storeName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.store.phone")}
            </label>
            <input
              type="tel"
              value={settings.storePhone}
              onChange={(e) =>
                handleSettingChange("storePhone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.store.address")}
            </label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) =>
                handleSettingChange("storeAddress", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.store.email")}
            </label>
            <input
              type="email"
              value={settings.storeEmail}
              onChange={(e) =>
                handleSettingChange("storeEmail", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.tax.settings")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.tax.rate")} (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) =>
                handleSettingChange("taxRate", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.taxIncluded}
                onChange={(e) =>
                  handleSettingChange("taxIncluded", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={!canEdit}
              />
              <span className="text-sm font-medium text-gray-700">
                {t("settings.tax.included")}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.system.general")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.system.currency")}
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange("currency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
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
              {t("settings.system.date.format")}
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) =>
                handleSettingChange("dateFormat", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.system.time.format")}
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) =>
                handleSettingChange("timeFormat", e.target.value as "12" | "24")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            >
              <option value="12">{t("settings.system.time.12")}</option>
              <option value="24">{t("settings.system.time.24")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.system.low.stock.threshold")}
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) =>
                handleSettingChange(
                  "lowStockThreshold",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceiptSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.receipt.customization")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.receipt.header")}
            </label>
            <textarea
              value={settings.receiptHeader}
              onChange={(e) =>
                handleSettingChange("receiptHeader", e.target.value)
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.receipt.footer")}
            </label>
            <textarea
              value={settings.receiptFooter}
              onChange={(e) =>
                handleSettingChange("receiptFooter", e.target.value)
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.receipt.printing")}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.printLogo}
              onChange={(e) =>
                handleSettingChange("printLogo", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.receipt.print.logo")}
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoprint}
              onChange={(e) =>
                handleSettingChange("autoprint", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.receipt.auto.print")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.notifications.alerts")}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.lowStockAlerts}
              onChange={(e) =>
                handleSettingChange("lowStockAlerts", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.notifications.low.stock")}
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleSettingChange("emailNotifications", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.notifications.email")}
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) =>
                handleSettingChange("soundEffects", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.notifications.sound")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.security.access")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.security.session.timeout")} (
              {t("settings.security.minutes")})
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                handleSettingChange(
                  "sessionTimeout",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            />
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.requirePasswordChange}
              onChange={(e) =>
                handleSettingChange("requirePasswordChange", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.security.password.change")}
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) =>
                handleSettingChange("twoFactorAuth", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.security.two.factor")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.display.appearance")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.display.theme")}
            </label>
            <select
              value={settings.theme}
              onChange={(e) =>
                handleSettingChange(
                  "theme",
                  e.target.value as "light" | "dark" | "auto"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!canEdit}
            >
              <option value="light">{t("settings.display.theme.light")}</option>
              <option value="dark">{t("settings.display.theme.dark")}</option>
              <option value="auto">{t("settings.display.theme.auto")}</option>
            </select>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) =>
                handleSettingChange("compactMode", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.display.compact.mode")}
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showProductImages}
              onChange={(e) =>
                handleSettingChange("showProductImages", e.target.checked)
              }
              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
              }`}
              disabled={!canEdit}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("settings.display.product.images")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "store":
        return renderStoreSettings();
      case "system":
        return renderSystemSettings();
      case "currency":
        return renderCurrencySettings();
      case "receipt":
        return renderReceiptSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "display":
        return renderDisplaySettings();
      default:
        return renderStoreSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("settings.title")}
      />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
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

        {/* Save Confirmation */}
        {showSaveConfirm && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>{t("settings.saved.successfully")}</span>
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
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        document.documentElement.dir === "rtl" ? "mr-2" : "ml-2"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">{renderTabContent()}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t("settings.unsaved.changes")}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {canEdit && (
              <>
                <button
                  onClick={handleReset}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  {t("settings.reset.defaults")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSaving ? "Saving..." : t("settings.save.changes")}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default SettingsPage;
