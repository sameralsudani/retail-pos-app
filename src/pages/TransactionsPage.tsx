import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  Search,
  Filter,
  Eye,
  Printer,
  User,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Pen,
  ShoppingCart,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useStore } from "../contexts/StoreContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Product, Transaction } from "../types";
import UpdateTransactionModal from "../components/UpdateTransactionModal";
import { useCurrency } from "../contexts/CurrencyContext";
import NewSaleModal from "../components/NewSaleModal";
import { transactionsAPI, productsAPI } from "../services/api";

type OrderWithCustomer = Transaction & {
  customerName: string;
  customerEmail: string;
  status: string;
  orderDate: Date;
};
interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address:
    | {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      }
    | string;
  notes?: string;
  status?: string;
  totalRevenue?: number;
  activeInvoices?: number;
  lastTransaction?: string | Date;
  projects?: number;
  avatar?: string;
}

type InvoiceItem = { product: Product; quantity: number };

const TransactionsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { transactions, updateTransaction, loadTransactions } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(
    null
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [updateModal, setUpdateModal] = useState<{
    open: boolean;
    transaction: OrderWithCustomer | null;
  }>({ open: false, transaction: null });
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Invoice modal state (for new sale)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  console.log("🚀 ~ TransactionsPage ~ showInvoiceModal:", showInvoiceModal);
  const [selectedCustomer, setSelectedCustomer] = useState<Client | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [invoiceStep, setInvoiceStep] = useState<
    "products" | "review" | "payment"
  >("products");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "digital"
  >("cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Load data on component mount
  const loadInitialData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([loadProducts()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load products for invoice modal
  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch {
      setError("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addToInvoice = (product: Product) => {
    setInvoiceItems((prev) => {
      // Use only _id for uniqueness
      const productId = product._id;
      const existingItem = prev.find((item) => item.product._id === productId);
      if (existingItem) {
        return prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateInvoiceItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setInvoiceItems((prev) =>
        prev.filter((item) => item.product._id !== productId)
      );
    } else {
      setInvoiceItems((prev) =>
        prev.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromInvoice = (productId: string) => {
    setInvoiceItems((prev) =>
      prev.filter((item) => item.product._id !== productId)
    );
  };

  const getInvoiceTotal = () => {
    return invoiceItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const submitInvoice = async () => {
    if (!selectedCustomer) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const total = getInvoiceTotal();
      const amountPaidNum = parseFloat(amountPaid) || 0;
      const isPartial = amountPaidNum < total;

      // Allow partial payment, mark as due if not fully paid
      const transactionData = {
        items: invoiceItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        customer: selectedCustomer._id,
        paymentMethod,
        amountPaid: amountPaidNum,
        dueAmount: isPartial ? total - amountPaidNum : 0,
        isPaid: !isPartial,
      };

      const response = await transactionsAPI.create(transactionData);

      if (response.success) {
        // Reload transactions so the table updates
        await loadTransactions();
        // Close modal and reset
        setShowInvoiceModal(false);
        setInvoiceItems([]);
        setProductSearchTerm("");
        setInvoiceStep("products");
        setPaymentMethod("cash");
        setAmountPaid("");
        setSelectedCustomer(null);

        // Show success message
        if (isPartial) {
          toast.success(
            `Invoice created with due amount: $${(
              total - amountPaidNum
            ).toFixed(2)}. Transaction ID: ${response.data._id}`
          );
        } else {
          toast.success(
            `Invoice created successfully! Transaction ID: ${response.data._id}`
          );
        }
      } else {
        setError(response.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setError("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSale = () => {
    setSelectedCustomer(null); // Force customer picker to show
    setShowInvoiceModal(true);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep("products");
    setPaymentMethod("cash");
    setAmountPaid("");
    loadProducts();
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep("products");
    setPaymentMethod("cash");
    setAmountPaid("");
    setSelectedCustomer(null);
  };

  // Transactions list
  const transactionsList = transactions.map((transaction) => ({
    ...transaction,
    customerName: transaction.customer?.name || "Walk-in Customer",
    customerEmail: transaction.customer?.email || "",
    status: transaction.status ?? "completed",
    orderDate: transaction.timestamp,
  }));

  const filteredTransactions = transactionsList.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    // Date range filter
    let matchesDate = true;
    if (fromDate) {
      matchesDate =
        matchesDate &&
        new Date(transaction.orderDate).setHours(0, 0, 0, 0) >=
          new Date(fromDate).setHours(0, 0, 0, 0);
    }
    if (toDate) {
      matchesDate =
        matchesDate &&
        new Date(transaction.orderDate).setHours(0, 0, 0, 0) <=
          new Date(toDate).setHours(0, 0, 0, 0);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
  const { formatAmount } = useCurrency();

  // Print receipt function (outside component)
  const printReceipt = (
    t: (key: string) => string,
    transaction: OrderWithCustomer
  ) => {
    const receiptWindow = window.open("", "PRINT", "height=600,width=400");
    if (!receiptWindow) return;
    const itemsHtml = transaction.items
      .map(
        (item: {
          product: { name: string; price: number };
          quantity: number;
        }) =>
          `<tr><td style='padding:4px 8px;'>${
            item.product.name
          }</td><td style='padding:4px 8px;'>${
            item.quantity
          }</td><td style='padding:4px 8px;'>$${(
            item.product.price * item.quantity
          ).toFixed(2)}</td></tr>`
      )
      .join("");
    receiptWindow.document.write(`
    <html>
      <head>
        <title>${t("invoices.receipt.title")}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border-bottom: 1px solid #eee; text-align: left; }
          .total { font-weight: bold; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h2>${t("invoices.receipt.title")}</h2>
        <div>${t("invoices.detail.transaction.id")}: ${transaction.id}</div>
        <div>${t("invoices.detail.customer")}: ${transaction.customerName}</div>
        <div>${t(
          "invoices.detail.date"
        )}: ${transaction.orderDate.toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>${t("invoices.detail.items")}</th>
              <th>${t("invoices.table.items.count")}</th>
              <th>${t("invoices.detail.total")}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class='total' style='margin-top:16px;'>${t(
          "invoices.detail.total"
        )}: $${transaction.total.toFixed(2)}</div>
        <div>${t("invoices.detail.payment.method")}: <span class='capitalize'>${
      transaction.paymentMethod
    }</span></div>
      </body>
    </html>
  `);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => {
      receiptWindow.print();
      receiptWindow.close();
    }, 300);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "due":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "due":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("sales.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.users")}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTransactions = transactionsList.length;
  const completedTransactions = transactionsList.filter(
    (t) => t.status === "completed"
  ).length;
  const dueTransactions = transactionsList.filter(
    (t) => t.status === "due"
  ).length;
  const totalRevenue = transactionsList.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("sales.title")}
      />

      <div className="flex items-center justify-end m-6">
        <button
          onClick={handleNewSale}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t("invoices.actions.newSale")}
        </button>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`${language === "ar" ? "mr-4" : "ml-4"}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t("invoices.stats.total")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className={`${language === "ar" ? "mr-4" : "ml-4"}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t("invoices.stats.completed")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className={`${language === "ar" ? "mr-4" : "ml-4"}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t("invoices.stats.due")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dueTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className={`${language === "ar" ? "mr-4" : "ml-4"}`}>
                <p className="text-sm font-medium text-gray-600">
                  {t("invoices.stats.revenue")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          

        
        </div>

        {/* Filters & Advanced Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("invoices.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Date Range Advanced Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <label className="text-xs font-medium text-gray-500">
                {t("invoices.filter.from")}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 text-sm shadow-sm hover:border-blue-400 transition-colors"
              />
              <span className="text-gray-400 mx-1">-</span>
              <label className="text-xs font-medium text-gray-500">
                {t("invoices.filter.to")}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 text-sm shadow-sm hover:border-blue-400 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t("invoices.filter.all")}</option>
                  <option value="completed">
                    {t("invoices.filter.completed")}
                  </option>
                  <option value="due">{t("invoices.filter.due")}</option>
                  <option value="cancelled">
                    {t("invoices.filter.cancelled")}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.invoices")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.customer")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.items")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.total")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.amountPaid")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.amountDue")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.status")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.date")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("invoices.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.cashier}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div
                          className={`${language === "ar" ? "mr-3" : "ml-3"}`}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.items.length}{" "}
                        {t("invoices.table.items.count")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.items
                          .slice(0, 2)
                          .map((item) => item.product.name)
                          .join(", ")}
                        {transaction.items.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(transaction.total)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {transaction.paymentMethod}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(transaction.amountPaid)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {transaction.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.total.toFixed(2) !==
                        transaction.amountPaid.toFixed(2)
                          ? formatAmount(
                              transaction.total - transaction.amountPaid
                            )
                          : "0.00"}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {transaction.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status === "completed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : transaction.status === "due" ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="capitalize">
                          {t(`invoices.status.${transaction.status}`)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{transaction.orderDate.toLocaleDateString()}</div>
                      <div>{transaction.orderDate.toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(transaction)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title={t("invoices.actions.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => printReceipt(t, transaction)}
                          // Print receipt function
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                          title={t("invoices.actions.print")}
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setUpdateModal({ open: true, transaction })
                          }
                          className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                          title={t("invoices.actions.update")}
                        >
                          <Pen className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("invoices.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("invoices.empty.subtitle")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("invoices.detail.title")}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("invoices.detail.transaction.id")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("invoices.detail.status")}
                  </label>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.status
                    )} mt-1`}
                  >
                    {getStatusIcon(selectedOrder.status ?? "completed")}
                    <span className="capitalize">
                      {t(`invoices.status.${selectedOrder.status}`)}
                    </span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("invoices.detail.customer")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.customerEmail}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("invoices.detail.date")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.orderDate.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t("invoices.detail.items")}
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ${item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ${(item.quantity * item.product.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t("invoices.detail.total")}</span>
                  <span className="text-blue-600">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t("invoices.detail.payment.method")}:{" "}
                  <span className="capitalize">
                    {selectedOrder.paymentMethod}
                  </span>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t("invoices.detail.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Transaction Modal */}
      {updateModal.open && updateModal.transaction && (
        <UpdateTransactionModal
          transaction={updateModal.transaction}
          onClose={() => setUpdateModal({ open: false, transaction: null })}
          onUpdate={async (updates) => {
            await updateTransaction(updateModal.transaction!.id, {
              ...updates,
              status: updates.status as
                | "completed"
                | "refunded"
                | "cancelled"
                | "due"
                | undefined,
            });
            setUpdateModal({ open: false, transaction: null });
          }}
          t={t}
        />
      )}

      {/* Invoice Modal for New Sale */}
      {showInvoiceModal && (
        <NewSaleModal
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={(customer) =>
            setSelectedCustomer(
              customer
                ? {
                    _id: customer._id ?? "",
                    name: customer.name,
                    email: customer.email ?? "",
                    phone: customer.phone ?? "",
                    address: "", // or provide a sensible default/lookup if available
                  }
                : null
            )
          }
          closeInvoiceModal={closeInvoiceModal}
          invoiceStep={invoiceStep}
          productSearchTerm={productSearchTerm}
          setProductSearchTerm={setProductSearchTerm}
          isLoadingProducts={isLoadingProducts}
          invoiceItems={invoiceItems}
          addToInvoice={addToInvoice}
          updateInvoiceItemQuantity={updateInvoiceItemQuantity}
          removeFromInvoice={removeFromInvoice}
          getInvoiceTotal={getInvoiceTotal}
          setInvoiceStep={setInvoiceStep}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          submitInvoice={submitInvoice}
          isSubmitting={isSubmitting}
          t={t}
          filteredProducts={filteredProducts}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default TransactionsPage;
