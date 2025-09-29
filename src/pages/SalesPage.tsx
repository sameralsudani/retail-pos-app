import React, { useState } from "react";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  Search,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  Package,
  Receipt,
  Barcode,
} from "lucide-react";
import Header from "../components/Header";
import { productsAPI, transactionsAPI } from "../services/api";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../contexts/LanguageContext";

const SalesPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  type SaleItem = {
    id: number;
    name: string;
    price: number;
    barcode: string;
    category: string;
    stock: number;
    quantity: number;
    total: number;
  };
  const { t } = useLanguage();
  const [showSidebar, setShowSidebar] = useState(false);

  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [showPOS, setShowPOS] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const response = await productsAPI.getAll();
        if (response && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          setProductsError("Failed to load products");
        }
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "message" in err) {
          setProductsError((err as { message?: string }).message || "Failed to load products");
        } else {
          setProductsError("Failed to load products");
        }
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  type Transaction = {
  id?: string;
  _id?: string;
  customerName?: string;
  customer?: string | { name?: string };
  items?: SaleItem[] | number;
  cashierName?: string;
  cashier?: string | { name?: string };
  total?: number;
  amount?: number;
  time?: string;
  createdAt?: string;
  paymentMethod?: string;
  payment?: string;
  };
  const [recentSales, setRecentSales] = useState<Transaction[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchSales = async () => {
      setLoadingSales(true);
      setSalesError(null);
      try {
        const response = await transactionsAPI.getAll({ limit: 5, sort: "desc" });
        if (response && Array.isArray(response.data)) {
          setRecentSales(response.data);
        } else {
          setSalesError("Failed to load transactions");
        }
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "message" in err) {
          setSalesError((err as { message?: string }).message || "Failed to load transactions");
        } else {
          setSalesError("Failed to load transactions");
        }
      } finally {
        setLoadingSales(false);
      }
    };
    fetchSales();
  }, []);

  const [salesStats, setSalesStats] = useState([
    {
      title: t("sales.stats.0"),
      value: "-",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: t("sales.stats.1"),
      value: "-",
      icon: Receipt,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: t("sales.stats.2"),
      value: "-",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: t("sales.stats.3"),
      value: "-",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await transactionsAPI.getStats();
        console.log("🚀 ~ fetchStats ~ response:", response)
        if (response && response.data) {
          setSalesStats([
            {
              title: t("sales.stats.0"),
              value: formatAmount(response.data.todaySales ?? 0),
              icon: DollarSign,
              color: "text-green-600",
              bg: "bg-green-100",
            },
            {
              title: t("sales.stats.1"),
              value: String(response.data.totalTransactions ?? "-"),
              icon: Receipt,
              color: "text-blue-600",
              bg: "bg-blue-100",
            },
            {
              title: t("sales.stats.2"),
              value: formatAmount(response.data.avgSale ?? 0),
              icon: TrendingUp,
              color: "text-purple-600",
              bg: "bg-purple-100",
            },
            {
              title: t("sales.stats.3"),
              value: String(response.data.totalItemsSold ?? "-"),
              icon: Package,
              color: "text-orange-600",
              bg: "bg-orange-100",
            },
          ]);
        }
      } catch {
        // Optionally handle error state here
      }
    };
    fetchStats();
  }, [t, formatAmount]);

  type Product = {
    _id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
    sku: string;
  };

  const addToSale = (product: Product) => {
    const existingItem = currentSale.find((item) => item.id === product._id);
    if (existingItem) {
      setCurrentSale(
        currentSale.map((item) =>
          item.id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCurrentSale([
        ...currentSale,
        {
          id: product._id,
          name: product.name,
          price: product.price,
          barcode: product.sku, // Assuming 'sku' is used as barcode
          category: product.category,
          stock: product.stock,
          quantity: 1,
          total: product.price,
        },
      ]);
    }
  };

  const removeFromSale = (productId: number) => {
    setCurrentSale(currentSale.filter((item) => item.id !== productId));
  };

  const getTotalAmount = () => {
    return currentSale.reduce((sum, item) => sum + item.total, 0).toFixed(2);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      product.sku.includes(searchProduct)
  );

  return (
    <>
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("sales.title")}
      />
      <div className="flex items-center justify-end m-6">
        <button
          onClick={() => setShowPOS(!showPOS)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {showPOS ? t("sales.hidePOS") : t("sales.openPOS")}
        </button>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 m-6">
        {salesStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t(`sales.stats.${index}`)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POS System */}
        {showPOS && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("sales.posTitle")}
              </h2>
            </div>
            <div className="p-6">
              {/* Product Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t("sales.searchPlaceholder")}
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600">
                    <Barcode className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {loadingProducts ? (
                  <div className="col-span-3 text-center text-gray-500">Loading products...</div>
                ) : productsError ? (
                  <div className="col-span-3 text-center text-red-500">{productsError}</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-400">No products found</div>
                ) : (
                  filteredProducts.slice(0, 6).map((product) => (
                    <button
                      key={product._id }
                      onClick={() => addToSale({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        sku: product.sku,
                        category: typeof product.category === "object" && product.category !== null && "name" in product.category
                          ? (product.category as { name: string }).name
                          : (typeof product.category === "string" ? product.category : ""),
                        stock: product.stock,
                      })}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{typeof product.stock === "number" ? product.stock : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">
                          {formatAmount(typeof product.price === "number" ? product.price : 0)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {typeof product.category === "object" && product.category !== null && "name" in product.category
                            ? (product.category as { name: string }).name
                            : (typeof product.category === "string" ? product.category : "")}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Current Sale */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Current Sale
                </h3>
                {currentSale.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {t("sales.noItems")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentSale.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × {formatAmount(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {formatAmount(item.total)}
                          </span>
                          <button
                            onClick={() => removeFromSale(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">
                          {t("sales.total")}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatAmount(parseFloat(getTotalAmount()))}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {t("sales.cash")}
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {t("sales.card")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Sales */}
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
            showPOS ? "" : "lg:col-span-3"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("sales.recentSales")}
            </h2>
          </div>
          <div className="p-6">
            {loadingSales ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : salesError ? (
              <div className="text-center text-red-500">{salesError}</div>
            ) : (
              <div className="space-y-4">
                {recentSales.length === 0 ? (
                  <div className="text-center text-gray-400">No transactions found</div>
                ) : (
                  recentSales.map((sale) => (
                    <div
                      key={sale.id || sale._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Receipt className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sale._id}</p>
                          <p className="text-sm text-gray-600">
                              {typeof sale.customerName === "string"
                                ? sale.customerName
                                : typeof sale.customer === "string"
                                ? sale.customer
                                : sale.customer && typeof sale.customer === "object" && "name" in sale.customer && typeof sale.customer.name === "string"
                                ? sale.customer.name
                                : "Walk-in"}
                              {" • "}
                              {Array.isArray(sale.items) ? sale.items.length : (typeof sale.items === "number" ? sale.items : 0)} {t("sales.items")}
                              {" • "}
                              {typeof sale.cashierName === "string"
                                ? sale.cashierName
                                : typeof sale.cashier === "string"
                                ? sale.cashier
                                : sale.cashier && typeof sale.cashier === "object" && "name" in sale.cashier && typeof sale.cashier.name === "string"
                                ? sale.cashier.name
                                : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatAmount(sale.total || sale.amount || 0)}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{sale.time ? sale.time : (sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString() : "")}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              (sale.paymentMethod || sale.payment) === "Card"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {t(`sales.payment.${((sale.paymentMethod || sale.payment || "cash")).toLowerCase()}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {t("sales.performance")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatAmount(47890)}
            </div>
            <div className="text-sm text-gray-600">{t("sales.thisMonth")}</div>
            <div className="text-sm text-green-600 font-medium">
              {"+23.5% " + t("sales.vsLastMonth")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">2,341</div>
            <div className="text-sm text-gray-600">
              {t("sales.transactions")}
            </div>
            <div className="text-sm text-green-600 font-medium">
              {"+18.2% " + t("sales.vsLastMonth")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatAmount(20.45)}
            </div>
            <div className="text-sm text-gray-600">
              {t("sales.avgTransaction")}
            </div>
            <div className="text-sm text-green-600 font-medium">
              {"+4.7% " + t("sales.vsLastMonth")}
            </div>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default SalesPage;
