import React, { useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const clients = [
    {
      id: 1,
      name: 'ABC Corp',
      email: 'contact@abccorp.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business St, City, ST 12345',
      totalRevenue: 15750,
      activeInvoices: 2,
      lastTransaction: '2025-01-12',
      status: 'active',
      projects: 5,
      avatar: 'AC'
    },
    {
      id: 2,
      name: 'XYZ Ltd',
      email: 'info@xyzltd.com',
      phone: '+1 (555) 234-5678',
      address: '456 Corporate Ave, City, ST 12345',
      totalRevenue: 8900,
      activeInvoices: 1,
      lastTransaction: '2025-01-10',
      status: 'active',
      projects: 3,
      avatar: 'XL'
    },
    {
      id: 3,
      name: 'Tech Solutions',
      email: 'hello@techsol.com',
      phone: '+1 (555) 345-6789',
      address: '789 Innovation Dr, City, ST 12345',
      totalRevenue: 22400,
      activeInvoices: 3,
      lastTransaction: '2025-01-08',
      status: 'active',
      projects: 8,
      avatar: 'TS'
    },
    {
      id: 4,
      name: 'Digital Marketing Co',
      email: 'team@digitalmc.com',
      phone: '+1 (555) 456-7890',
      address: '321 Marketing Blvd, City, ST 12345',
      totalRevenue: 5600,
      activeInvoices: 0,
      lastTransaction: '2024-12-28',
      status: 'inactive',
      projects: 2,
      avatar: 'DM'
    },
    {
      id: 5,
      name: 'Creative Agency',
      email: 'studio@creativeag.com',
      phone: '+1 (555) 567-8901',
      address: '654 Design Way, City, ST 12345',
      totalRevenue: 12300,
      activeInvoices: 1,
      lastTransaction: '2025-01-05',
      status: 'active',
      projects: 6,
      avatar: 'CA'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActiveClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalActiveInvoices = clients.reduce((sum, c) => sum + c.activeInvoices, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        title="Clients"
      />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client relationships</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-blue-600">{totalActiveClients}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Invoices</p>
                <p className="text-2xl font-bold text-orange-600">{totalActiveInvoices}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">+3</p>
                <p className="text-xs text-gray-500">New clients</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{client.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {client.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {client.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {client.address}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="font-semibold text-green-600">${client.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Projects</p>
                      <p className="font-semibold text-gray-900">{client.projects}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Active Invoices</p>
                      <p className="font-semibold text-orange-600">{client.activeInvoices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Transaction</p>
                      <p className="font-semibold text-gray-900 text-xs">
                        {new Date(client.lastTransaction).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                  <button className="flex-1 bg-blue-50 text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    Create Invoice
                  </button>
                  <button className="flex-1 bg-gray-50 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Client</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the client..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
};

export default Clients;
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;