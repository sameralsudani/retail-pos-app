import React from "react";
import { X, Search, Package, Minus, Plus, DollarSign, CreditCard, Calculator } from "lucide-react";
import { Product } from "../types";

interface InvoiceModalProps {
  selectedCustomer: {
    name: string;
    email?: string;
    phone?: string;
    // Add other customer fields as needed
  } | null;
  closeInvoiceModal: () => void;
  invoiceStep: "products" | "review" | "payment";
  productSearchTerm: string;
  setProductSearchTerm: (term: string) => void;
  isLoadingProducts: boolean;
  filteredProducts: {
    _id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image: string;
    category?: string;
  }[];
  addToInvoice: (product: Product) => void;
  
  invoiceItems: {
    product: {
      _id: string;
      name: string;
      sku: string;
      price: number;
      stock: number;
      image: string;
    };
    quantity: number;
  }[];
  removeFromInvoice: (id: string) => void;
  updateInvoiceItemQuantity: (id: string, quantity: number) => void;
  getInvoiceTotal: () => number;
  setInvoiceStep: (step: "products" | "review" | "payment") => void;
  paymentMethod: "cash" | "card" | "digital";
  setPaymentMethod: (method: "cash" | "card" | "digital") => void;
  amountPaid: string;
  setAmountPaid: (amount: string) => void;
  isSubmitting: boolean;
  submitInvoice: () => void;
  t: (key: string) => string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  selectedCustomer,
  closeInvoiceModal,
  invoiceStep,
  productSearchTerm,
  setProductSearchTerm,
  isLoadingProducts,
  filteredProducts,
  addToInvoice,
  invoiceItems,
  removeFromInvoice,
  updateInvoiceItemQuantity,
  getInvoiceTotal,
  setInvoiceStep,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  isSubmitting,
  submitInvoice,
  t,
}) => {
  if (!selectedCustomer) return null;
  const total = getInvoiceTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("customers.create.invoice")} - {selectedCustomer.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('customers.invoice.step')} {invoiceStep === "products"
                ? "1"
                : invoiceStep === "review"
                ? "2"
                : "3"} {t('customers.invoice.of')} 3
            </p>
          </div>
          <button
            onClick={closeInvoiceModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {invoiceStep === "products" && (
            <>
              {/* Product Selection */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('customers.invoice.search.products')}
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                          onClick={() =>
                            addToInvoice({
                              ...product,
                              category: product.category ?? ""
                            })
                          }
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {product.sku}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-600">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Items Sidebar */}
              <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {t('customers.invoice.items')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {invoiceItems.length} {t('customers.invoice.items.label')}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {invoiceItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">{t('customers.invoice.no.items')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoiceItems.map((item) => (
                        <div
                          key={item.product._id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {item.product.sku}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromInvoice(item.product._id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateInvoiceItemQuantity(item.product._id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateInvoiceItemQuantity(item.product._id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-blue-600">
                              ${ (item.product.price * item.quantity).toFixed(2) }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invoice Summary */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>{t('customers.invoice.total')}</span>
                      <span className="text-blue-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setInvoiceStep("review")}
                    disabled={invoiceItems.length === 0}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('customers.invoice.review.button')}
                  </button>
                </div>
              </div>
            </>
          )}

          {invoiceStep === "review" && (
            <div className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {t('customers.invoice.review.title')}
                </h3>

                {/* Client Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('customers.invoice.bill.to')}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCustomer.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCustomer.phone}
                  </p>
                </div>

                {/* Invoice Items */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {t('customers.invoice.items')}
                  </h4>
                  <div className="space-y-3">
                    {invoiceItems.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{t('customers.invoice.total')}</span>
                      <span className="text-blue-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setInvoiceStep("products")}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('customers.invoice.back.to.products')}
                  </button>
                  <button
                    onClick={() => setInvoiceStep("payment")}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('customers.invoice.proceed.to.payment')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {invoiceStep === "payment" && (
            <div className="flex-1 p-6">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {t('customers.invoice.payment.title')}
                </h3>

                {/* Total Amount */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('customers.invoice.total.amount')}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${total.toFixed(2)}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('customers.invoice.payment.method')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["cash", "card", "digital"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          paymentMethod === method
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          {method === "cash" && (
                            <DollarSign className="h-6 w-6 mx-auto mb-1" />
                          )}
                          {method === "card" && (
                            <CreditCard className="h-6 w-6 mx-auto mb-1" />
                          )}
                          {method === "digital" && (
                            <Calculator className="h-6 w-6 mx-auto mb-1" />
                          )}
                          <div className="text-sm font-medium capitalize">
                            {method}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('customers.invoice.amount.paid')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={total.toFixed(2)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />

                  {/* Quick amount buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => setAmountPaid(total.toFixed(2))}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      {t('customers.invoice.exact.amount')}
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setInvoiceStep("review")}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('customers.invoice.back')}
                  </button>
                  <button
                    onClick={submitInvoice}
                    disabled={isSubmitting || invoiceItems.length === 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? t('customers.invoice.creating')
                      : parseFloat(amountPaid) < total
                      ? t('customers.invoice.create.due')
                      : t('customers.invoice.create')}
                  </button>
                  {parseFloat(amountPaid) < total && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                      {t('customers.invoice.due.amount')}: ${ (total - (parseFloat(amountPaid) || 0)).toFixed(2) }
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
