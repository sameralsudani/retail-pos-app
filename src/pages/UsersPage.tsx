import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  User,
  Eye,
  X,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../services/api";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "cashier";
  employeeId: string;
  status: "active" | "inactive";
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UsersPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "cashier" as "admin" | "manager" | "cashier",
    employeeId: "",
  });

  // Load users on component mount
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getAll();

      if (response.success) {
        const mappedUsers = response.data.map((apiUser: {
          _id?: string;
          id?: string;
          name: string;
          email: string;
          phone?: string;
          role: "admin" | "manager" | "cashier";
          employeeId: string;
          isActive: boolean;
          lastLogin?: string | Date;
          createdAt: string | Date;
          updatedAt: string | Date;
        }) => ({
          id: apiUser._id || apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone || "",
          role: apiUser.role,
          employeeId: apiUser.employeeId,
          status: apiUser.isActive
            ? "active"
            : ("inactive" as "active" | "inactive"),
          lastLogin: apiUser.lastLogin
            ? new Date(apiUser.lastLogin)
            : new Date(),
          createdAt: new Date(apiUser.createdAt),
          updatedAt: new Date(apiUser.updatedAt),
        }));
        setUsers(mappedUsers);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((systemUser) => {
    const matchesSearch =
      systemUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      systemUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      systemUser.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || systemUser.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || systemUser.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Permission check - only Admin has full access, Manager has read-only
  const canEdit = user?.role === "admin";
  const canView = user?.role === "admin" || user?.role === "manager";

  // Redirect if user doesn't have permission
  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("users.access.denied.title")}
          </h3>
          <p className="text-gray-500">{t("users.access.denied.message")}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          title={t("users.title")}
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading.users")}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddUser = async () => {
    if (
      newUser.name &&
      newUser.email &&
      newUser.employeeId &&
      newUser.password &&
      canEdit
    ) {
      try {
        setIsSubmitting(true);
        setError(null);

        const response = await usersAPI.create({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          role: newUser.role,
          employeeId: newUser.employeeId,
        });

        if (response.success) {
          await loadUsers(); // Reload users list
          setNewUser({
            name: "",
            email: "",
            phone: "",
            password: "",
            role: "cashier",
            employeeId: "",
          });
          setShowAddModal(false);
        } else {
          setError(response.message || "Failed to create user");
        }
      } catch (error) {
        console.error("Error creating user:", error);
        setError("Failed to create user. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditUser = async () => {
    if (selectedUser && canEdit) {
      try {
        setIsSubmitting(true);
        setError(null);

        const response = await usersAPI.update(selectedUser.id, {
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          isActive: selectedUser.status === "active",
        });

        if (response.success) {
          await loadUsers(); // Reload users list
          setShowEditModal(false);
          setSelectedUser(null);
        } else {
          setError(response.message || "Failed to update user");
        }
      } catch (error) {
        console.error("Error updating user:", error);
        setError("Failed to update user. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (canEdit && confirm(t("users.delete.confirm"))) {
      try {
        setError(null);
        const response = await usersAPI.delete(id);

        if (response.success) {
          await loadUsers(); // Reload users list
        } else {
          setError(response.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "cashier":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const managerUsers = users.filter((u) => u.role === "manager").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        title={t("users.title")}
      />

      <div className="p-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className={`p-2 bg-blue-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("users.stats.total")}
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className={`p-2 bg-green-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("users.stats.active")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
             <div
                className={`p-2 bg-green-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("users.stats.admins")}
                </p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className={`p-2 bg-green-100 rounded-lg ${
                  document.documentElement.dir === "rtl" ? "mr-4" : "ml-4"
                }`}
              >
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("users.stats.managers")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {managerUsers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("users.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("users.filter.all.roles")}</option>
                <option value="admin">{t("auth.role.admin")}</option>
                <option value="manager">{t("auth.role.manager")}</option>
                <option value="cashier">{t("auth.role.cashier")}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("users.filter.all.status")}</option>
                <option value="active">{t("users.status.active")}</option>
                <option value="inactive">{t("users.status.inactive")}</option>
              </select>

              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t("users.add.user")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 w-48 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.table.user")}
                  </th>
                  <th className="py-3 w-48 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.table.contact")}
                  </th>
                  <th className="py-3 w-48 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.table.role")}
                  </th>
                  <th className="py-3 w-48 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.table.status")}
                  </th>
                  <th className="py-3 w-48 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.table.last.login")}
                  </th>
                  <th className="py-3 w-48 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((systemUser) => (
                  <tr key={systemUser.id} className="hover:bg-gray-50">
                    {/* User Info */}
                    <td className="w-48 py-4 align-top whitespace-nowrap ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <div className="flex w-full items-center ltr:flex-row rtl:flex-row-reverse rtl:justify-end">
                        <div className="flex-shrink-0 h-10 w-10 ltr:order-1 rtl:order-2">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex flex-col ltr:items-start rtl:items-end ltr:order-2 rtl:order-1">
                          <div className="text-sm font-medium text-gray-900">
                            {systemUser.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {systemUser.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="w-48 py-4 whitespace-nowrap ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <div className="text-sm text-gray-900">
                        {systemUser.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {systemUser.phone}
                      </div>
                    </td>
                    {/* Role */}
                    <td className="w-48 py-4 whitespace-nowrap ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(systemUser.role)}`}>
                        {t(`auth.role.${systemUser.role}`)}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="w-48 py-4 whitespace-nowrap ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(systemUser.status)}`}>
                        {t(`users.status.${systemUser.status}`)}
                      </span>
                    </td>
                    {/* Last Login */}
                    <td className="w-48 py-4 whitespace-nowrap text-sm text-gray-500 ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <div>{systemUser.lastLogin.toLocaleDateString()}</div>
                      <div>{systemUser.lastLogin.toLocaleTimeString()}</div>
                    </td>
                    {/* Actions */}
                    <td className="w-48 py-4 whitespace-nowrap text-sm font-medium ltr:text-left rtl:text-right ltr:pl-6 rtl:pr-6">
                      <div className="flex items-center ltr:space-x-2 rtl:space-x-reverse rtl:space-x-2 ltr:flex-row rtl:flex-row-reverse rtl:justify-end">
                        {canEdit ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(systemUser);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title={t("users.actions.edit")}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(systemUser.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title={t("users.actions.delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(systemUser);
                              setShowEditModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                            title={t("users.actions.view")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("users.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("users.empty.subtitle")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("users.add.title")}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.name")} *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("users.form.name.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.email")} *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("users.form.email.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.phone")}
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("users.form.phone.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.employee.id")} *
                </label>
                <input
                  type="text"
                  value={newUser.employeeId}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      employeeId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("users.form.employee.id.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.password")} *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("users.form.password.placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.role")} *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      role: e.target.value as "admin" | "manager" | "cashier",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cashier">{t("auth.role.cashier")}</option>
                  <option value="manager">{t("auth.role.manager")}</option>
                  <option value="admin">{t("auth.role.admin")}</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("users.form.cancel")}
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={
                    !newUser.name ||
                    !newUser.email ||
                    !newUser.employeeId ||
                    !newUser.password ||
                    isSubmitting
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t("users.form.adding") : t("users.form.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/View User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {canEdit ? t("users.edit.title") : t("users.view.title")}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.name")} *
                </label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedUser((prev) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.email")} *
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedUser((prev) =>
                            prev ? { ...prev, email: e.target.value } : null
                          )
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.phone")}
                </label>
                <input
                  type="tel"
                  value={selectedUser.phone}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedUser((prev) =>
                            prev ? { ...prev, phone: e.target.value } : null
                          )
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.employee.id")} *
                </label>
                <input
                  type="text"
                  value={selectedUser.employeeId}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedUser((prev) =>
                            prev
                              ? { ...prev, employeeId: e.target.value }
                              : null
                          )
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.role")} *
                </label>
                <select
                  value={selectedUser.role}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  role: e.target.value as
                                    | "admin"
                                    | "manager"
                                    | "cashier",
                                }
                              : null
                          )
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                >
                  <option value="cashier">{t("auth.role.cashier")}</option>
                  <option value="manager">{t("auth.role.manager")}</option>
                  <option value="admin">{t("auth.role.admin")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("users.form.status")} *
                </label>
                <select
                  value={selectedUser.status}
                  onChange={
                    canEdit
                      ? (e) =>
                          setSelectedUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  status: e.target.value as
                                    | "active"
                                    | "inactive",
                                }
                              : null
                          )
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!canEdit}
                >
                  <option value="active">{t("users.status.active")}</option>
                  <option value="inactive">{t("users.status.inactive")}</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <p>
                    {t("users.info.last.login")}:{" "}
                    <span className="font-medium">
                      {selectedUser.lastLogin.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    {t("users.info.created")}:{" "}
                    <span className="font-medium">
                      {selectedUser.createdAt.toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    {t("users.info.updated")}:{" "}
                    <span className="font-medium">
                      {selectedUser.updatedAt.toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("users.form.cancel")}
                </button>
                {canEdit && (
                  <button
                    onClick={handleEditUser}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? t("users.form.saving")
                      : t("users.form.save")}
                  </button>
                )}
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

export default UsersPage;
