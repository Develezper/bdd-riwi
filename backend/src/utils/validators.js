function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function validateClientPayload(payload, { partial = false } = {}) {
  const errors = [];

  const required = ['identification', 'full_name', 'email'];

  if (!partial) {
    for (const field of required) {
      if (!payload[field] || String(payload[field]).trim() === '') {
        errors.push(`${field} is required`);
      }
    }
  }

  if (partial && Object.keys(payload).length === 0) {
    errors.push('At least one field is required');
  }

  if (payload.identification !== undefined && String(payload.identification).trim().length > 50) {
    errors.push('identification max length is 50');
  }

  if (payload.full_name !== undefined && String(payload.full_name).trim().length > 150) {
    errors.push('full_name max length is 150');
  }

  if (payload.email !== undefined) {
    const email = String(payload.email).trim();
    if (email.length > 150) {
      errors.push('email max length is 150');
    } else if (!isValidEmail(email)) {
      errors.push('email is invalid');
    }
  }

  if (payload.phone !== undefined && String(payload.phone).length > 50) {
    errors.push('phone max length is 50');
  }

  return errors;
}

module.exports = {
  validateClientPayload,
  isValidEmail
};
