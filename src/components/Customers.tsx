import React, { useState } from "react";
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
  Package,
  Minus,
  Calculator,
  CreditCard
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { customersAPI, productsAPI, transactionsAPI } from "../services/api";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Product } from "../types";

interface InvoiceItem {
  product: Product;
  quantity: number;
}

const Customers: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    totalActiveInvoices: 0,
    newClientsThisMonth: 0,
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
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    } | string;
    notes?: string;
    status?: string;
    totalRevenue?: number;
    activeInvoices?: number;
    lastTransaction?: string | Date;
    projects?: number;
    avatar?: string;
  }

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Invoice creation state
  const [products, setProducts] = useState<Product[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [invoiceStep, setInvoiceStep] = useState<'products' | 'review' | 'payment'>('products');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');

  // Create Invoice Functionality
  const handleCreateInvoice = (client: any) => {
    setSelectedClient(client);
    setShowInvoiceModal(true);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep('products');
    setPaymentMethod('cash');
    setAmountPaid('');
    loadProducts();
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await productsAPI.getAll();
      
      if (response.success) {
        const mappedProducts = response.data.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          price: product.price,
          category: (typeof product.category === 'object' ? product.category.name : product.category || '').toLowerCase(),
          sku: product.sku,
          stock: product.stock,
          image: product.image || 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300',
          description: product.description || ''
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addToInvoice = (product: Product) => {
    setInvoiceItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateInvoiceItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setInvoiceItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setInvoiceItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromInvoice = (productId: string) => {
    setInvoiceItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const getInvoiceSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getInvoiceTax = () => {
    return getInvoiceSubtotal() * 0.08; // 8% tax
  };

  const getInvoiceTotal = () => {
    return getInvoiceSubtotal() + getInvoiceTax();
  };

  const submitInvoice = async () => {
    if (!selectedClient) return;
    
    try {
      setIsSubmitting(true);
      setError(null);

      const total = getInvoiceTotal();
      const amountPaidNum = parseFloat(amountPaid) || total;

      if (amountPaidNum < total) {
        setError('Insufficient payment amount');
        return;
      }

      // Create transaction using existing transaction API
      const transactionData = {
        items: invoiceItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity
        })),
        customer: selectedClient.id,
        paymentMethod,
        amountPaid: amountPaidNum,
        discount: 0
      };

      console.log('Creating invoice transaction:', transactionData);
      const response = await transactionsAPI.create(transactionData);

      if (response.success) {
        // Close modal and reset
        setShowInvoiceModal(false);
        setInvoiceItems([]);
        setProductSearchTerm("");
        setInvoiceStep('products');
        setPaymentMethod('cash');
        setAmountPaid('');
        setSelectedClient(null);
        
        // Reload clients to update stats
        await loadClients();
        await loadStats();
        
        // Show success message
        alert(`Invoice created successfully! Transaction ID: ${response.data._id}`);
      } else {
        setError(response.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceItems([]);
    setProductSearchTerm("");
    setInvoiceStep('products');
    setPaymentMethod('cash');
    setAmountPaid('');
    setSelectedClient(null);
  };

  const renderInvoiceModal = () => {
    if (!selectedClient) return null;

    const subtotal = getInvoiceSubtotal();
    const tax = getInvoiceTax();
    const total = getInvoiceTotal();
    const change = parseFloat(amountPaid) - total;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("clients.create.invoice")} - {selectedClient.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {invoiceStep === 'products' ? '1' : invoiceStep === 'review' ? '2' : '3'} of 3
              </p>
            </div>
            <button
              onClick={closeInvoiceModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {invoiceStep === 'products' && (
              <>
                {/* Product Selection */}
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => addToInvoice(product)}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{product.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.sku}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Items Sidebar */}
                <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Invoice Items</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{invoiceItems.length} items</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {invoiceItems.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No items added</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoiceItems.map((item) => (
                          <div key={item.product.id} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.product.name}</h4>
                                <p className="text-xs text-gray-500">{item.product.sku}</p>
                              </div>
                              <button
                                onClick={() => removeFromInvoice(item.product.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateInvoiceItemQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateInvoiceItemQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-sm font-bold text-blue-600">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Invoice Summary */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-blue-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setInvoiceStep('review')}
                      disabled={invoiceItems.length === 0}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Review Invoice
                    </button>
                  </div>
                </div>
              </>
            )}

            {invoiceStep === 'review' && (
              <div className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Invoice Review</h3>
                  
                  {/* Client Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Bill To:</h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedClient.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.phone}</p>
                  </div>

                  {/* Invoice Items */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Items:</h4>
                    <div className="space-y-3">
                      {invoiceItems.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                            <p className="text-sm text-gray-500">{item.quantity} × ${item.product.price.toFixed(2)}</p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-blue-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setInvoiceStep('products')}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back to Products
                    </button>
                    <button
                      onClick={() => setInvoiceStep('payment')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {invoiceStep === 'payment' && (
              <div className="flex-1 p-6">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Payment</h3>
                  
                  {/* Total Amount */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${total.toFixed(2)}</div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['cash', 'card', 'digital'] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            {method === 'cash' && <DollarSign className="h-6 w-6 mx-auto mb-1" />}
                            {method === 'card' && <CreditCard className="h-6 w-6 mx-auto mb-1" />}
                            {method === 'digital' && <Calculator className="h-6 w-6 mx-auto mb-1" />}
                            <div className="text-sm font-medium capitalize">{method}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Paid */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={total.toFixed(2)}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    
                    {/* Quick amount buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => setAmountPaid(total.toFixed(2))}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        Exact Amount
                      </button>
                      <button
                        onClick={() => setAmountPaid((Math.ceil(total / 5) * 5).toFixed(2))}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        ${(Math.ceil(total / 5) * 5).toFixed(2)}
                      </button>
                    </div>
                  </div>

                  {/* Change */}
                  {parseFloat(amountPaid) >= total && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-6">
                      <div className="text-sm text-green-700 dark:text-green-400">
                        Change: <span className="font-semibold">${change.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setInvoiceStep('review')}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitInvoice}
                      disabled={isSubmitting || parseFloat(amountPaid) < total}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Invoice'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const [newClient, setNewClient] = useState({
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

  // Load clients on component mount
  React.useEffect(() => {
    loadClients();
    loadStats();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading clients from API...");

      const response = await customersAPI.getAll();
      console.log("Clients API response:", response);

      if (response.success) {
        const mappedClients = response.data.map((apiClient) => ({
          id: apiClient._id || apiClient.id,
          name: apiClient.name,
          email: apiClient.email,
          phone: apiClient.phone || "",
          address:
            `${apiClient.address?.street || ""} ${
              apiClient.address?.city || ""
            } ${apiClient.address?.state || ""} ${
              apiClient.address?.zipCode || ""
            }`.trim() || "No address provided",
          totalRevenue: apiClient.totalRevenue || 0,
          activeInvoices: apiClient.activeInvoices || 0,
          lastTransaction: apiClient.lastTransaction
            ? new Date(apiClient.lastTransaction).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          status: apiClient.status || "active",
          projects: apiClient.projects || 0,
          avatar:
            apiClient.avatar ||
            apiClient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
          notes: apiClient.notes || "",
        }));
        console.log("Mapped clients:", mappedClients);
        setClients(mappedClients);
      } else {
        setError(response.message || "Failed to load clients");
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setError("Failed to load clients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await customersAPI.getStats();
      if (response.success) {
        setStats({
          totalClients: response.data.totalClients || 0,
          activeClients: response.data.activeClients || 0,
          totalRevenue: response.data.totalRevenue || 0,
          totalActiveInvoices: response.data.totalActiveInvoices || 0,
          newClientsThisMonth: 3, // This would be calculated from recent clients
        });
      }
    } catch (error) {
      console.error("Error loading client stats:", error);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddClient = async () => {
    if (newClient.name && newClient.email) {
      try {
        setIsSubmitting(true);
        setError(null);

        console.log("Creating client with data:", newClient);
        const response = await customersAPI.create(newClient);

        if (response.success) {
          await loadClients(); // Reload clients list
          await loadStats(); // Reload stats
          setNewClient({
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

  const handleEditClient = async () => {
    if (selectedClient) {
      try {
        setIsSubmitting(true);
        setError(null);

        const updateData = {
          name: selectedClient.name,
          email: selectedClient.email,
          phone: selectedClient.phone,
          address: {
            street: selectedClient.address?.street || "",
            city: selectedClient.address?.city || "",
            state: selectedClient.address?.state || "",
            zipCode: selectedClient.address?.zipCode || "",
            country: selectedClient.address?.country || "",
          },
          status: selectedClient.status,
          notes: selectedClient.notes,
        };

        console.log("Updating client with data:", updateData);
        const response = await customersAPI.update(selectedClient.id, updateData);

        if (response.success) {
          await loadClients(); // Reload clients list
          await loadStats(); // Reload stats
          setShowEditModal(false);
          setSelectedClient(null);
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

  const handleDeleteClient = async (id: string) => {
    if (confirm(t("clients.delete.confirm"))) {
      try {
        setError(null);
        console.log("Deleting client:", id);

        const response = await customersAPI.delete(id);

        if (response.success) {
          await loadClients(); // Reload clients list
          await loadStats(); // Reload stats
        } else {
          setError(response.message || "Failed to delete client");
        }
      } catch (error) {
        console.error("Error deleting client:", error);
        setError("Failed to delete client. Please try again.");
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
          title={t("clients.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.clients")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("clients.title")}
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
              {t("clients.add.client")}
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("clients.stats.active")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.activeClients}
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
                  {t("clients.stats.total.revenue")}
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
                  {t("clients.stats.active.invoices")}
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
                  {t("clients.stats.this.month")}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  +{stats.newClientsThisMonth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("clients.stats.new.clients")}
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
                placeholder={t("clients.search.placeholder")}
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
              <option value="all">{t("clients.filter.all.status")}</option>
              <option value="active">{t("clients.status.active")}</option>
              <option value="inactive">{t("clients.status.inactive")}</option>
            </select>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
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
                        {client.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {client.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          client.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {client.status}
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
                          setSelectedClient(client);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors"
                        title={t("clients.actions.edit")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                        title={t("clients.actions.delete")}
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
                    {client.email}
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
                    {client.phone}
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
                    {typeof client.address === "string"
                      ? client.address
                      : [
                          client.address?.street,
                          client.address?.city,
                          client.address?.state,
                          client.address?.zipCode,
                          client.address?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "No address provided"}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("clients.total.revenue")}
                      </p>
                      <p className="font-semibold text-green-600">
                        ${client.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("clients.projects")}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {client.projects}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("clients.active.invoices")}
                      </p>
                      <p className="font-semibold text-orange-600">
                        {client.activeInvoices}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("clients.last.transaction")}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                        {new Date(client.lastTransaction).toLocaleDateString()}
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
                    onClick={() => handleCreateInvoice(client)}
                  >
                    {t("clients.create.invoice")}
                  </button>
                  <button className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    {t("clients.view.details")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("clients.empty.title")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("clients.empty.subtitle")}
            </p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("clients.add.title")}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.company.name")}
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.company.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.email")}
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.email.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.phone")}
                </label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.phone.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.address")}
                </label>
                <textarea
                  rows={3}
                  value={`${newClient.address.street} ${newClient.address.city} ${newClient.address.state} ${newClient.address.zipCode}`.trim()}
                  onChange={(e) =>
                    setNewClient((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.address.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.notes")}
                </label>
                <textarea
                  rows={2}
                  value={newClient.notes}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.notes.placeholder")}
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
                    setNewClient({
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
                  {t("clients.form.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleAddClient}
                  disabled={!newClient.name || !newClient.email || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isSubmitting
                    ? t("clients.form.adding")
                    : t("clients.form.add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("clients.edit.title")}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.company.name")}
                </label>
                <input
                  type="text"
                  value={selectedClient.name}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.company.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.email")}
                </label>
                <input
                  type="email"
                  value={selectedClient.email}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.email.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.phone")}
                </label>
                <input
                  type="tel"
                  value={selectedClient.phone}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.phone.placeholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.status")}
                </label>
                <select
                  value={selectedClient.status}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="active">{t("clients.status.active")}</option>
                  <option value="inactive">
                    {t("clients.status.inactive")}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("clients.form.notes")}
                </label>
                <textarea
                  rows={2}
                  value={selectedClient.notes}
                  onChange={(e) =>
                    setSelectedClient((prev) =>
                      prev
                        ? { ...prev, notes: e.target.value }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t("clients.form.notes.placeholder")}
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
                    setSelectedClient(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("clients.form.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleEditClient}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? t("clients.form.saving")
                    : t("clients.form.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && renderInvoiceModal()}

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default Customers;
