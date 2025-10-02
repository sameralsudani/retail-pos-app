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

  

  return (
    <>
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("sales.title")}
      />


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
       
        {/* Recent Sales */}
       
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
