import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  CreditCard,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  reportsAPI,
  transactionsAPI,
  productsAPI,
  categoriesAPI,
  suppliersAPI,
} from "../services/api";
import { useCurrency } from "../contexts/CurrencyContext";
import { Product } from "../types";
import NewSaleModal from "../components/NewSaleModal";

const DashboardPage: React.FC = () => {
  const { formatAmount } = useCurrency();

  const { t } = useLanguage();
  const [showSidebar, setShowSidebar] = useState(false);
  type Stat = {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
  };
  type Sale = {
    id: string | number;
    customer: string;
    amount: string;
    time: string;
    items: number;
    cashier: string;
    itemsLabel: string;
  };
  type Alert = {
    id: string | number;
    type: "warning" | "success" | "info";
    message: string;
    time: string;
  };
  interface Category {
    _id: string;
    name: string;
  }
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>(
    []
  );

  // Invoice modal state (for new sale)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  console.log("🚀 ~ DashboardPage ~ showInvoiceModal:", showInvoiceModal);
  const [selectedCustomer, setSelectedCustomer] = useState<Client | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  type InvoiceItem = { product: Product; quantity: number };
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

  // Form state
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    category: "",
    sku: "",
    stock: 0,
    costPrice: 0,
    reorderLevel: 10,
    supplier: "",
    description: "",
    image: "",
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load data on component mount
  const loadInitialData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([loadProducts(), loadCategories(), loadSuppliers()]);
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

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.sku && newItem.price && newItem.category) {
      try {
        setIsSubmitting(true);
        setError(null);

        // Find category ID
        const category = categories.find(
          (cat) => cat.name.toLowerCase() === newItem.category?.toLowerCase()
        );
        if (!category) {
          setError("Invalid category selected");
          return;
        }

        // Find supplier ID if supplier is selected
        let supplierId = undefined;
        if (newItem.supplier) {
          const supplier = suppliers.find(
            (sup) => sup.name.toLowerCase() === newItem.supplier?.toLowerCase()
          );
          supplierId = supplier?._id;
        }

        // Prepare form data for file upload
        const formData = new FormData();
        formData.append("name", newItem.name);
        formData.append("description", newItem.description || "");
        formData.append("price", newItem.price.toString());
        formData.append("costPrice", (newItem.costPrice || 0).toString());
        formData.append("category", category._id);
        formData.append("sku", newItem.sku);
        formData.append("stock", (newItem.stock || 0).toString());
        formData.append(
          "reorderLevel",
          (newItem.reorderLevel || 10).toString()
        );
        if (supplierId) {
          formData.append("supplier", supplierId);
        }
        if (selectedImage) {
          formData.append("image", selectedImage);
        }

        const response = await productsAPI.createWithImage(formData);

        if (response.success) {
          await loadProducts(); // Reload products
          setNewItem({
            name: "",
            price: 0,
            category: "",
            sku: "",
            stock: 0,
            costPrice: 0,
            reorderLevel: 10,
            supplier: "",
            description: "",
            image: "",
          });
          setSelectedImage(null);
          setImagePreview(null);
          setShowAddModal(false);
          toast.success("Product added successfully");
        } else {
          setError(response.message || "Failed to create product");
          toast.error("Failed to create product");
        }
      } catch (error) {
        console.error("Error creating product:", error);
        setError("Failed to create product. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch stats overview
        const overview = await reportsAPI.getOverview();
        // Fetch recent sales (transactions)
        const salesRes = await transactionsAPI.getAll({
          limit: 5,
          sort: "desc",
        });
        // Fetch low stock products
        const lowStockRes = await productsAPI.getAll({ lowStock: true });
        // Fetch active employees (users)

        setStats([
          {
            title: t("dashboard.stats.today.sales"),
            value: overview?.data.sales.totalRevenueToday
              ? formatAmount(overview.data.sales.totalRevenueToday)
              : "$0.00",
            icon: DollarSign,
            color: "bg-green-500",
          },
          {
            title: t("dashboard.stats.totalTransactionsToday"),
            value: overview.data.sales.totalTransactionsToday,
            icon: CreditCard,
            color: "bg-blue-500",
          },
          {
            title: t("dashboard.stats.low.stock"),
            value: lowStockRes?.data?.length ?? "0",
            icon: Package,
            color: "bg-orange-500",
          },
          {
            title: t("dashboard.stats.totalItemsSoldToday"),
            value: overview?.data.sales.totalItemsSoldToday ?? "0",
            icon: ShoppingCart,
            color: "bg-purple-500",
          },
        ]);

        setRecentSales(
          salesRes?.data?.map(
            (sale: {
              id: string | number;
              customer?: { name?: string };
              total: number;
              timestamp: string;
              items?: unknown[];
              cashier: string | { name?: string; employeeId?: string };
            }) => ({
              id: sale.id,
              customer: sale.customer?.name || t("dashboard.walkin.customer"),
              amount: `$${sale.total.toFixed(2)}`,
              time: new Date(sale.timestamp).toLocaleTimeString(),
              items: Array.isArray(sale.items) ? sale.items.length : 0,
              cashier:
                typeof sale.cashier === "object" && sale.cashier !== null
                  ? sale.cashier.name ||
                    sale.cashier.employeeId ||
                    t("dashboard.unknown.cashier")
                  : sale.cashier || t("dashboard.unknown.cashier"),
              itemsLabel: t("dashboard.items"),
            })
          ) || []
        );

        setAlerts([
          ...(lowStockRes?.data?.map(
            (p: { id: string | number; name: string; stock: number }) => ({
              id: p.id,
              type: "warning" as const,
              message: `${p.name} stock running low (${p.stock} units left)`,
              time: "",
            })
          ) || []),
        ]);
      } catch (err) {
        if (typeof err === "object" && err && "message" in err) {
          setError(
            (err as { message: string }).message ||
              "Failed to load dashboard data"
          );
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [t]);

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

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep("products");
    setPaymentMethod("cash");
    setAmountPaid("");
    setSelectedCustomer(null);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading.dashboard")}</p>
        </div>
      </div>
    );
  }

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
        title={t("dashboard.title")}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("dashboard.quick.actions")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={handleNewSale}
              >
                <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("dashboard.new.sale")}
                </span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("dashboard.add.inventory")}
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("dashboard.schedule.staff")}
                </span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("dashboard.view.reports")}
                </span>
              </button>
            </div>
          </div>

          {/* Current Shift */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("dashboard.current.shift")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      SM
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah Miller</p>
                    <p className="text-sm text-gray-600">
                      {t("auth.role.cashier")} • 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  {t("dashboard.on.duty")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      MR
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mike Rodriguez</p>
                    <p className="text-sm text-gray-600">
                      {t("auth.role.manager")} • 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
                <span className="text-blue-600 text-sm font-medium">
                  {t("dashboard.on.duty")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">
                      AT
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alex Thompson</p>
                    <p className="text-sm text-gray-600">
                      {t("auth.role.stockClerk")} • 3:00 PM - 11:00 PM
                    </p>
                  </div>
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  {t("dashboard.starts.at")} 3:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("dashboard.recent.sales")}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div
                      className={`flex items-center ${
                        document.documentElement.dir === "rtl"
                          ? "space-x-reverse space-x-4"
                          : "space-x-4"
                      }`}
                    >
                      <div className="p-2 rounded-full bg-green-100">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {sale.customer}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {sale.items} {sale.itemsLabel} • {sale.cashier} •{" "}
                          {sale.time}
                        </p>
                      </div>
                    </div>
                    <div className="font-semibold text-green-600">
                      {sale.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("dashboard.alerts.notifications")}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      document.documentElement.dir === "rtl"
                        ? "space-x-reverse space-x-3"
                        : "space-x-3"
                    }`}
                  >
                    <div
                      className={`p-1 rounded-full ${
                        alert.type === "warning"
                          ? "bg-orange-100"
                          : alert.type === "success"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {alert.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      ) : alert.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                {t("dashboard.view.all.notifications")}
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("inventory.add.title")}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setNewItem({
                    name: "",
                    price: 0,
                    category: "",
                    sku: "",
                    stock: 0,
                    costPrice: 0,
                    reorderLevel: 10,
                    supplier: "",
                    description: "",
                    image: "",
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("inventory.form.image")}
                </label>
                <div className="flex items-center space-x-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title={t("inventory.form.image.remove")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {selectedImage ? selectedImage.name : "Choose image"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("inventory.form.image.help")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.name")} *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("inventory.form.name.placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.sku")} *
                  </label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("inventory.form.sku.placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.category")} *
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t("inventory.form.select.category")}
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category._id}
                        value={category.name.toLowerCase()}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.supplier")}
                  </label>
                  <select
                    value={newItem.supplier}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t("inventory.form.select.supplier")}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.cost.price")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.costPrice}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        costPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.selling.price")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.stock")} *
                  </label>
                  <input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.form.reorder.level")} *
                  </label>
                  <input
                    type="number"
                    value={newItem.reorderLevel}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        reorderLevel: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.form.description")}
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("inventory.form.description.placeholder")}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setNewItem({
                      name: "",
                      price: 0,
                      category: "",
                      sku: "",
                      stock: 0,
                      costPrice: 0,
                      reorderLevel: 10,
                      supplier: "",
                      description: "",
                      image: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("inventory.form.cancel")}
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={
                    !newItem.name ||
                    !newItem.sku ||
                    !newItem.price ||
                    !newItem.category ||
                    isSubmitting
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? t("inventory.form.adding")
                    : t("inventory.form.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default DashboardPage;
