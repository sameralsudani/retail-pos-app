import React, { useState } from "react";

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
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useStore } from "../contexts/StoreContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Transaction } from "../types";
import UpdateTransactionModal from "./UpdateTransactionModal";
import { useCurrency } from "../contexts/CurrencyContext";

const TransactionsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { transactions, isLoading, updateTransaction } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  type OrderWithCustomer = Transaction & {
    customerName: string;
    customerEmail: string;
    status: string;
    orderDate: Date;
  };
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(
    null
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [updateModal, setUpdateModal] = useState<{
    open: boolean;
    transaction: OrderWithCustomer | null;
  }>({ open: false, transaction: null });

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

    return matchesSearch && matchesStatus;
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
        <title>${t("transactions.receipt.title")}</title>
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
        <h2>${t("transactions.receipt.title")}</h2>
        <div>${t("transactions.detail.transaction.id")}: ${transaction.id}</div>
        <div>${t("transactions.detail.customer")}: ${
      transaction.customerName
    }</div>
        <div>${t(
          "transactions.detail.date"
        )}: ${transaction.orderDate.toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>${t("transactions.detail.items")}</th>
              <th>${t("transactions.table.items.count")}</th>
              <th>${t("transactions.detail.total")}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class='total' style='margin-top:16px;'>${t(
          "transactions.detail.total"
        )}: $${transaction.total.toFixed(2)}</div>
        <div>${t(
          "transactions.detail.payment.method"
        )}: <span class='capitalize'>${transaction.paymentMethod}</span></div>
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
          title={t("users.title")}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("transactions.title")}
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("transactions.stats.total")}
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("transactions.stats.completed")}
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("transactions.stats.due")}
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("transactions.stats.revenue")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("transactions.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <option value="all">{t("transactions.filter.all")}</option>
                  <option value="completed">
                    {t("transactions.filter.completed")}
                  </option>
                  <option value="due">{t("transactions.filter.due")}</option>
                  <option value="cancelled">
                    {t("transactions.filter.cancelled")}
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
                    {t("transactions.table.transaction")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.customer")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.items")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.total")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.amountPaid")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.amountDue")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.status")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.date")}
                  </th>
                  <th
                    className={`px-6 py-3 ${
                      language === "ar" ? "text-right" : "text-left"
                    } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {t("transactions.table.actions")}
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
                        <div className="ml-3">
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
                        {t("transactions.table.items.count")}
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
                          {t(`transactions.status.${transaction.status}`)}
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
                          title={t("transactions.actions.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => printReceipt(t, transaction)}
                          // Print receipt function
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                          title={t("transactions.actions.print")}
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setUpdateModal({ open: true, transaction })
                          }
                          className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                          title={t("transactions.actions.update")}
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
                {t("transactions.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("transactions.empty.subtitle")}
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
                {t("transactions.detail.title")}
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
                    {t("transactions.detail.transaction.id")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("transactions.detail.status")}
                  </label>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.status
                    )} mt-1`}
                  >
                    {getStatusIcon(selectedOrder.status ?? "completed")}
                    <span className="capitalize">
                      {t(`transactions.status.${selectedOrder.status}`)}
                    </span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("transactions.detail.customer")}
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
                    {t("transactions.detail.date")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.orderDate.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t("transactions.detail.items")}
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
                  <span>{t("transactions.detail.total")}</span>
                  <span className="text-blue-600">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t("transactions.detail.payment.method")}:{" "}
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
                {t("transactions.detail.close")}
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

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default TransactionsPage;
