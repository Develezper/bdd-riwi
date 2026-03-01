import { api } from './api';
import { byId, renderError, renderJson, renderTable } from './ui';

const feedback = byId('reports-feedback');
const table = byId('report-table');

function showResult(response) {
  renderJson(feedback, response);
  renderTable(table, response.data || []);
}

byId('btn-total-paid').addEventListener('click', async () => {
  try {
    showResult(await api.totalPaidByClient());
  } catch (error) {
    renderError(feedback, error);
  }
});

byId('btn-pending-invoices').addEventListener('click', async () => {
  try {
    showResult(await api.pendingInvoices());
  } catch (error) {
    renderError(feedback, error);
  }
});

byId('form-platform-report').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const platform = String(formData.get('platform') || '').trim();

  try {
    showResult(await api.transactionsByPlatform(platform));
  } catch (error) {
    renderError(feedback, error);
  }
});

