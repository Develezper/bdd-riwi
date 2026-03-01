async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    return { raw: text };
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, options);
  const body = await parseResponse(response);

  if (!response.ok) {
    const message = body?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function jsonRequest(method, path, data) {
  return request(path, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

export const api = {
  health() {
    return request('/health');
  },
  getResourcesMeta() {
    return request('/api/meta/resources');
  },
  listClients() {
    return request('/api/clients');
  },
  getClientById(id) {
    return request(`/api/clients/${id}`);
  },
  createClient(payload) {
    return jsonRequest('POST', '/api/clients', payload);
  },
  updateClient(id, payload) {
    return jsonRequest('PUT', `/api/clients/${id}`, payload);
  },
  deleteClient(id) {
    return request(`/api/clients/${id}`, { method: 'DELETE' });
  },
  totalPaidByClient() {
    return request('/api/reports/total-paid-by-client');
  },
  pendingInvoices() {
    return request('/api/reports/pending-invoices');
  },
  transactionsByPlatform(platform) {
    return request(`/api/reports/transactions-by-platform?platform=${encodeURIComponent(platform)}`);
  },
  historyByEmail(email) {
    return request(`/api/clients/${encodeURIComponent(email)}/history`);
  },
  uploadMigration(file) {
    const form = new FormData();
    form.append('file', file);
    return request('/api/migration/upload', {
      method: 'POST',
      body: form
    });
  },
  listGeneric(resource) {
    return request(`/api/generic/${encodeURIComponent(resource)}`);
  },
  getGenericById(resource, id) {
    return request(`/api/generic/${encodeURIComponent(resource)}/${id}`);
  },
  createGeneric(resource, payload) {
    return jsonRequest('POST', `/api/generic/${encodeURIComponent(resource)}`, payload);
  },
  updateGeneric(resource, id, payload) {
    return jsonRequest('PUT', `/api/generic/${encodeURIComponent(resource)}/${id}`, payload);
  },
  deleteGeneric(resource, id) {
    return request(`/api/generic/${encodeURIComponent(resource)}/${id}`, { method: 'DELETE' });
  }
};
