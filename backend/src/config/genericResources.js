const genericResources = {
  clients: {
    key: 'clients',
    label: 'Clients',
    table: 'clients',
    idField: 'id',
    orderBy: 'id ASC',
    selectFields: [
      'id',
      'identification',
      'full_name',
      'email',
      'phone',
      'address',
      'created_at',
      'updated_at'
    ],
    fields: [
      { name: 'identification', type: 'string', required: true, maxLength: 50, create: true, update: true },
      { name: 'full_name', type: 'string', required: true, maxLength: 150, create: true, update: true },
      { name: 'email', type: 'email', required: true, maxLength: 150, create: true, update: true },
      { name: 'phone', type: 'string', required: false, maxLength: 50, nullable: true, create: true, update: true },
      { name: 'address', type: 'string', required: false, nullable: true, create: true, update: true }
    ]
  },
  platforms: {
    key: 'platforms',
    label: 'Platforms',
    table: 'platforms',
    idField: 'id',
    orderBy: 'id ASC',
    selectFields: ['id', 'name', 'created_at'],
    fields: [
      { name: 'name', type: 'string', required: true, maxLength: 50, create: true, update: true }
    ]
  },
  invoices: {
    key: 'invoices',
    label: 'Invoices',
    table: 'invoices',
    idField: 'id',
    orderBy: 'id ASC',
    selectFields: [
      'id',
      'invoice_number',
      'billing_period',
      'billed_amount',
      'paid_amount',
      'status',
      'client_id',
      'created_at',
      'updated_at'
    ],
    fields: [
      { name: 'invoice_number', type: 'string', required: true, maxLength: 50, create: true, update: true },
      { name: 'billing_period', type: 'string', required: true, maxLength: 7, create: true, update: true },
      { name: 'billed_amount', type: 'number', required: true, create: true, update: true },
      { name: 'paid_amount', type: 'number', required: true, create: true, update: true },
      {
        name: 'status',
        type: 'enum',
        required: true,
        enum: ['PENDIENTE', 'PARCIAL', 'PAGADA'],
        create: true,
        update: true
      },
      { name: 'client_id', type: 'integer', required: true, create: true, update: true }
    ]
  },
  transactions: {
    key: 'transactions',
    label: 'Transactions',
    table: 'transactions',
    idField: 'id',
    orderBy: 'id ASC',
    selectFields: [
      'id',
      'txn_code',
      'txn_date',
      'amount',
      'status',
      'transaction_type',
      'client_id',
      'platform_id',
      'invoice_id',
      'created_at',
      'updated_at'
    ],
    fields: [
      { name: 'txn_code', type: 'string', required: true, maxLength: 50, create: true, update: true },
      { name: 'txn_date', type: 'date', required: true, create: true, update: true },
      { name: 'amount', type: 'number', required: true, create: true, update: true },
      {
        name: 'status',
        type: 'enum',
        required: true,
        enum: ['Pendiente', 'Completada', 'Fallida'],
        create: true,
        update: true
      },
      { name: 'transaction_type', type: 'string', required: true, maxLength: 50, create: true, update: true },
      { name: 'client_id', type: 'integer', required: true, create: true, update: true },
      { name: 'platform_id', type: 'integer', required: true, create: true, update: true },
      { name: 'invoice_id', type: 'integer', required: true, create: true, update: true }
    ]
  }
};

function getResourceConfig(resourceKey) {
  return genericResources[resourceKey] || null;
}

function listResourceConfigs() {
  return Object.values(genericResources);
}

module.exports = {
  genericResources,
  getResourceConfig,
  listResourceConfigs
};
