import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Store, User, MapPin, ArrowRight, ArrowLeft, Check, AlertCircle, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { tenantsAPI } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';

const TenantRegistrationPage = () => {
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  // Form data
  const [storeData, setStoreData] = useState({
    storeName: '',
    subdomain: '',
    description: ''
  });

  const [ownerData, setOwnerData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    confirmPassword: '',
    phone: ''
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);
    try {
      const result = await tenantsAPI.checkSubdomain(subdomain);
      setSubdomainAvailable(result.available);
      if (!result.available) {
        setError(result.message || 'This store name is already taken');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainAvailable(null);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const handleStoreDataChange = (field: string, value: string) => {
    setStoreData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'subdomain') {
      const cleanSubdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setStoreData(prev => ({ ...prev, subdomain: cleanSubdomain }));
      
      if (cleanSubdomain !== value) {
        setError('Store name can only contain lowercase letters, numbers, and hyphens');
      } else {
        setError('');
        if (cleanSubdomain.length >= 3) {
          checkSubdomainAvailability(cleanSubdomain);
        }
      }
    }
  };

  const handleOwnerDataChange = (field: string, value: string) => {
    setOwnerData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleAddressDataChange = (field: string, value: string) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return storeData.storeName && storeData.subdomain && subdomainAvailable;
  };

  const validateStep2 = () => {
    return ownerData.ownerName && 
           ownerData.ownerEmail && 
           ownerData.ownerPassword && 
           ownerData.confirmPassword &&
           ownerData.ownerPassword === ownerData.confirmPassword &&
           ownerData.ownerPassword.length >= 6;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (ownerData.ownerPassword !== ownerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (ownerData.ownerPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const registrationData = {
        storeName: storeData.storeName,
        subdomain: storeData.subdomain,
        description: storeData.description,
        ownerName: ownerData.ownerName,
        ownerEmail: ownerData.ownerEmail,
        ownerPassword: ownerData.ownerPassword,
        phone: ownerData.phone,
        address: addressData
      };

      const result = await tenantsAPI.register(registrationData);
      
      if (result.success) {
        // Store user data and redirect
        const userData = {
          token: result.data.token,
          id: result.data.user._id,
          _id: result.data.user._id,
          name: result.data.user.name,
          email: result.data.user.email,
          role: result.data.user.role,
          employeeId: result.data.user.employeeId,
          phone: result.data.user.phone,
          isActive: result.data.user.isActive,
          tenantId: result.data.user.tenantId,
          tenantName: result.data.tenant.name,
          subdomain: result.data.tenant.subdomain,
          createdAt: result.data.user.createdAt,
          updatedAt: result.data.user.updatedAt
        };
        
        localStorage.setItem('pos_user', JSON.stringify(userData));
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Store Information', icon: Store },
    { number: 2, title: 'Owner Account', icon: User },
    { number: 3, title: 'Store Address', icon: MapPin }
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store Name *
        </label>
        <input
          type="text"
          value={storeData.storeName}
          onChange={(e) => handleStoreDataChange('storeName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your store name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store URL *
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={storeData.subdomain}
            onChange={(e) => handleStoreDataChange('subdomain', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="mystorename"
          />
          <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
            .retailpos.com
          </div>
        </div>
        
        {checkingSubdomain && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Checking availability...
          </div>
        )}
        
        {subdomainAvailable === true && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-2" />
            Store name is available!
          </div>
        )}
        
        {subdomainAvailable === false && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            This store name is already taken
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={storeData.description}
          onChange={(e) => handleStoreDataChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your store (optional)"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={ownerData.ownerName}
          onChange={(e) => handleOwnerDataChange('ownerName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={ownerData.ownerEmail}
          onChange={(e) => handleOwnerDataChange('ownerEmail', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={ownerData.phone}
          onChange={(e) => handleOwnerDataChange('phone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <input
          type="password"
          value={ownerData.ownerPassword}
          onChange={(e) => handleOwnerDataChange('ownerPassword', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Create a password (min 6 characters)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <input
          type="password"
          value={ownerData.confirmPassword}
          onChange={(e) => handleOwnerDataChange('confirmPassword', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Confirm your password"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address
        </label>
        <input
          type="text"
          value={addressData.street}
          onChange={(e) => handleAddressDataChange('street', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={addressData.city}
            onChange={(e) => handleAddressDataChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province
          </label>
          <input
            type="text"
            value={addressData.state}
            onChange={(e) => handleAddressDataChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter state or province"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP/Postal Code
          </label>
          <input
            type="text"
            value={addressData.zipCode}
            onChange={(e) => handleAddressDataChange('zipCode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter ZIP or postal code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            value={addressData.country}
            onChange={(e) => handleAddressDataChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter country"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Registration Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Store:</span> {storeData.storeName}</p>
          <p><span className="font-medium">URL:</span> {storeData.subdomain}.retailpos.com</p>
          <p><span className="font-medium">Owner:</span> {ownerData.ownerName}</p>
          <p><span className="font-medium">Email:</span> {ownerData.ownerEmail}</p>
        </div>
      </div>
    </div>
  );

  const canProceedStep1 = validateStep1();
  const canProceedStep2 = validateStep2();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Receipt className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('header.title')}
            </h1>
          </div>
          <h2 className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Register Your Store
          </h2>
          <div className="mt-4 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      Step {step.number}
                    </div>
                    <div className={`text-xs ${
                      isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Store...</span>
                  </>
                ) : (
                  <>
                    <span>Create Store</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have a store?{' '}
            <a 
              href="/login" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/login';
              }}
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantRegistrationPage;