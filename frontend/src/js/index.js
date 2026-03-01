import { api } from './api';
import { byId, renderError, renderJson } from './ui';

const healthOutput = byId('health-output');
const healthBtn = byId('btn-health');

healthBtn.addEventListener('click', async () => {
  try {
    const response = await api.health();
    renderJson(healthOutput, response);
  } catch (error) {
    renderError(healthOutput, error);
  }
});

