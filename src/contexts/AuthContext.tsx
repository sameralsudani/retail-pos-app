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
  tenantId: string;
  tenantName?: string;
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
  tenantId?: string;
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
            if (parsed.token && (parsed.id || parsed._id)) {
              // Set user from stored data first
              const userFromStorage = {
                id: parsed.id || parsed._id,
                name: parsed.name,
                email: parsed.email,
                role: parsed.role,
                employeeId: parsed.employeeId,
                phone: parsed.phone,
                isActive: parsed.isActive,
                tenantId: parsed.tenantId,
                tenantName: parsed.tenantName,
                lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : undefined,
                createdAt: new Date(parsed.createdAt),
                updatedAt: new Date(parsed.updatedAt)
              };
              setUser(userFromStorage);
              
              // Validate token in background (optional)
              try {
                await authAPI.getProfile();
              } catch (error) {
                console.warn('Token validation failed, but keeping user logged in:', error);
              }
            } else {
              localStorage.removeItem('pos_user');
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('pos_user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('AuthContext login called with:', { email, password: '***' });
      const result = await authAPI.login(email, password);
      console.log('AuthAPI login result:', result);
      
      if (result.success) {
        // Store complete user data
        const userData = {
          token: result.token,
          id: result.user._id || result.user.id,
          _id: result.user._id || result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          employeeId: result.user.employeeId,
          phone: result.user.phone,
          isActive: result.user.isActive,
          tenantId: result.user.tenantId,
          tenantName: result.user.tenantName,
          lastLogin: result.user.lastLogin,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt
        };
        
        localStorage.setItem('pos_user', JSON.stringify(userData));
        
        // Set user state
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          employeeId: userData.employeeId,
          phone: userData.phone,
          isActive: userData.isActive,
          tenantId: userData.tenantId,
          tenantName: userData.tenantName,
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt)
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please check your credentials and try again.' };
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authAPI.register(userData);
      
      if (result.success) {
        // Store complete user data
        const userDataToStore = {
          token: result.token,
          id: result.user._id || result.user.id,
          _id: result.user._id || result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          employeeId: result.user.employeeId,
          phone: result.user.phone,
          isActive: result.user.isActive,
          tenantId: result.user.tenantId,
          tenantName: result.user.tenantName,
          lastLogin: result.user.lastLogin,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt
        };
        
        localStorage.setItem('pos_user', JSON.stringify(userDataToStore));
        
        // Set user state
        setUser({
          id: userDataToStore.id,
          name: userDataToStore.name,
          email: userDataToStore.email,
          role: userDataToStore.role,
          employeeId: userDataToStore.employeeId,
          phone: userDataToStore.phone,
          isActive: userDataToStore.isActive,
          tenantId: userDataToStore.tenantId,
          tenantName: userDataToStore.tenantName,
          lastLogin: userDataToStore.lastLogin ? new Date(userDataToStore.lastLogin) : undefined,
          createdAt: new Date(userDataToStore.createdAt),
          updatedAt: new Date(userDataToStore.updatedAt)
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
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