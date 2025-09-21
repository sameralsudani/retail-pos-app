import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import POSPage from './components/POSPage';
import OrdersPage from './components/OrdersPage';
import InventoryPage from './components/InventoryPage';
import CategoryPage from './components/CategoryPage';
import UsersPage from './components/UsersPage';
import SupplierPage from './components/SupplierPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ReportsPage from './components/ReportsPage';
import TenantRegistrationPage from './components/TenantRegistrationPage';

// Extract tenant from URL path for Render deployment
const getTenantFromPath = () => {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'store' && pathParts[1]) {
    return pathParts[1]; // /store/alistore/...
  } else if (pathParts[0] && pathParts[0] !== 'api' && !['login', 'signup', 'register-store', 'pos', 'orders', 'inventory', 'categories', 'users', 'suppliers', 'profile', 'settings', 'reports'].includes(pathParts[0])) {
    return pathParts[0]; // /alistore/...
  }
  return null;
};

// Component to block admin access to POS
const AdminBlockedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user } = useAuth();
  const tenantFromPath = getTenantFromPath();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Tenant-specific routes for Render deployment */}
          {tenantFromPath && (
            <>
              <Route path={`/${tenantFromPath}/login`} element={<LoginPage />} />
              <Route path={`/${tenantFromPath}/signup`} element={<SignupPage />} />
              <Route path={`/${tenantFromPath}/register-store`} element={<TenantRegistrationPage />} />
              <Route path={`/${tenantFromPath}`} element={
                isAuthenticated ? 
                  user?.role === 'admin' ? 
                    <Navigate to={`/${tenantFromPath}/users`} replace /> : 
                    <Navigate to={`/${tenantFromPath}/pos`} replace /> : 
                  <Navigate to={`/${tenantFromPath}/login`} replace />
              } />
              <Route path={`/${tenantFromPath}/pos`} element={
                <ProtectedRoute>
                  <AdminBlockedRoute>
                    <POSPage />
                  </AdminBlockedRoute>
                </ProtectedRoute>
              } />
              <Route path={`/${tenantFromPath}/orders`} element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/inventory`} element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/categories`} element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/suppliers`} element={<ProtectedRoute><SupplierPage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/users`} element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/reports`} element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/profile`} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path={`/${tenantFromPath}/settings`} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </>
          )}

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register-store" element={<TenantRegistrationPage />} />
          
          {/* Default route - redirect based on user role */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                user?.role === 'admin' ? 
                  <Navigate to="/users" replace /> : 
                  <Navigate to="/pos" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute>
                <AdminBlockedRoute>
                  <POSPage />
                </AdminBlockedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/suppliers" 
            element={
              <ProtectedRoute>
                <SupplierPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect based on user role */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                user?.role === 'admin' ? 
                  <Navigate to="/users" replace /> : 
                  <Navigate to="/pos" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;