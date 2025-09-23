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

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page to continue</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
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
    </ErrorBoundary>
  );
}

export default App;