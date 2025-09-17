import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem, Customer, Transaction } from '../types';
import { products as initialProducts } from '../data/products';

interface StoreState {
  // Products & Inventory
  products: Product[];
  
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
}

interface StoreActions {
  // Product Actions
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  
  // Cart Actions
  addToCart: (product: Product) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Customer Actions
  setCurrentCustomer: (customer: Customer | null) => void;
  addCustomer: (customer: Customer) => void;
  
  // Transaction Actions
  completeTransaction: (paymentMethod: string, amountPaid: number) => void;
  
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
}

type StoreContextType = StoreState & StoreActions;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, setState] = useState<StoreState>({
    products: initialProducts,
    cartItems: [],
    customers: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        loyaltyPoints: 450
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '(555) 987-6543',
        loyaltyPoints: 230
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike@example.com',
        phone: '(555) 456-7890',
        loyaltyPoints: 680
      }
    ],
    currentCustomer: null,
    transactions: [],
    lastTransaction: null,
    searchTerm: '',
    selectedCategory: 'all',
    barcodeInput: ''
  });

  // Product Actions
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    }));
  };

  const addProduct = (product: Product) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
  };

  const removeProduct = (productId: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== productId)
    }));
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    setState(prev => {
      const existingItem = prev.cartItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          ...prev,
          cartItems: prev.cartItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
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

  const addCustomer = (customer: Customer) => {
    setState(prev => ({
      ...prev,
      customers: [...prev.customers, customer]
    }));
  };

  // Transaction Actions
  const completeTransaction = (paymentMethod: string, amountPaid: number) => {
    const subtotal = getCartSubtotal();
    const tax = getCartTax();
    const total = getCartTotal();
    
    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      items: state.cartItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      amountPaid,
      change: amountPaid - total,
      customer: state.currentCustomer,
      timestamp: new Date(),
      cashier: 'John Doe'
    };

    setState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions],
      lastTransaction: transaction,
      cartItems: [],
      currentCustomer: null
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

  const handleBarcodeScanned = (barcode: string) => {
    const product = state.products.find(p => p.sku.toLowerCase() === barcode.toLowerCase());
    
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
      notification.textContent = `Added ${product.name} to cart`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
    } else {
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
      notification.textContent = `Product not found: ${barcode}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
    }
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
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setCurrentCustomer,
    addCustomer,
    completeTransaction,
    setSearchTerm,
    setSelectedCategory,
    setBarcodeInput,
    handleBarcodeScanned,
    
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