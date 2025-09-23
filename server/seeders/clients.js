const Client = require('../models/Client');

const createClients = (tenants) => {
  const clientsForTenant1 = [
    {
      tenantId: tenants[0]._id,
      name: 'ABC Corp',
      email: 'contact@abccorp.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Business St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      totalRevenue: 15750,
      activeInvoices: 2,
      lastTransaction: new Date('2025-01-12'),
      status: 'active',
      projects: 5,
      notes: 'Premium client with multiple ongoing projects'
    },
    {
      tenantId: tenants[0]._id,
      name: 'XYZ Ltd',
      email: 'info@xyzltd.com',
      phone: '+1 (555) 234-5678',
      address: {
        street: '456 Corporate Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      totalRevenue: 8900,
      activeInvoices: 1,
      lastTransaction: new Date('2025-01-10'),
      status: 'active',
      projects: 3,
      notes: 'Regular client, monthly retainer'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Tech Solutions',
      email: 'hello@techsol.com',
      phone: '+1 (555) 345-6789',
      address: {
        street: '789 Innovation Dr',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      totalRevenue: 22400,
      activeInvoices: 3,
      lastTransaction: new Date('2025-01-08'),
      status: 'active',
      projects: 8,
      notes: 'High-value client, enterprise solutions'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Digital Marketing Co',
      email: 'team@digitalmc.com',
      phone: '+1 (555) 456-7890',
      address: {
        street: '321 Marketing Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      totalRevenue: 5600,
      activeInvoices: 0,
      lastTransaction: new Date('2024-12-28'),
      status: 'inactive',
      projects: 2,
      notes: 'Project completed, potential for future work'
    },
    {
      tenantId: tenants[0]._id,
      name: 'Creative Agency',
      email: 'studio@creativeag.com',
      phone: '+1 (555) 567-8901',
      address: {
        street: '654 Design Way',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      totalRevenue: 12300,
      activeInvoices: 1,
      lastTransaction: new Date('2025-01-05'),
      status: 'active',
      projects: 6,
      notes: 'Creative services, seasonal campaigns'
    },
    {
      tenantId: tenants[1]._id,
      name: 'Global Enterprises',
      email: 'contact@globalent.com',
      phone: '+1 (555) 678-9012',
      address: {
        street: '987 Enterprise Blvd',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        country: 'USA'
      },
      totalRevenue: 45000,
      activeInvoices: 5,
      lastTransaction: new Date('2025-01-11'),
      status: 'active',
      projects: 12,
      notes: 'Major enterprise client, long-term contracts'
    },
    {
      tenantId: tenants[1]._id,
      name: 'Startup Hub',
      email: 'hello@startuphub.com',
      phone: '+1 (555) 789-0123',
      address: {
        street: '147 Innovation Center',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA'
      },
      totalRevenue: 3200,
      activeInvoices: 1,
      lastTransaction: new Date('2025-01-09'),
      status: 'active',
      projects: 2,
      notes: 'Growing startup, potential for expansion'
    },
    {
      tenantId: tenants[2]._id,
      name: 'شركة التقنية المتقدمة',
      email: 'info@advancedtech.sa',
      phone: '+966 11 123 4567',
      address: {
        street: 'طريق الملك فهد',
        city: 'الرياض',
        state: 'منطقة الرياض',
        zipCode: '11564',
        country: 'المملكة العربية السعودية'
      },
      totalRevenue: 67500,
      activeInvoices: 4,
      lastTransaction: new Date('2025-01-13'),
      status: 'active',
      projects: 15,
      notes: 'عميل مؤسسي كبير، مشاريع متعددة'
    }
  ];

  return clientsForTenant1;
};

const seedClients = async (tenants) => {
  try {
    console.log('👥 Seeding clients...');
    
    // Clear existing clients
    await Client.deleteMany({});
    
    // Create clients with tenant references
    const clients = createClients(tenants);
    
    // Insert new clients
    const createdClients = await Client.insertMany(clients);
    
    console.log(`✅ Successfully seeded ${createdClients.length} clients`);
    return createdClients;
  } catch (error) {
    console.error('❌ Error seeding clients:', error);
    throw error;
  }
};

module.exports = { seedClients, createClients };