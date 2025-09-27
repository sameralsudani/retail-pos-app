import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Product,
  CartItem,
  Client,
  Transaction,
  Category,
  Supplier,
} from "../types";
import {
  productsAPI,
  categoriesAPI,
  customersAPI,
  transactionsAPI,
  suppliersAPI,
} from "../services/api";
import { useAuth } from "./AuthContext";

// Extend the Window interface to include storeDataLoading
declare global {
  interface Window {
    storeDataLoading?: boolean;
  }
}

interface StoreState {
  // Products & Inventory
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];

  // Cart Management
  cartItems: CartItem[];

  // Client Management
  clients: Client[];
  currentCustomer: Client | null;

  // Transaction History
  transactions: Transaction[];
  lastTransaction: Transaction | null;

  // UI State
  searchTerm: string;
  selectedCategory: string;
  barcodeInput: string;

  // Loading States
  isLoading: boolean;
  error: string | null;
}

interface StoreActions {
  // Product Actions
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  setCurrentCustomer: (client: Client | null) => void;
  removeProduct: (productId: string) => void;
  loadProducts: () => Promise<void>;

  // Cart Actions
  addToCart: (product: Product) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Client Actions
  addClient: (client: Client) => Promise<Client | null>;
  loadClients: () => Promise<void>;

