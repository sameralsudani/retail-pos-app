import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PosPage from './pages/PosPage';
import TransactionsPage from './pages/TransactionsPage';
import InventoryPage from './pages/InventoryPage';
import CategoryPage from './pages/CategoryPage';
import UsersPage from './pages/UsersPage';
import SupplierPage from './pages/SupplierPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import TenantRegistrationPage from './pages/TenantRegistrationPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
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
                  <Navigate to={user?.role === 'admin' ? '/dashboard' : '/pos'} replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/pos" 
              element={
                <ProtectedRoute>
                  <PosPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <TransactionsPage />
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
              path="/customers" 
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
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
                  <Navigate to={user?.role === 'admin' ? '/dashboard' : '/pos'} replace /> : 
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