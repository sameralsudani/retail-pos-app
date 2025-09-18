import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  employeeId: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'cashier' | 'manager';
  employeeId: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = localStorage.getItem('pos_user');
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            if (parsed.token) {
              // Validate token with backend
              const validation = await authAPI.getProfile();
              if (validation.success) {
                setUser(validation.data);
              } else {
                // Token is invalid, remove it
                localStorage.removeItem('pos_user');
              }
            }
          } catch (error) {
            localStorage.removeItem('pos_user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('pos_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        // Store token and user data
        localStorage.setItem('pos_user', JSON.stringify({
          token: result.token,
          ...result.user
        }));
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.login(userData.email, userData.password); // For demo, just login
      
      if (result.success) {
        localStorage.setItem('pos_user', JSON.stringify({
          token: result.token,
          ...result.user
        }));
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('pos_user');
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }
  };

  const changePassword = async (
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to change password. Please try again.' };
    }
  };

  const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.refreshToken();
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to refresh token. Please try again.' };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};