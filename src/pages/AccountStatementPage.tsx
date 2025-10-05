import React, { useState, useEffect } from "react";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  Download,
  Building2,
  Mail,
  Phone,
  MapPin,
  TrendingDown,
  Search,
  Printer,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";
import { settingsAPI } from "../services/api";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
  balance: number;
  reference?: string;
  category?: string;
  transactionType:
    | "sale"
    | "purchase"
    | "payment"
    | "expense"
    | "transfer"
    | "other";
  clientId?: string;
  clientName?: string;
}

interface ClientTransaction {
  id: string;
  date: string;
  type: "invoice" | "payment";
  invoiceNumber?: string;
  description: string;
  amount: number;
  balance: number;
  status: "paid" | "pending" | "overdue";
}

const AccountStatementPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedAccount] = useState("business");
  const [statementType, setStatementType] = useState<"business" | "client">(
    "business"
  );
  const [selectedClient, setSelectedClient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [capitalAmount, setCapitalAmount] = useState("");
  const [capitalDescription, setCapitalDescription] = useState("");
  const [capitalSource, setCapitalSource] = useState("owner");
  const { t } = useLanguage();

  type StoreSettings = {
    storeName?: string;
    storeDesc?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    [key: string]: unknown;
  };
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  console.log("🚀 ~ AccountStatementPage ~ settings:", settings);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const data = await settingsAPI.getSettings();
        console.log("🚀 ~ fetchSettings ~ data:", data);
        setSettings(data.data);
      } catch {
        // Optionally handle error, e.g., show a toast or fallback UI
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Sample client data
  const clients = [
    {
      id: "1",
      name: "ABC Corp",
      email: "contact@abccorp.com",
      phone: "+1 (555) 123-4567",
    },
    {
      id: "2",
      name: "XYZ Ltd",
      email: "info@xyzltd.com",
      phone: "+1 (555) 234-5678",
    },
    {
      id: "3",
      name: "Tech Solutions",
      email: "hello@techsol.com",
      phone: "+1 (555) 345-6789",
    },
    {
      id: "4",
      name: "Creative Agency",
      email: "studio@creativeag.com",
      phone: "+1 (555) 567-8901",
    },
  ];

  // Sample account data
  const accounts = [
    {
      id: "business",
      name: "Business Operating Account",
      number: "ACC-001-2025",
      type: "Operating",
      openingBalance: 15750.0,
      closingBalance: 28450.0,
    },
    {
      id: "savings",
      name: "Business Savings Account",
      number: "ACC-002-2025",
      type: "Savings",
      openingBalance: 45000.0,
      closingBalance: 48200.0,
    },
  ];

  // Enhanced business transaction data with sales and purchases
  const businessTransactions: Transaction[] = [
    {
      id: "TXN-001",
      date: "2025-01-15",
      description: "Payment Received - Sale to ABC Corp",
      type: "credit",
      amount: 2500.0,
      balance: 28450.0,
      reference: "INV-2025-001",
      category: "Sales Revenue",
      transactionType: "sale",
      clientId: "1",
      clientName: "ABC Corp",
    },
    {
      id: "TXN-002",
      date: "2025-01-14",
      description: "Payment Made - Inventory Purchase from PharmaCorp",
      type: "debit",
      amount: 1250.0,
      balance: 25950.0,
      reference: "PO-2025-001",
      category: "Inventory Purchase",
      transactionType: "purchase",
    },
    {
      id: "TXN-003",
      date: "2025-01-12",
      description: "Payment Received - Sale to XYZ Ltd",
      type: "credit",
      amount: 1800.0,
      balance: 27200.0,
      reference: "INV-2025-002",
      category: "Sales Revenue",
      transactionType: "sale",
      clientId: "2",
      clientName: "XYZ Ltd",
    },
    {
      id: "TXN-004",
      date: "2025-01-11",
      description: "Payment Made - Inventory Purchase from Fresh Farms",
      type: "debit",
      amount: 850.0,
      balance: 25400.0,
      reference: "PO-2025-002",
      category: "Inventory Purchase",
      transactionType: "purchase",
    },
    {
      id: "TXN-005",
      date: "2025-01-10",
      description: "Payment Made - Monthly Office Rent",
      type: "debit",
      amount: 2000.0,
      balance: 26250.0,
      reference: "RENT-001",
      category: "Operating Expenses",
      transactionType: "expense",
    },
    {
      id: "TXN-006",
      date: "2025-01-08",
      description: "Payment Received - Sale to Tech Solutions",
      type: "credit",
      amount: 3200.0,
      balance: 28250.0,
      reference: "INV-2025-003",
      category: "Sales Revenue",
      transactionType: "sale",
      clientId: "3",
      clientName: "Tech Solutions",
    },
    {
      id: "TXN-007",
      date: "2025-01-07",
      description: "Payment Made - Medical Supplies Purchase from MedSupply Co",
      type: "debit",
      amount: 650.0,
      balance: 25050.0,
      reference: "PO-2025-003",
      category: "Inventory Purchase",
      transactionType: "purchase",
    },
    {
      id: "TXN-008",
      date: "2025-01-05",
      description: "Payment Received - Creative Agency Invoice Settlement",
      type: "credit",
      amount: 2100.0,
      balance: 25700.0,
      reference: "INV-2025-004",
      category: "Sales Revenue",
      transactionType: "sale",
      clientId: "4",
      clientName: "Creative Agency",
    },
    {
      id: "TXN-009",
      date: "2025-01-03",
      description:
        "Payment Made - Monthly Utility Bills (Electric, Water, Internet)",
      type: "debit",
      amount: 450.0,
      balance: 23600.0,
      reference: "UTIL-001",
      category: "Operating Expenses",
      transactionType: "expense",
    },
    {
      id: "TXN-011",
      date: "2025-01-16",
      description: "Bank Transfer - Transfer to Savings Account",
      type: "debit",
      amount: 5000.0,
      balance: 23450.0,
      reference: "TRF-001",
      category: "Internal Transfer",
      transactionType: "transfer",
    },
    {
      id: "TXN-012",
      date: "2025-01-14",
      description: "Bank Fee - Monthly Account Maintenance",
      type: "debit",
      amount: 25.0,
      balance: 25925.0,
      reference: "FEE-001",
      category: "Bank Fees",
      transactionType: "expense",
    },
    {
      id: "TXN-013",
      date: "2025-01-13",
      description: "Interest Earned - Monthly Account Interest",
      type: "credit",
      amount: 75.0,
      balance: 25950.0,
      reference: "INT-001",
      category: "Interest Income",
      transactionType: "other",
    },
    {
      id: "TXN-014",
      date: "2025-01-09",
      description: "Refund Issued - Product Return from ABC Corp",
      type: "debit",
      amount: 150.0,
      balance: 26100.0,
      reference: "REF-001",
      category: "Refunds",
      transactionType: "other",
      clientId: "1",
      clientName: "ABC Corp",
    },
    {
      id: "TXN-015",
      date: "2025-01-06",
      description: "Payment Made - Professional Services (Legal Consultation)",
      type: "debit",
      amount: 800.0,
      balance: 24900.0,
      reference: "LEGAL-001",
      category: "Professional Services",
      transactionType: "expense",
    },
    {
      id: "TXN-010",
      date: "2025-01-01",
      description: "Opening Balance",
      type: "credit",
      amount: 15750.0,
      balance: 15750.0,
      reference: "OB-2025",
      category: "Opening Balance",
      transactionType: "other",
    },
  ];

  // Client-specific transaction data
  const getClientTransactions = (clientId: string): ClientTransaction[] => {
    const clientTransactionData: { [key: string]: ClientTransaction[] } = {
      "1": [
        // ABC Corp
        {
          id: "CT-001",
          date: "2025-01-15",
          type: "payment",
          description: "Payment received for Invoice INV-2025-001",
          amount: 2500.0,
          balance: 0.0,
          status: "paid",
        },
        {
          id: "CT-002",
          date: "2025-01-10",
          type: "invoice",
          invoiceNumber: "INV-2025-001",
          description: "Website Development Services",
          amount: 2500.0,
          balance: 2500.0,
          status: "paid",
        },
        {
          id: "CT-003",
          date: "2024-12-20",
          type: "payment",
          description: "Payment received for Invoice INV-2024-045",
          amount: 1800.0,
          balance: 0.0,
          status: "paid",
        },
        {
          id: "CT-004",
          date: "2024-12-15",
          type: "invoice",
          invoiceNumber: "INV-2024-045",
          description: "Monthly Consulting Services",
          amount: 1800.0,
          balance: 1800.0,
          status: "paid",
        },
      ],
      "2": [
        // XYZ Ltd
        {
          id: "CT-005",
          date: "2025-01-12",
          type: "payment",
          description: "Payment received for Invoice INV-2025-002",
          amount: 1800.0,
          balance: 0.0,
          status: "paid",
        },
        {
          id: "CT-006",
          date: "2025-01-08",
          type: "invoice",
          invoiceNumber: "INV-2025-002",
          description: "Monthly Retainer Services",
          amount: 1800.0,
          balance: 1800.0,
          status: "paid",
        },
      ],
    };
    return clientTransactionData[clientId] || [];
  };

  const currentAccount =
    accounts.find((acc) => acc.id === selectedAccount) || accounts[0];
  const currentClient = clients.find((client) => client.id === selectedClient);

  const filteredTransactions = businessTransactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || txn.transactionType === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const clientTransactions = selectedClient
    ? getClientTransactions(selectedClient)
    : [];

  // Calculate totals for business account
  const totalCredits = businessTransactions
    .filter((txn) => txn.type === "credit")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalDebits = businessTransactions
    .filter((txn) => txn.type === "debit")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const salesRevenue = businessTransactions
    .filter((txn) => txn.transactionType === "sale")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const purchaseExpenses = businessTransactions
    .filter((txn) => txn.transactionType === "purchase")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const operatingExpenses = businessTransactions
    .filter((txn) => txn.transactionType === "expense")
    .reduce((sum, txn) => sum + txn.amount, 0);

  // Calculate totals for client account
  const clientTotalInvoiced = clientTransactions
    .filter((txn) => txn.type === "invoice")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const clientTotalPaid = clientTransactions
    .filter((txn) => txn.type === "payment")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const clientOutstandingBalance = clientTotalInvoiced - clientTotalPaid;

  const addCapitalInjection = () => {
    const amount = parseFloat(capitalAmount);
    if (amount > 0) {
      // This would normally be sent to a backend API
      alert(
        `Capital injection of ${formatAmount(
          amount
        )} has been recorded.\nSource: ${capitalSource}\nDescription: ${capitalDescription}`
      );
      setShowCapitalModal(false);
      setCapitalAmount("");
      setCapitalDescription("");
      setCapitalSource("owner");
    }
  };

  const generatePDF = () => {
    alert(
      "PDF generation would be implemented here using a library like jsPDF or react-pdf"
    );
  };

  const printStatement = () => {
    window.print();
  };

  const renderBusinessStatement = () => (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      id="statement-content"
    >
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {settingsLoading
                    ? t("accountStatement.loading")
                    : settings?.storeName}
                </h2>
                <p className="text-gray-600">
                  {settingsLoading
                    ? t("accountStatement.loading")
                    : settings?.storeDesc}
                </p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {settingsLoading
                  ? t("accountStatement.loading")
                  : settings?.storeAddress ||
                    t("accountStatement.companyAddress")}
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {settingsLoading
                  ? t("accountStatement.loading")
                  : settings?.storePhone || t("accountStatement.companyPhone")}
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {settingsLoading
                  ? t("accountStatement.loading")
                  : settings?.storeEmail || t("accountStatement.companyEmail")}
              </div>
              {/* Capital Field from Settings API */}
              {typeof settings?.capital === 'number' && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{t("settings.store.capital")}:</span>
                  <span className="ml-1 font-semibold text-blue-700">
                    {settings.capital.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("accountStatement.businessTitle")}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                {t("accountStatement.statementDate")}:{" "}
                {new Date().toLocaleDateString()}
              </p>
              <p>
                {t("accountStatement.period")}: January 1 - January 15, 2025
              </p>
              <p>
                {t("accountStatement.generated")}: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            {t("accountStatement.accountInfo")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("accountStatement.accountName")}
              </span>
              <span className="font-medium text-gray-900">
                {typeof settings?.accountName === 'string' ? settings.accountName : ''}
              </span>
            </div>

          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            {t("accountStatement.balanceSummary")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("accountStatement.openingBalance")}
              </span>
              <span className="font-medium text-gray-900">
                {formatAmount(currentAccount.openingBalance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("accountStatement.totalCredits")}
              </span>
              <span className="font-medium text-green-600">
                {formatAmount(totalCredits)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("accountStatement.totalDebits")}
              </span>
              <span className="font-medium text-red-600">
                {formatAmount(totalDebits)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-gray-900">
                {t("accountStatement.closingBalance")}
              </span>
              <span className="font-bold text-blue-600">
                {formatAmount(currentAccount.closingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-gray-900">
              {t("accountStatement.salesRevenue")}
            </h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(salesRevenue)}
          </p>
          <p className="text-sm text-gray-600">
            {t("accountStatement.salesPeriod")}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Package className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="font-semibold text-gray-900">
              {t("accountStatement.purchaseExpenses")}
            </h4>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatAmount(purchaseExpenses)}
          </p>
          <p className="text-sm text-gray-600">
            {t("accountStatement.inventoryPurchases")}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-semibold text-gray-900">
              {t("accountStatement.operatingExpenses")}
            </h4>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatAmount(operatingExpenses)}
          </p>
          <p className="text-sm text-gray-600">
            {t("accountStatement.businessExpenses")}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">
            {t("accountStatement.transactionHistory")}
          </h4>
          <div className="text-sm text-gray-500">
            {t("accountStatement.allMoneyInOut")} •{" "}
            {filteredTransactions.length} {t("accountStatement.transactions")}
          </div>
        </div>

        {/* Transaction Monitoring Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                {t("accountStatement.monitoringActive")}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {t("accountStatement.monitoringDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.date")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.transactionDetails")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.category")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.reference")}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.moneyOut")}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.moneyIn")}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.balance")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          { weekday: "short" }
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-xs mt-1">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            transaction.transactionType === "sale"
                              ? "bg-green-100 text-green-800"
                              : transaction.transactionType === "purchase"
                              ? "bg-orange-100 text-orange-800"
                              : transaction.transactionType === "expense"
                              ? "bg-red-100 text-red-800"
                              : transaction.transactionType === "transfer"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.transactionType.charAt(0).toUpperCase() +
                            transaction.transactionType.slice(1)}
                        </span>
                        {transaction.clientName && (
                          <span className="text-blue-600 font-medium">
                            {transaction.clientName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div>
                      <div className="font-medium">{transaction.category}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.type === "credit"
                          ? t("accountStatement.income")
                          : t("accountStatement.expense")}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="font-mono text-xs">
                      {transaction.reference || "N/A"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {transaction.type === "debit" ? (
                      <div>
                        <span className="text-red-600 font-semibold">
                          -{formatAmount(transaction.amount)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {t("accountStatement.outgoing")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {transaction.type === "credit" ? (
                      <div>
                        <span className="text-green-600 font-semibold">
                          +{formatAmount(transaction.amount)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {t("accountStatement.incoming")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    <div>
                      <div className="font-bold">
                        {formatAmount(transaction.balance)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("accountStatement.runningBalance")}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-4 px-4 font-bold text-gray-900">
                  {t("accountStatement.periodTotals")} (
                  {filteredTransactions.length}{" "}
                  {t("accountStatement.transactions")})
                </td>
                <td className="py-4 px-4 text-right">
                  <div>
                    <div className="font-bold text-red-600">
                      -{formatAmount(totalDebits)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t("accountStatement.totalOut")}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div>
                    <div className="font-bold text-green-600">
                      +{formatAmount(totalCredits)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t("accountStatement.totalIn")}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div>
                    <div className="font-bold text-blue-600">
                      {formatAmount(currentAccount.closingBalance)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t("accountStatement.finalBalance")}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Statement Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">
              {t("accountStatement.monitoringSecurity")}
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>{t("accountStatement.completeRecordTitle")}</strong>{" "}
                {t("accountStatement.completeRecordDesc")}
              </li>
              <li>
                • <strong>{t("accountStatement.incomeTrackingTitle")}</strong>{" "}
                {t("accountStatement.incomeTrackingDesc")}
              </li>
              <li>
                •{" "}
                <strong>{t("accountStatement.expenseMonitoringTitle")}</strong>{" "}
                {t("accountStatement.expenseMonitoringDesc")}
              </li>
              <li>
                • <strong>{t("accountStatement.errorDetectionTitle")}</strong>{" "}
                {t("accountStatement.errorDetectionDesc")}
              </li>
              <li>
                • <strong>{t("accountStatement.verificationTitle")}</strong>{" "}
                {t("accountStatement.verificationDesc")}
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">
              {t("accountStatement.financialAnalysis")}
            </h5>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("accountStatement.totalTransactions")}
                </span>
                <span className="font-medium text-gray-900">
                  {filteredTransactions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("accountStatement.moneyInCredits")}
                </span>
                <span className="font-medium text-green-600">
                  +{formatAmount(totalCredits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("accountStatement.moneyOutDebits")}
                </span>
                <span className="font-medium text-red-600">
                  -{formatAmount(totalDebits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("accountStatement.netProfit")}
                </span>
                <span
                  className={`font-medium ${
                    salesRevenue - purchaseExpenses - operatingExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatAmount(
                    salesRevenue - purchaseExpenses - operatingExpenses
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">
                  {t("accountStatement.accountHealth")}
                </span>
                <span
                  className={`font-medium ${
                    currentAccount.closingBalance >
                    currentAccount.openingBalance
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currentAccount.closingBalance > currentAccount.openingBalance
                    ? t("accountStatement.growing")
                    : t("accountStatement.declining")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientStatement = () => (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      id="statement-content"
    >
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">BizManager</h2>
                <p className="text-gray-600">Business Management System</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                123 Business Street, City, State 12345
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                contact@bizmanager.com
              </div>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              CLIENT STATEMENT OF ACCOUNT
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Statement Date: {new Date().toLocaleDateString()}</p>
              <p>Period: January 1 - January 15, 2025</p>
              <p>Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      {currentClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Client Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Client Name:</span>
                <span className="font-medium text-gray-900">
                  {currentClient.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">
                  {currentClient.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">
                  {currentClient.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Account Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoiced:</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(clientTotalInvoiced)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium text-green-600">
                  {formatAmount(clientTotalPaid)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold text-gray-900">
                  Outstanding Balance:
                </span>
                <span
                  className={`font-bold ${
                    clientOutstandingBalance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatAmount(Math.abs(clientOutstandingBalance))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Transaction History */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">
          Transaction History
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.date")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.type")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.description")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.invoiceNumber")}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.amount")}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.balance")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  {t("accountStatement.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {clientTransactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "invoice"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {transaction.type === "invoice" ? "Invoice" : "Payment"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.invoiceNumber || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={`font-medium ${
                        transaction.type === "invoice"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.type === "invoice" ? "+" : "-"}
                      {formatAmount(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {formatAmount(transaction.balance)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Statement Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">
              {t("accountStatement.paymentTerms")}
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t("accountStatement.paymentDue")}</li>
              <li>• {t("accountStatement.latePayments")}</li>
              <li>• {t("accountStatement.referenceInvoice")}</li>
              <li>• {t("accountStatement.contactForArrangements")}</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">
              {t("accountStatement.contactInfo")}
            </h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{t("accountStatement.billingInquiries")}</p>
              <p>{t("accountStatement.billingEmail")}</p>
              <p>{t("accountStatement.billingPhone")}</p>
              <p>{t("accountStatement.businessHours")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("sidebar.accountStatement")}
      />
      <div className="space-y-6 m-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("accountStatement.subtitle")}
            </h1>
          </div>
          <div className="flex space-x-3">
            {statementType === "business" && (
              <button
                onClick={() => setShowCapitalModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {t("accountStatement.addCapital")}
              </button>
            )}
            <button
              onClick={printStatement}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              {t("accountStatement.print")}
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("accountStatement.downloadPDF")}
            </button>
          </div>
        </div>

        {/* Statement Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("accountStatement.statementType")}
              </label>
              <select
                value={statementType}
                onChange={(e) =>
                  setStatementType(e.target.value as "business" | "client")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="business">
                  {t("accountStatement.businessAccount")}
                </option>
                <option value="client">
                  {t("accountStatement.clientAccount")}
                </option>
              </select>
            </div>

            {statementType === "business" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("accountStatement.account")}
                </label>
               <div>
                {typeof settings?.accountName === 'string' ? settings.accountName : ''}
               </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("accountStatement.client")}
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("accountStatement.selectClient")}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("accountStatement.periodLabel")}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">{t("accountStatement.thisWeek")}</option>
                <option value="month">{t("accountStatement.thisMonth")}</option>
                <option value="quarter">
                  {t("accountStatement.thisQuarter")}
                </option>
                <option value="year">{t("accountStatement.thisYear")}</option>
                <option value="custom">
                  {t("accountStatement.customRange")}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("accountStatement.search")}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t("accountStatement.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {statementType === "business" && (
            <div className="flex space-x-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">
                  {t("accountStatement.allTransactions")}
                </option>
                <option value="sale">{t("accountStatement.salesOnly")}</option>
                <option value="purchase">
                  {t("accountStatement.purchasesOnly")}
                </option>
                <option value="expense">
                  {t("accountStatement.expensesOnly")}
                </option>
                <option value="other">
                  {t("accountStatement.otherTransactions")}
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Statement Content */}
        {statementType === "business" ? (
          renderBusinessStatement()
        ) : selectedClient ? (
          renderClientStatement()
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Client
            </h3>
            <p className="text-gray-600">
              Please select a client to generate their account statement.
            </p>
          </div>
        )}

        {/* Sidebar */}
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      </div>

      {/* Add Capital Modal */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t("accountStatement.addCapitalModalTitle")}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCapitalInjection();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("accountStatement.capitalSource")}
                </label>
                <select
                  value={capitalSource}
                  onChange={(e) => setCapitalSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="owner">{t("accountStatement.ownerInvestment")}</option>
                  <option value="partner">{t("accountStatement.partnerInvestment")}</option>
                  <option value="loan">{t("accountStatement.businessLoan")}</option>
                  <option value="grant">{t("accountStatement.governmentGrant")}</option>
                  <option value="investor">{t("accountStatement.investorFunding")}</option>
                  <option value="other">{t("accountStatement.otherSource")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("accountStatement.amount")}
                </label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={capitalAmount}
                    onChange={(e) => setCapitalAmount(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t("accountStatement.amountPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("accountStatement.description")}
                </label>
                <textarea
                  rows={3}
                  value={capitalDescription}
                  onChange={(e) => setCapitalDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t("accountStatement.capitalDescriptionPlaceholder")}
                  required
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">
                      {t("accountStatement.capitalInjectionTitle")}
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      {t("accountStatement.capitalInjectionDesc")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCapitalModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("accountStatement.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t("accountStatement.addCapital")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStatementPage;
