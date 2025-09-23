import React, { useState } from 'react';
import { X, Search, User, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clientsAPI } from '../services/api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRevenue?: number;
  projects?: number;
}

interface ClientModalProps {
  currentClient: Client | null;
  onClose: () => void;
  onSelectClient: (client: Client | null) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ currentClient, onClose, onSelectClient }) => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Load clients on component mount
  React.useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await clientsAPI.getAll();
      
      if (response.success) {
        const mappedClients = response.data.map(apiClient => ({
          id: apiClient._id || apiClient.id,
          name: apiClient.name,
          email: apiClient.email,
          phone: apiClient.phone || '',
          totalRevenue: apiClient.totalRevenue || 0,
          projects: apiClient.projects || 0
        }));
        setClients(mappedClients);
      } else {
        setError(response.message || 'Failed to load clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleAddClient = async () => {
    if (newClient.name && newClient.email) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const response = await clientsAPI.create(newClient);
        
        if (response.success) {
          const createdClient = {
            id: response.data._id,
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone || '',
            totalRevenue: response.data.totalRevenue || 0,
            projects: response.data.projects || 0
          };
          
          setClients(prev => [...prev, createdClient]);
          onSelectClient(createdClient);
          onClose();
        } else {
          setError(response.message || 'Failed to create client');
        }
      } catch (error) {
        console.error('Error creating client:', error);
        setError('Failed to create client');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('client.modal.title')}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!showAddForm ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={t('client.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* No Client Option */}
                  <button
                    onClick={() => {
                      onSelectClient(null);
                      onClose();
                    }}
                    className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
                      !currentClient
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{t('client.modal.noClient')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('client.modal.walkIn')}</p>
                      </div>
                    </div>
                  </button>

                  {/* Client List */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          onSelectClient(client);
                          onClose();
                        }}
                        className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
                          currentClient?.id === client.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                            {client.phone && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredClients.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">{t('client.modal.noResults')}</p>
                    </div>
                  )}
                </>
              )}

              {/* Add New Client Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{t('client.modal.addNew')}</span>
              </button>
            </>
          ) : (
            /* Add Client Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('client.form.name')} *
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('client.form.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('client.form.email')} *
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('client.form.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('client.form.phone')}
                </label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('client.form.phonePlaceholder')}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={!newClient.name || !newClient.email || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientModal;