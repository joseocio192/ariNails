export function sanitizeName(value: string, max = 50) {
  let v = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  v = v.replace(/\s+/g, ' ');
  v = v.replace(/^\s+/, '');
  return v.slice(0, max);
}

export function sanitizeUsername(value: string, max = 20) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, max);
}

export function sanitizePhone(value: string, max = 10) {
  return value.replace(/\D/g, '').slice(0, max);
}

export function validateRequired(value: string) {
  return value.trim().length > 0;
}

export function validateEmail(value: string) {
  if (value.indexOf(' ') >= 0) return false;
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return re.test(value.toLowerCase());
}

export function validatePassword(value: string, min = 6) {
  return value.length >= min;
}

export default {
  sanitizeName,
  sanitizeUsername,
  sanitizePhone,
  validateRequired,
  validateEmail,
  validatePassword,
};
