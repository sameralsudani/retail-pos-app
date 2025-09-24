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
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { clientsAPI } from "../services/api";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Clients: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // State management
  const [clients, setClients] = useState<any[]>([]);
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
  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    description: "",
  });
  // Create Invoice Functionality
  const handleCreateInvoice = (client: any) => {
    setSelectedClient(client);
    setShowInvoiceModal(true);
    setInvoiceData({ amount: "", description: "" });
  };

  const submitInvoice = async () => {
    if (!selectedClient) return;
    // TODO: Replace with your actual API call
    try {
      setIsSubmitting(true);
      // Example: await clientsAPI.createInvoice(selectedClient.id, invoiceData);
      // For now, just close the modal and reset
      setShowInvoiceModal(false);
      setInvoiceData({ amount: "", description: "" });
      setSelectedClient(null);
      // Optionally reload clients or show a success message
    } catch (error) {
      setError("Failed to create invoice.");
    } finally {
      setIsSubmitting(false);
    }
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

      const response = await clientsAPI.getAll();
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
      const response = await clientsAPI.getStats();
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
        const response = await clientsAPI.create(newClient);

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
        const response = await clientsAPI.update(selectedClient.id, updateData);

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

        const response = await clientsAPI.delete(id);

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
                    {client.address}
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
                {/* Create Invoice Modal */}
                {showInvoiceModal && selectedClient && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t("clients.create.invoice")}
                      </h2>
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitInvoice();
                        }}
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("clients.form.amount")}
                          </label>
                          <input
                            type="number"
                            value={invoiceData.amount}
                            onChange={(e) =>
                              setInvoiceData((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder={t("clients.form.amount.placeholder") || t("clients.form.amount") || "Amount"}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("clients.form.description")}
                          </label>
                          <textarea
                            rows={2}
                            value={invoiceData.description}
                            onChange={(e) =>
                              setInvoiceData((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder={t("clients.form.description.placeholder") || t("clients.form.description") || "Description"}
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
                              setShowInvoiceModal(false);
                              setInvoiceData({ amount: "", description: "" });
                              setSelectedClient(null);
                            }}
                            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {t("clients.form.cancel")}
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !invoiceData.amount}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                    setSelectedClient((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
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
                    setSelectedClient((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
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
                    setSelectedClient((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
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

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
};

export default Clients;
