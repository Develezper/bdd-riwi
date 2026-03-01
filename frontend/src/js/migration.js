import { api } from './api';
import { byId, renderError, renderJson } from './ui';

const feedback = byId('migration-feedback');

byId('form-migration').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    renderJson(feedback, { success: false, message: 'Selecciona un archivo valido' });
    return;
  }

  try {
    renderJson(feedback, { success: true, message: 'Procesando archivo...' });
    const response = await api.uploadMigration(file);
    renderJson(feedback, response);
  } catch (error) {
    renderError(feedback, error);
  }
});

