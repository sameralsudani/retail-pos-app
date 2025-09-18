import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem, Customer, Transaction } from '../types';
import { 
  productsAPI, 
  categoriesAPI, 
  customersAPI, 
  transactionsAPI, 
  suppliersAPI 
} from '../services/api';
import { useAuth } from './AuthContext';

interface StoreState {
  // Products & Inventory
  products: Product[];
  categories: any[];
  suppliers: any[];
  
  // Cart Management
  cartItems: CartItem[];
  
  // Customer Management
  customers: Customer[];
  currentCustomer: Customer | null;
  
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
  removeProduct: (productId: string) => void;
  loadProducts: () => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Customer Actions
  setCurrentCustomer: (customer: Customer | null) => void;
  addCustomer: (customer: Customer) => Promise<Customer | null>;
  loadCustomers: () => Promise<void>;
  
  // Transaction Actions
  completeTransaction: (paymentMethod: string, amountPaid: number) => void;
  loadTransactions: () => Promise<void>;
  
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
    customers: [],
    currentCustomer: null,
    transactions: [],
    lastTransaction: null,
    searchTerm: '',
    selectedCategory: 'all',
    barcodeInput: '',
    isLoading: false,
    error: null
  });

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading initial data...');
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      console.log('Starting to load initial data...');
      setLoading(true);
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadCustomers(),
        loadSuppliers(),
        loadTransactions()
      ]);
      console.log('Initial data loading completed');
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  // Utility Actions
  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  // API Integration Functions
  const loadProducts = async () => {
    try {
      console.log('Loading products from API...');
      const response = await productsAPI.getAll();
      console.log('Products API response:', response);
      
      if (response.success) {
        const products = response.data.map(product => {
          const mappedProduct = {
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            category: product.category?.name || product.category,
            sku: product.sku,
            stock: product.stock,
            image: product.image || 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300',
            description: product.description || '',
            costPrice: product.costPrice,
            reorderLevel: product.reorderLevel,
            supplier: product.supplier?.name || product.supplier
          };
          console.log('Mapped product:', mappedProduct);
          return mappedProduct;
        });
        console.log('Processed products:', products.length);
        setState(prev => ({ ...prev, products }));
      } else {
        console.error('Failed to load products:', response);
        // Fallback to sample data if API fails
        console.log('Using fallback sample data...');
        const { products: sampleProducts } = await import('../data/products');
        setState(prev => ({ ...prev, products: sampleProducts }));
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to sample data if API fails
      console.log('Using fallback sample data due to error...');
      try {
        const { products: sampleProducts } = await import('../data/products');
        setState(prev => ({ ...prev, products: sampleProducts }));
        setError('Using sample data - backend connection failed');
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError);
        setError('Failed to load products');
      }
      setError('Failed to load products');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setState(prev => ({ ...prev, categories: response.data }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      if (response.success) {
        const customers = response.data.map(customer => ({
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          loyaltyPoints: customer.loyaltyPoints
        }));
        setState(prev => ({ ...prev, customers }));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers');
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.success) {
        setState(prev => ({ ...prev, suppliers: response.data }));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError('Failed to load suppliers');
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await transactionsAPI.getAll({ limit: 50 });
      if (response.success) {
        const transactions = response.data.map(transaction => ({
          id: transaction._id,
          items: transaction.items.map(item => ({
            product: {
              id: item.product._id || item.product,
              name: item.productSnapshot.name,
              price: item.unitPrice,
              category: '',
              sku: item.productSnapshot.sku,
              stock: 0,
              image: '',
              description: ''
            },
            quantity: item.quantity
          })),
          subtotal: transaction.subtotal,
          tax: transaction.tax,
          total: transaction.total,
          paymentMethod: transaction.paymentMethod,
          amountPaid: transaction.amountPaid,
          change: transaction.change,
          customer: transaction.customer ? {
            id: transaction.customer._id,
            name: transaction.customer.name,
            email: transaction.customer.email,
            phone: transaction.customer.phone || '',
            loyaltyPoints: transaction.customer.loyaltyPoints || 0
          } : null,
          timestamp: new Date(transaction.createdAt),
          cashier: transaction.cashier?.name || 'Unknown'
        }));
        setState(prev => ({ ...prev, transactions }));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions');
    }
  };

  // Product Actions
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
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
        image: product.image
      });
      
      if (response.success) {
        await loadProducts(); // Reload products to get updated data
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      const response = await productsAPI.delete(productId);
      if (response.success) {
        await loadProducts(); // Reload products
      }
    } catch (error) {
      console.error('Error removing product:', error);
      setError('Failed to remove product');
    }
  };

  const addCustomer = async (customer: Customer) => {
    try {
      const response = await customersAPI.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      });
      
      if (response.success) {
        const newCustomer = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          loyaltyPoints: response.data.loyaltyPoints
        };
        setState(prev => ({
          ...prev,
          customers: [...prev.customers, newCustomer]
        }));
        return newCustomer;
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Failed to add customer');
    }
    return null;
  };

  const completeTransaction = async (paymentMethod: string, amountPaid: number) => {
    try {
      console.log('=== FRONTEND TRANSACTION START ===');
      console.log('Cart items:', state.cartItems);
      console.log('Current customer:', state.currentCustomer);
      console.log('Payment method:', paymentMethod);
      console.log('Amount paid:', amountPaid);
      
      const subtotal = getCartSubtotal();
      const tax = getCartTax();
      const total = getCartTotal();
      
      // Validate cart items have valid product IDs
      const invalidItems = state.cartItems.filter(item => !item.product.id);
      if (invalidItems.length > 0) {
        console.error('Invalid cart items found:', invalidItems);
        setError('Invalid products in cart. Please refresh and try again.');
        return;
      }
      
      // Prepare transaction data for backend
      const transactionData = {
        items: state.cartItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity
        })),
        ...(state.currentCustomer?.id && { customer: state.currentCustomer.id }),
        paymentMethod,
        amountPaid,
        discount: 0
      };

      console.log('=== SENDING TRANSACTION DATA ===');
      console.log(JSON.stringify(transactionData, null, 2));

      const response = await transactionsAPI.create(transactionData);
      
      console.log('=== TRANSACTION API RESPONSE ===');
      console.log(response);
      
      if (response.success) {
        const transaction: Transaction = {
          id: response.data._id,
          items: state.cartItems,
          subtotal,
          tax,
          total,
          paymentMethod,
          amountPaid,
          change: amountPaid - total,
          customer: state.currentCustomer,
          timestamp: new Date(response.data.createdAt),
          cashier: user?.name || 'Unknown'
        };

        setState(prev => ({
          ...prev,
          transactions: [transaction, ...prev.transactions],
          lastTransaction: transaction,
          cartItems: [],
          currentCustomer: null
        }));

        // Reload products to update stock levels
        await loadProducts();
      } else {
        console.error('Transaction failed:', response);
        setError(response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      setError(error.message || 'Failed to complete transaction');
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      console.log('Scanning barcode:', barcode);
      const response = await productsAPI.getByBarcode(barcode);
      console.log('Barcode scan response:', response);
      
      if (response.success) {
        const product = {
          id: response.data._id,
          name: response.data.name,
          price: response.data.price,
          category: response.data.category?.name || response.data.category,
          sku: response.data.sku,
          stock: response.data.stock,
          image: response.data.image,
          description: response.data.description
        };
        
        addToCart(product);
        setBarcodeInput('');
        
        // Show success notification
        showNotification(`Added ${product.name} to cart`, 'success');
      } else {
        console.log('Product not found for barcode:', barcode);
        showNotification(`Product not found: ${barcode}`, 'error');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      showNotification(`Product not found: ${barcode}`, 'error');
    }
  };

  // Notification helper
  const showNotification = (message: string, type: 'success' | 'error') => {
    setState(prev => ({
      ...prev,
      barcodeInput: ''
    }));
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
    console.log('Adding product to cart:', product);
    setState(prev => {
      const existingItem = prev.cartItems.find(item => item.product.id === product.id);
      if (existingItem) {
        console.log('Product already in cart, increasing quantity');
        return {
          ...prev,
          cartItems: prev.cartItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      console.log('Adding new product to cart');
      return {
        ...prev,
        cartItems: [...prev.cartItems, { product, quantity: 1 }]
      };
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setState(prev => ({
        ...prev,
        cartItems: prev.cartItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      }));
    }
  };

  const removeFromCart = (productId: string) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter(item => item.product.id !== productId)
    }));
  };

  const clearCart = () => {
    setState(prev => ({
      ...prev,
      cartItems: [],
      currentCustomer: null
    }));
  };

  // Customer Actions
  const setCurrentCustomer = (customer: Customer | null) => {
    setState(prev => ({
      ...prev,
      currentCustomer: customer
    }));
  };

  // Search & Filter Actions
  const setSearchTerm = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  const setSelectedCategory = (category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  };

  const setBarcodeInput = (input: string) => {
    setState(prev => ({ ...prev, barcodeInput: input }));
  };

  // Computed Values
  const getFilteredProducts = () => {
    return state.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCategory = state.selectedCategory === 'all' || product.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getCartSubtotal = () => {
    return state.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
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
    updateProduct,
    addProduct,
    removeProduct,
    loadProducts,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setCurrentCustomer,
    addCustomer,
    loadCustomers,
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
    
    // Computed Values
    getFilteredProducts,
    getCartSubtotal,
    getCartTax,
    getCartTotal
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
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};