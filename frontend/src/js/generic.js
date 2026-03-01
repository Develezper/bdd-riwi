import { api } from './api';
import { byId, extractNonEmptyFields, renderError, renderJson, renderTable } from './ui';

const select = byId('resource-select');
const feedback = byId('generic-feedback');
const table = byId('generic-table');
const singleOutput = byId('single-record-output');
const deleteOutput = byId('delete-record-output');
const createForm = byId('form-create-generic');
const updateForm = byId('form-update-generic');

let resources = [];
let current = null;

function inputTypeFor(fieldType) {
  if (fieldType === 'number' || fieldType === 'integer') return 'number';
  if (fieldType === 'email') return 'email';
  if (fieldType === 'date') return 'datetime-local';
  return 'text';
}

function buildFieldControl(field, mode) {
  const wrapper = document.createElement('label');
  wrapper.className = 'stack';

  const label = document.createElement('span');
  label.textContent = `${field.name}${mode === 'create' && field.required ? ' *' : ''}`;

  let control;
  if (field.type === 'enum' && Array.isArray(field.enum)) {
    control = document.createElement('select');
    control.dataset.field = field.name;
    control.name = field.name;

    if (mode === 'update') {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '(sin cambio)';
      control.appendChild(emptyOption);
    }

    for (const option of field.enum) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      control.appendChild(opt);
    }
  } else {
    control = document.createElement('input');
    control.dataset.field = field.name;
    control.name = field.name;
    control.type = inputTypeFor(field.type);
    control.placeholder = field.name;

    if (field.maxLength && control.type === 'text') {
      control.maxLength = field.maxLength;
    }
  }

  if (mode === 'create' && field.required) {
    control.required = true;
  }

  wrapper.append(label, control);
  return wrapper;
}

function buildDynamicForms() {
  if (!current) return;

  createForm.innerHTML = '';
  updateForm.innerHTML = '';

  const createFields = current.fields.filter((field) => field.create);
  const updateFields = current.fields.filter((field) => field.update);

  for (const field of createFields) {
    createForm.appendChild(buildFieldControl(field, 'create'));
  }
  const createButton = document.createElement('button');
  createButton.type = 'submit';
  createButton.textContent = `POST /api/generic/${current.key}`;
  createForm.appendChild(createButton);

  const updateId = document.createElement('input');
  updateId.type = 'number';
  updateId.min = '1';
  updateId.name = 'id';
  updateId.placeholder = `${current.idField} (obligatorio)`;
  updateId.required = true;
  updateForm.appendChild(updateId);

  for (const field of updateFields) {
    updateForm.appendChild(buildFieldControl(field, 'update'));
  }
  const updateButton = document.createElement('button');
  updateButton.type = 'submit';
  updateButton.textContent = `PUT /api/generic/${current.key}/:id`;
  updateForm.appendChild(updateButton);
}

function readDynamicPayload(form) {
  const controls = form.querySelectorAll('[data-field]');
  const payload = {};
  for (const control of controls) {
    payload[control.dataset.field] = control.value;
  }
  return extractNonEmptyFields(payload);
}

async function refreshList() {
  if (!current) return;
  const response = await api.listGeneric(current.key);
  renderJson(feedback, response);
  renderTable(table, response.data || []);
}

function setCurrentResource(key) {
  current = resources.find((item) => item.key === key) || null;
  buildDynamicForms();
}

async function loadResourcesMeta() {
  const response = await api.getResourcesMeta();
  resources = response.data || [];

  select.innerHTML = '';
  for (const resource of resources) {
    const option = document.createElement('option');
    option.value = resource.key;
    option.textContent = `${resource.label} (${resource.key})`;
    select.appendChild(option);
  }

  if (resources.length > 0) {
    setCurrentResource(resources[0].key);
    await refreshList();
  }
}

byId('btn-load-resource').addEventListener('click', async () => {
  try {
    setCurrentResource(select.value);
    await refreshList();
  } catch (error) {
    renderError(feedback, error);
  }
});

byId('btn-list-resource').addEventListener('click', async () => {
  try {
    await refreshList();
  } catch (error) {
    renderError(feedback, error);
  }
});

byId('form-get-by-id').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!current) return;
  const id = Number(byId('record-id-input').value);
  try {
    const response = await api.getGenericById(current.key, id);
    renderJson(singleOutput, response);
  } catch (error) {
    renderError(singleOutput, error);
  }
});

byId('form-delete-by-id').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!current) return;
  const id = Number(byId('delete-id-input').value);
  try {
    const response = await api.deleteGeneric(current.key, id);
    renderJson(deleteOutput, response);
    renderJson(feedback, response);
    await refreshList();
  } catch (error) {
    renderError(deleteOutput, error);
  }
});

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!current) return;
  const payload = readDynamicPayload(createForm);

  try {
    const response = await api.createGeneric(current.key, payload);
    renderJson(feedback, response);
    await refreshList();
    createForm.reset();
  } catch (error) {
    renderError(feedback, error);
  }
});

updateForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!current) return;
  const id = Number(updateForm.elements.id.value);
  const payload = readDynamicPayload(updateForm);

  try {
    const response = await api.updateGeneric(current.key, id, payload);
    renderJson(feedback, response);
    await refreshList();
  } catch (error) {
    renderError(feedback, error);
  }
});

select.addEventListener('change', () => {
  setCurrentResource(select.value);
});

loadResourcesMeta().catch((error) => {
  renderError(feedback, error);
});

