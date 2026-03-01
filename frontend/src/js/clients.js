import { api } from './api';
import { byId, extractNonEmptyFields, renderError, renderJson, renderTable } from './ui';

const clientsFeedback = byId('clients-feedback');
const clientsTable = byId('clients-table');
const singleClientOutput = byId('single-client-output');
const deleteClientOutput = byId('delete-client-output');

async function refreshClientsTable() {
  const response = await api.listClients();
  renderTable(clientsTable, response.data || []);
  return response;
}

byId('btn-list-clients').addEventListener('click', async () => {
  try {
    const response = await refreshClientsTable();
    renderJson(clientsFeedback, response);
  } catch (error) {
    renderError(clientsFeedback, error);
  }
});

byId('form-get-client').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = Number(byId('get-client-id').value);
  try {
    const response = await api.getClientById(id);
    renderJson(singleClientOutput, response);
  } catch (error) {
    renderError(singleClientOutput, error);
  }
});

byId('form-create-client').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = extractNonEmptyFields(Object.fromEntries(formData.entries()));

  try {
    const response = await api.createClient(payload);
    renderJson(clientsFeedback, response);
    await refreshClientsTable();
    event.currentTarget.reset();
  } catch (error) {
    renderError(clientsFeedback, error);
  }
});

byId('form-update-client').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = Object.fromEntries(formData.entries());
  const id = Number(data.id);
  delete data.id;
  const payload = extractNonEmptyFields(data);

  try {
    const response = await api.updateClient(id, payload);
    renderJson(clientsFeedback, response);
    await refreshClientsTable();
  } catch (error) {
    renderError(clientsFeedback, error);
  }
});

byId('form-delete-client').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const id = Number(formData.get('id'));

  try {
    const response = await api.deleteClient(id);
    renderJson(deleteClientOutput, response);
    renderJson(clientsFeedback, response);
    await refreshClientsTable();
    event.currentTarget.reset();
  } catch (error) {
    renderError(deleteClientOutput, error);
  }
});

refreshClientsTable().catch((error) => {
  renderError(clientsFeedback, error);
});

