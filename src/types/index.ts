export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  image: string;
  description?: string;
  costPrice?: number;
  reorderLevel?: number;
  supplier?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  totalSpent?: number;
  lastVisit?: Date;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  totalSpent?: number;
  lastVisit?: Date;
  notes?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  amountPaid: number;
  customer: Client | null;
  timestamp: Date;
  cashier: string;
  transactionId?: string;
  status?: 'completed' | 'refunded' | 'cancelled' | 'due';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  productCount?: number;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  paymentTerms: string;
  isActive: boolean;
  notes?: string;
}