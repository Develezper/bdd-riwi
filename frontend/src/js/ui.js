export function byId(id) {
  return document.getElementById(id);
}

export function renderJson(element, data) {
  element.textContent = JSON.stringify(data, null, 2);
}

export function renderError(element, error) {
  renderJson(element, {
    message: error.message,
    status: error.status || 500,
    details: error.body?.details || null
  });
}

export function renderTable(container, rows) {
  container.innerHTML = '';

  if (!Array.isArray(rows) || rows.length === 0) {
    container.textContent = 'Sin resultados';
    return;
  }

  const columns = Object.keys(rows[0]);
  const table = document.createElement('table');
  table.className = 'data-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const col of columns) {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const col of columns) {
      const td = document.createElement('td');
      const value = row[col];
      td.textContent = value === null || value === undefined ? '' : String(value);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.append(thead, tbody);
  container.appendChild(table);
}

export function extractNonEmptyFields(obj) {
  const output = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        output[key] = trimmed;
      }
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      output[key] = value;
    }
  }
  return output;
}

