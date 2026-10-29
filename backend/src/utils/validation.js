const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function normalizeName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

function validateRegistrationInput(body = {}) {
  const errors = {};
  const name = normalizeName(body.name);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : undefined;

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (name.length > 80) {
    errors.name = 'Name cannot exceed 80 characters.';
  } else if (!/^[a-zA-Z0-9\s.'-]+$/.test(name)) {
    errors.name = 'Name contains invalid characters.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (password.length > 128) {
    errors.password = 'Password cannot exceed 128 characters.';
  } else if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  ) {
    errors.password =
      'Password must include uppercase and lowercase letters, plus at least one number or symbol.';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      email,
      password,
    },
  };
}

function validateLoginInput(body = {}) {
  const errors = {};
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length > 128) {
    errors.password = 'Invalid credentials.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      email,
      password,
    },
  };
}

module.exports = {
  normalizeEmail,
  normalizeName,
  validateRegistrationInput,
  validateLoginInput,
};