  // Transaction Actions
  completeTransaction: (
    paymentMethod: string,
    amountPaid: number,
    amountDue: number,
  ) => Promise<void>;
  loadTransactions: () => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>
  ) => Promise<void>;

  // Category Actions
  loadCategories: () => Promise<void>;

  // Supplier Actions
  loadSuppliers: () => Promise<void>;

  // Search & Filter Actions
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setBarcodeInput: (input: string) => void;
  handleBarcodeScanned: (barcode: string) => void;

  // Computed Values
  getFilteredProducts: () => Product[];
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getCartTotal: () => number;

  // Utility Actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type StoreContextType = StoreState & StoreActions;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<StoreState>({
    products: [],
    categories: [],
    suppliers: [],
    cartItems: [],
    clients: [],
    currentCustomer: null,
    transactions: [],
    lastTransaction: null,
    searchTerm: "",
    selectedCategory: "all",
    barcodeInput: "",
    isLoading: false,
    error: null,
  });

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user) {

      // Prevent multiple simultaneous loads with a more robust check
      if (window.storeDataLoading) {
        return;
      }

      // Add delay to prevent race conditions and CORS issues on refresh
      const timer = setTimeout(() => {
        loadInitialData();
      }, 1000); // Increased delay

      return () => {
        clearTimeout(timer);
        window.storeDataLoading = false;
      };
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      if (window.storeDataLoading) {
        console.log("Store data loading already in progress, aborting...");
        return;
      }
      window.storeDataLoading = true;

      setLoading(true);

      // Load data sequentially to prevent overwhelming the server
      try {
        await loadProducts();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await loadCategories();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await loadClients();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await loadSuppliers();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await loadTransactions();
      } catch (error) {
        console.error("Error in sequential loading:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      // Don't set error on refresh, just log it
      if (!window.location.pathname.includes("/login")) {
        setError("Failed to load store data - please refresh");
      }
    } finally {
      window.storeDataLoading = false;
      setLoading(false);
    }
  };

  // Utility Actions
  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  // API Integration Functions
  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();

      if (response.success) {
        interface APIProduct {
          _id?: string;
          id?: string;
          name: string;
          price: number;
          category?: { name: string } | string;
          sku: string;
          stock: number;
          image?: string;
          description?: string;
          costPrice?: number;
          reorderLevel?: number;
          supplier?: { name: string } | string;
        }

        const products: Product[] = response.data.map(
          (product: APIProduct): Product => {
            const mappedProduct: Product = {
              _id: product._id || product.id || "",
              name: product.name,
              price: product.price,
              category: (typeof product.category === "object" &&
              product.category !== null
                ? (product.category as { name: string }).name
                : product.category || ""
              ).toLowerCase(),
              sku: product.sku,
              stock: product.stock,
              image:
                product.image ||
                "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300",
              description: product.description || "",
              costPrice: product.costPrice,
              reorderLevel: product.reorderLevel,
              supplier:
                typeof product.supplier === "object" &&
                product.supplier !== null
                  ? (product.supplier as { name: string }).name
                  : product.supplier,
            };
            return mappedProduct;
          }
        );
        setState((prev) => ({ ...prev, products }));
      } else {
        console.error("Failed to load products:", response);
        // Fallback to sample data if API fails
        console.log("Using fallback sample data...");
        const { products: sampleProducts } = await import("../data/products");
        setState((prev) => ({ ...prev, products: sampleProducts }));
        setError("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      // Fallback to sample data if API fails
      console.log("Using fallback sample data due to error...");
      try {
        const { products: sampleProducts } = await import("../data/products");
        setState((prev) => ({ ...prev, products: sampleProducts }));
        setError("Using sample data - backend connection failed");
      } catch (fallbackError) {
        console.error("Failed to load fallback data:", fallbackError);
        setError("Failed to load products");
      }
      setError("Failed to load products");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setState((prev) => ({ ...prev, categories: response.data }));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Failed to load categories");
    }
  };

  const loadClients = async () => {
    try {
      const response = await customersAPI.getAll();
      if (response.success) {
        interface APIClient {
          _id: string;
          name: string;
          email: string;
          phone: string;
          loyaltyPoints: number;
        }

        interface MappedClient {
          id: string;
          name: string;
          email: string;
          phone: string;
          loyaltyPoints: number;
        }

        const clients: MappedClient[] = (response.data as APIClient[]).map(
          (client: APIClient): MappedClient => ({
            id: client._id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            loyaltyPoints: client.loyaltyPoints,
          })
        );
        setState((prev) => ({ ...prev, clients }));
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setError("Failed to load clients");
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.success) {
        setState((prev) => ({ ...prev, suppliers: response.data }));
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
      setError("Failed to load suppliers");
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionsAPI.getAll({ limit: 50 });
      if (response.success) {
        interface APITransactionItem {
          product: { _id?: string } | string;
          productSnapshot: {
            name: string;
            sku: string;
          };
          unitPrice: number;
          quantity: number;
        }

        interface APITransactionCustomer {
          _id: string;
          name: string;
          email: string;
          phone?: string;
          loyaltyPoints?: number;
        }

        interface APITransactionCashier {
          name?: string;
        }

        interface APITransaction {
          _id: string;
          items: APITransactionItem[];
          status: string;
          total: number;
          paymentMethod: string;
          amountPaid: number;
          dueAmount?: number;
          customer?: APITransactionCustomer | null;
          createdAt: string;
          cashier?: APITransactionCashier;
        }

        const allowedStatuses = ["completed", "refunded", "cancelled", "due"] as const;
        type AllowedStatus = typeof allowedStatuses[number];

        const transactions = (response.data as APITransaction[]).map(
          (transaction) => ({
            id: transaction._id,
            items: transaction.items.map((item) => ({
              product: {
                _id:
                  (item.product as { _id?: string })._id ||
                  (typeof item.product === "string" ? item.product : ""),
                name: item.productSnapshot.name,
                price: item.unitPrice,
                category: "",
                sku: item.productSnapshot.sku,
                stock: 0,
                image: "",
                description: "",
              },
              quantity: item.quantity,
            })),
            total: transaction.total,
            paymentMethod: transaction.paymentMethod,
            amountPaid: transaction.amountPaid,
            dueAmount: transaction.dueAmount || 0,
            status: allowedStatuses.includes(transaction.status as AllowedStatus)
              ? (transaction.status as AllowedStatus)
              : undefined,
            customer: transaction.customer
              ? {
                  id: transaction.customer._id,
                  name: transaction.customer.name,
                  email: transaction.customer.email,
                  phone: transaction.customer.phone || "",
                  loyaltyPoints: transaction.customer.loyaltyPoints || 0,
                }
              : null,
            timestamp: new Date(transaction.createdAt),
            cashier: transaction.cashier?.name || "Unknown",
          })
        );
        setState((prev) => ({ ...prev, transactions }));
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Product Actions
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product._id === productId ? { ...product, ...updates } : product
      ),
    }));
  };

  const addProduct = async (product: Product) => {
    try {
      const response = await productsAPI.create({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        sku: product.sku,
        stock: product.stock,
        image: product.image,
      });

      if (response.success) {
        await loadProducts(); // Reload products to get updated data
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product");
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      const response = await productsAPI.delete(productId);
      if (response.success) {
        await loadProducts(); // Reload products
      }
    } catch (error) {
      console.error("Error removing product:", error);
      setError("Failed to remove product");
    }
  };

  const addClient = async (client: Client) => {
    try {
      const response = await customersAPI.create({
        name: client.name,
        email: client.email,
        phone: client.phone,
      });

      if (response.success) {
        const newClient = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          loyaltyPoints: response.data.loyaltyPoints,
        };
        setState((prev) => ({
          ...prev,
          clients: [...prev.clients, newClient],
        }));
        return newClient;
      }
    } catch (error) {
      console.error("Error adding client:", error);
      setError("Failed to add client");
    }
    return null;
  };

  const completeTransaction = async (
    paymentMethod: string,
    amountPaid: number,
    amountDue: number,
  ) => {
    try {
      const total = getCartTotal();

      const isPartial = amountPaid < total;

      // Validate cart items have valid product IDs
      const invalidItems = state.cartItems.filter((item) => !item.product._id);
      if (invalidItems.length > 0) {
        console.error("Invalid cart items found:", invalidItems);
        setError("Invalid products in cart. Please refresh and try again.");
        return;
      }

      // Prepare transaction data for backend
      const transactionData = {
        items: state.cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        ...(state.currentCustomer?.id && {
          customer: state.currentCustomer.id,
        }),
        paymentMethod,
        amountPaid,
        dueAmount: isPartial ? amountDue : 0,
        isPaid: !isPartial,
      };

      const response = await transactionsAPI.create(transactionData);

      if (response.success) {
        const transaction: Transaction = {
          id: response.data._id,
          items: state.cartItems,
          total,
          paymentMethod,
          amountPaid,
          dueAmount: response.data.dueAmount || 0,
          customer: state.currentCustomer,
          timestamp: new Date(response.data.createdAt),
          cashier: user?.name || "Unknown",
        };

        setState((prev) => ({
          ...prev,
          transactions: [transaction, ...prev.transactions],
          lastTransaction: transaction,
          cartItems: [],
          currentCustomer: null,
        }));

        // Reload products to update stock levels
        await loadProducts();
      } else {
        console.error("Transaction failed:", response);
        setError(response.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Error completing transaction:", error);
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
              "Failed to complete transaction"
          : "Failed to complete transaction"
      );
    }
  };

  // Update Transaction
  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>
  ) => {
    setLoading(true);
    try {
      const response = await transactionsAPI.update(id, updates);
      if (response.success) {
        // Optionally, reload transactions to reflect the update
        await loadTransactions();
      } else {
        setError(response.message || "Failed to update transaction");
      }
    } catch (error) {
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
              "Failed to update transaction"
          : "Failed to update transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      console.log("Scanning barcode:", barcode);
      const response = await productsAPI.getByBarcode(barcode);
      console.log("Barcode scan response:", response);

      if (response.success) {
        const product = {
          _id: response.data._id,
          name: response.data.name,
          price: response.data.price,
          category: response.data.category?.name || response.data.category,
          sku: response.data.sku,
          stock: response.data.stock,
          image: response.data.image,
          description: response.data.description,
        };

        addToCart(product);
        setBarcodeInput("");

        // Show success notification
        showNotification(`Added ${product.name} to cart`, "success");
      } else {
        console.log("Product not found for barcode:", barcode);
        showNotification(`Product not found: ${barcode}`, "error");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      showNotification(`Product not found: ${barcode}`, "error");
    }
  };

  // Notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setState((prev) => ({
      ...prev,
      barcodeInput: "",
    }));

    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    console.log("Adding product to cart:", product);
    setState((prev) => {
      const existingItem = prev.cartItems.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        console.log("Product already in cart, increasing quantity");
        return {
          ...prev,
          cartItems: prev.cartItems.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      console.log("Adding new product to cart");
      return {
        ...prev,
        cartItems: [...prev.cartItems, { product, quantity: 1 }],
      };
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setState((prev) => ({
        ...prev,
        cartItems: prev.cartItems.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        ),
      }));
    }
  };

  const removeFromCart = (productId: string) => {
    setState((prev) => ({
      ...prev,
      cartItems: prev.cartItems.filter((item) => item.product._id !== productId),
    }));
  };

  const clearCart = () => {
    setState((prev) => ({
      ...prev,
      cartItems: [],
      currentCustomer: null,
    }));
  };

  // Client Actions
  const setCurrentCustomer = (client: Client | null) => {
    setState((prev) => ({
      ...prev,
      currentCustomer: client,
    }));
  };

  // Search & Filter Actions
  const setSearchTerm = (term: string) => {
    setState((prev) => ({ ...prev, searchTerm: term }));
  };

  const setSelectedCategory = (category: string) => {
    setState((prev) => ({ ...prev, selectedCategory: category }));
  };

  const setBarcodeInput = (input: string) => {
    setState((prev) => ({ ...prev, barcodeInput: input }));
  };

  // Computed Values
  const getFilteredProducts = () => {
    return state.products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase());
      const matchesCategory =
        state.selectedCategory === "all" ||
        product.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getCartSubtotal = () => {
    return state.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const getCartTax = () => {
    return getCartSubtotal() * 0.08; // 8% tax
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getCartTax();
  };

  const contextValue: StoreContextType = {
    // State
    ...state,

    // Actions
    setCurrentCustomer,
    updateProduct,
    addProduct,
    removeProduct,
    loadProducts,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    addClient,
    loadClients,
    completeTransaction,
    loadTransactions,
    loadCategories,
    loadSuppliers,
    setSearchTerm,
    setSelectedCategory,
    setBarcodeInput,
    handleBarcodeScanned,
    setError,
    setLoading,
    updateTransaction,
    // Computed Values
    getFilteredProducts,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
