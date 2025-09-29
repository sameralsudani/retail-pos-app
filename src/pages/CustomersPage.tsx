import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  User,
  AlertTriangle,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { customersAPI, productsAPI, transactionsAPI } from "../services/api";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Product } from "../types";
import InvoiceModal from "../components/InvoiceModal";

interface InvoiceItem {
  product: Product;
  quantity: number;
}

const CustomersPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { loadTransactions } = useStore();

  // State management
  const [customers, setCustomers] = useState<Client[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    totalActiveInvoices: 0,
    newCustomersThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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

  const [selectedCustomer, setSelectedCustomer] = useState<Client | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Invoice creation state
  const [products, setProducts] = useState<Product[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [invoiceStep, setInvoiceStep] = useState<
    "products" | "review" | "payment"
  >("products");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "digital"
  >("cash");
  const [amountPaid, setAmountPaid] = useState<string>("");

  // Create Invoice Functionality
  const handleCreateInvoice = (client: Client) => {
    setSelectedCustomer(client);
    setShowInvoiceModal(true);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep("products");
    setPaymentMethod("cash");
    setAmountPaid("");
    loadProducts();
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await productsAPI.getAll();
      console.log("🚀 ~ loadProducts ~ response:", response);

      if (response.success) {
        const mappedProducts = response.data.map((product: Product) => ({
          ...product,
          category: (typeof product.category === "object"
            ? (product.category as { name: string }).name
            : product.category || ""
          ).toLowerCase(),
          image:
            product.image ||
            "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300",
          description: product.description || "",
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error loading products:", error);
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
        // Close modal and reset
        setShowInvoiceModal(false);
        setInvoiceItems([]);
        setProductSearchTerm("");
        setInvoiceStep("products");
        setPaymentMethod("cash");
        setAmountPaid("");
        setSelectedCustomer(null);

        // Reload customers to update stats
        await loadCustomers();
        await loadStats();
        await loadTransactions();

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

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );
  console.log("🚀 ~ Customers ~ filteredProducts:", filteredProducts);

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep("products");
    setPaymentMethod("cash");
    setAmountPaid("");
    setSelectedCustomer(null);
  };

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    notes: "",
  });

  // Load customers on component mount
  React.useEffect(() => {
    loadCustomers();
    loadStats();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading clients from API...");

      const response = await customersAPI.getAll();
      console.log("Clients API response:", response);

      if (response.success) {
        interface ApiCustomer {
          _id?: string;
          id?: string;
          name: string;
          email: string;
          phone?: string;
          address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
          };
          totalRevenue?: number;
          activeInvoices?: number;
          lastTransaction?: string | Date;
          status?: string;
          projects?: number;
          avatar?: string;
          notes?: string;
        }

        interface MappedCustomer {
          _id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          totalRevenue: number;
          activeInvoices: number;
          lastTransaction: string;
          status: string;
          projects: number;
          avatar: string;
          notes: string;
        }

        const mappedCustomers: MappedCustomer[] = (
          response.data as ApiCustomer[]
        ).map(
          (apiCustomer: ApiCustomer): MappedCustomer => ({
            _id: apiCustomer._id || "",
            name: apiCustomer.name,
            email: apiCustomer.email,
            phone: apiCustomer.phone || "",
            address:
              `${apiCustomer.address?.street || ""} ${
                apiCustomer.address?.city || ""
              } ${apiCustomer.address?.state || ""} ${
                apiCustomer.address?.zipCode || ""
              }`.trim() || "No address provided",
            totalRevenue: apiCustomer.totalRevenue || 0,
            activeInvoices: apiCustomer.activeInvoices || 0,
            lastTransaction: apiCustomer.lastTransaction
              ? new Date(apiCustomer.lastTransaction)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: apiCustomer.status || "active",
            projects: apiCustomer.projects || 0,
            avatar:
              apiCustomer.avatar ||
              apiCustomer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
            notes: apiCustomer.notes || "",
          })
        );
        setCustomers(mappedCustomers);
      } else {
        setError(response.message || "Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await customersAPI.getStats();
      if (response.success) {
        setStats({
          totalCustomers: response.data.totalCustomers || 0,
          activeCustomers: response.data.activeCustomers || 0,
          totalRevenue: response.data.totalRevenue || 0,
          totalActiveInvoices: response.data.totalActiveInvoices || 0,
          newCustomersThisMonth: 3, // This would be calculated from recent clients
        });
      }
    } catch (error) {
      console.error("Error loading client stats:", error);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.email) {
      try {
        setIsSubmitting(true);
        setError(null);

        console.log("Creating client with data:", newCustomer);
        const response = await customersAPI.create(newCustomer);

        if (response.success) {
          await loadCustomers(); // Reload clients list
          await loadStats(); // Reload stats
          setNewCustomer({
            name: "",
            email: "",
            phone: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            notes: "",
          });
          setShowAddModal(false);
        } else {
          setError(response.message || "Failed to create client");
        }
      } catch (error) {
        console.error("Error creating client:", error);
        setError("Failed to create client. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditCustomer = async () => {
    if (selectedCustomer) {
      try {
        setIsSubmitting(true);
        setError(null);

        const updateData = {
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: {
            street:
              typeof selectedCustomer.address === "object" &&
              selectedCustomer.address?.street
                ? selectedCustomer.address.street
                : "",
            city:
              typeof selectedCustomer.address === "object" &&
              selectedCustomer.address?.city
                ? selectedCustomer.address.city
                : "",
            state:
              typeof selectedCustomer.address === "object" &&
              selectedCustomer.address?.state
                ? selectedCustomer.address.state
                : "",
            zipCode:
              typeof selectedCustomer.address === "object" &&
              selectedCustomer.address?.zipCode
                ? selectedCustomer.address.zipCode
                : "",
            country:
              typeof selectedCustomer.address === "object" &&
              selectedCustomer.address?.country
                ? selectedCustomer.address.country
                : "",
          },
          status: selectedCustomer.status,
          notes: selectedCustomer.notes,
        };

        console.log("Updating client with data:", updateData);
        const response = await customersAPI.update(
          selectedCustomer._id,
          updateData
        );

        if (response.success) {
          await loadCustomers(); // Reload clients list
          await loadStats(); // Reload stats
          setShowEditModal(false);
          setSelectedCustomer(null);
        } else {
          setError(response.message || "Failed to update client");
        }
      } catch (error) {
        console.error("Error updating client:", error);
        setError("Failed to update client. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm(t("customers.delete.confirm"))) {
      try {
        setError(null);
        console.log("Deleting customer:", id);

        const response = await customersAPI.delete(id);

        if (response.success) {
          await loadCustomers(); // Reload customers list
          await loadStats(); // Reload stats
        } else {
          setError(response.message || "Failed to delete customer");
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        setError("Failed to delete customer. Please try again.");
      }
    }
  };

  // Permission check
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const canDelete = user?.role === "admin";

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("customers.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.customers")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("customers.title")}
      />

      <div className="p-6 space-y-6">
        {/* Error Banner */}
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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div></div>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                document.documentElement.dir === "rtl"
                  ? "space-x-reverse space-x-2"
                  : "space-x-2"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("customers.add.customer")}
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("customers.stats.active")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.activeCustomers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("customers.stats.total.revenue")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("customers.stats.active.invoices")}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalActiveInvoices}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("customers.stats.this.month")}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  +{stats.newCustomersThisMonth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("customers.stats.new.customers")}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search
                className={`w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 ${
                  document.documentElement.dir === "rtl" ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                placeholder={t("customers.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  document.documentElement.dir === "rtl"
                    ? "pr-10 pl-4"
                    : "pl-10 pr-4"
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">{t("customers.filter.all.status")}</option>
              <option value="active">{t("customers.status.active")}</option>
              <option value="inactive">{t("customers.status.inactive")}</option>
            </select>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex items-center ${
                      document.documentElement.dir === "rtl"
                        ? "space-x-reverse space-x-3"
                        : "space-x-3"
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {customer.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          customer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex ${
                      document.documentElement.dir === "rtl"
                        ? "space-x-reverse space-x-2"
                        : "space-x-2"
                    }`}
                  >
                    {canEdit && (
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors"
                        title={t("customerss.actions.edit")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                        title={t("customers.actions.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${
                      document.documentElement.dir === "rtl"
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <Mail
                      className={`w-4 h-4 text-gray-400 ${
                        document.documentElement.dir === "rtl" ? "ml-2" : "mr-2"
                      }`}
                    />
                    {customer.email}
                  </div>
                  <div
                    className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${
                      document.documentElement.dir === "rtl"
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <Phone
                      className={`w-4 h-4 text-gray-400 ${
                        document.documentElement.dir === "rtl" ? "ml-2" : "mr-2"
                      }`}
                    />
                    {customer.phone}
                  </div>
                  <div
                    className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${
                      document.documentElement.dir === "rtl"
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <MapPin
                      className={`w-4 h-4 text-gray-400 ${
                        document.documentElement.dir === "rtl" ? "ml-2" : "mr-2"
                      }`}
                    />
                    {typeof customer.address === "string"
                      ? customer.address
                      : [
                          customer.address?.street,
                          customer.address?.city,
                          customer.address?.state,
                          customer.address?.zipCode,
                          customer.address?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "No address provided"}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("customers.total.revenue")}
                      </p>
                      <p className="font-semibold text-green-600">
                        ${(customer.totalRevenue ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("customers.projects")}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {customer.projects}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("customers.active.invoices")}
                      </p>
                      <p className="font-semibold text-orange-600">
                        {customer.activeInvoices}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("customers.last.transaction")}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                        {customer.lastTransaction
                          ? new Date(
                              customer.lastTransaction
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex ${
                    document.documentElement.dir === "rtl"
                      ? "space-x-reverse space-x-2"
                      : "space-x-2"
                  }`}
                >
                  <button
                    className="flex-1 bg-blue-50 text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    onClick={() => handleCreateInvoice(customer)}
                  >
                    {t("customers.create.invoice")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("customers.empty.title")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("customers.empty.subtitle")}
            </p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("customers.add.title")}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.company.name")}
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.company.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.email")}
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.email.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.phone")}
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.phone.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.address")}
                </label>
                <textarea
                  rows={3}
                  value={`${newCustomer.address.street} ${newCustomer.address.city} ${newCustomer.address.state} ${newCustomer.address.zipCode}`.trim()}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.address.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.notes")}
                </label>
                <textarea
                  rows={2}
                  value={newCustomer.notes}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.notes.placeholder")}
                />
              </div>
              <div
                className={`flex pt-4 ${
                  document.documentElement.dir === "rtl"
                    ? "space-x-reverse space-x-3"
                    : "space-x-3"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCustomer({
                      name: "",
                      email: "",
                      phone: "",
                      address: {
                        street: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "",
                      },
                      notes: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("customers.form.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomer}
                  disabled={
                    !newCustomer.name || !newCustomer.email || isSubmitting
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isSubmitting
                    ? t("customers.form.adding")
                    : t("customers.form.add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("customers.edit.title")}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.company.name")}
                </label>
                <input
                  type="text"
                  value={selectedCustomer.name}
                  onChange={(e) =>
                    setSelectedCustomer((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.company.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.email")}
                </label>
                <input
                  type="email"
                  value={selectedCustomer.email}
                  onChange={(e) =>
                    setSelectedCustomer((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.email.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.phone")}
                </label>
                <input
                  type="tel"
                  value={selectedCustomer.phone}
                  onChange={(e) =>
                    setSelectedCustomer((prev) =>
                      prev ? { ...prev, phone: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.phone.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.status")}
                </label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) =>
                    setSelectedCustomer((prev) =>
                      prev ? { ...prev, status: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="active">{t("customers.status.active")}</option>
                  <option value="inactive">
                    {t("customers.status.inactive")}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("customers.form.notes")}
                </label>
                <textarea
                  rows={2}
                  value={selectedCustomer.notes}
                  onChange={(e) =>
                    setSelectedCustomer((prev) =>
                      prev ? { ...prev, notes: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("customers.form.notes.placeholder")}
                />
              </div>
              <div
                className={`flex pt-4 ${
                  document.documentElement.dir === "rtl"
                    ? "space-x-reverse space-x-3"
                    : "space-x-3"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("customers.form.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleEditCustomer}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? t("customers.form.saving")
                    : t("customers.form.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          selectedCustomer={selectedCustomer}
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

export default CustomersPage;
