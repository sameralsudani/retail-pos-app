import React, { useState } from "react";
import { ShoppingCart, Search, User, Banknote } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useStore } from "../contexts/StoreContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ProductGrid from "./ProductGrid";
import Cart from "./Cart";
import PaymentModal from "./PaymentModal";
import CustomerModal from "./CustomerModal";
import ReceiptModal from "./ReceiptModal";

const PosPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    // State
    cartItems,
    searchTerm,
    selectedCategory,
    barcodeInput,
    currentCustomer,
    lastTransaction,
    isLoading,
    error,

    // Actions
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setCurrentCustomer,
    completeTransaction,
    setSearchTerm,
    setSelectedCategory,
    setBarcodeInput,
    handleBarcodeScanned,
    setError,

    // Computed Values
    getFilteredProducts,
    getCartTotal,
  } = useStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Get filtered products and categories
  const filteredProducts = getFilteredProducts();
  const categories = [
    "all",
    ...new Set(filteredProducts.map((p) => p.category)),
  ];

  // Get cart totals

  const total = getCartTotal();

  const handlePaymentComplete = (
    paymentMethod: string,
    amountPaid: number,
    amountDue: number
  ) => {
    completeTransaction(paymentMethod, amountPaid, amountDue);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading.store.data")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header onMenuClick={() => setShowSidebar(true)} />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Dismiss</span>×
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search and Filters */}
          <div className="p-3 sm:p-4 lg:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {/* Barcode Scanner */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 sm:max-w-md relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M7 8v8M11 8v8M15 8v8M19 8v8" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={t("search.barcode.placeholder")}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleBarcodeScanned(barcodeInput);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg bg-green-50 dark:bg-green-900/20 dark:text-gray-100"
                  />
                </div>
                <div className="hidden sm:block text-sm text-gray-500">
                  {t("search.barcode.help")}
                </div>
              </div>

              {/* Search and Category Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 lg:max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("search.product.placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium capitalize transition-colors text-sm sm:text-base ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white dark:bg-blue-500"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {category === "all"
                        ? t("search.category.all")
                        : t(`category.${category.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="lg:w-96 w-full bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col max-h-[35vh] md:max-h-[40vh] lg:max-h-none">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("cart.title")}
              </h2>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {cartItems.length} {t("cart.items")}
                </span>
              </div>
            </div>
          </div>

          <Cart
            items={cartItems}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
          />

          {/* Cart Summary and Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xl font-bold  pt-3">
                <span>{t("cart.total")}</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCustomerModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                <User className="h-5 w-5" />
                <span>
                  {currentCustomer
                    ? currentCustomer.name
                    : t("pos.select.client")}
                </span>
              </button>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cartItems.length === 0}
                  className="flex items-center justify-center space-x-2 p-3 sm:p-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                  <Banknote className="h-6 w-6" />
                  <span>{t("cart.cash.payment")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {showCustomerModal && (
        <CustomerModal
          currentCustomer={currentCustomer}
          onClose={() => setShowCustomerModal(false)}
          onSelectCustomer={setCurrentCustomer}
        />
      )}

      {showReceiptModal && lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default PosPage;
