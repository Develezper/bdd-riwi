import { api } from './api';
import { byId, renderError, renderJson, renderTable } from './ui';

const feedback = byId('history-feedback');
const historyDoc = byId('history-doc');
const historyTable = byId('history-table');

byId('form-history').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get('email') || '').trim();

  try {
    const response = await api.historyByEmail(email);
    renderJson(feedback, { success: true, message: 'Historial encontrado' });
    renderJson(historyDoc, response.data);
    renderTable(historyTable, response.data?.transactions || []);
  } catch (error) {
    renderError(feedback, error);
    historyDoc.textContent = '';
    historyTable.textContent = '';
  }
});

