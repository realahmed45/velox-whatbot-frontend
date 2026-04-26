/**
 * Tiny client-side validators. Return null on valid, message on error.
 */
export const validators = {
  email: (v) =>
    !v
      ? "Email is required"
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? null
        : "Enter a valid email address",
  password: (v) =>
    !v
      ? "Password is required"
      : v.length < 8
        ? "Password must be at least 8 characters"
        : null,
  required: (label) => (v) =>
    v && String(v).trim() ? null : `${label} is required`,
  minLength: (n, label) => (v) =>
    !v || v.length < n ? `${label} must be at least ${n} characters` : null,
  url: (v) =>
    !v
      ? null
      : /^https?:\/\/[^\s]+$/.test(v)
        ? null
        : "Enter a valid URL (https://…)",
};

export const validate = (values, schema) => {
  const errors = {};
  for (const [key, rule] of Object.entries(schema)) {
    const rules = Array.isArray(rule) ? rule : [rule];
    for (const r of rules) {
      const err = r(values[key]);
      if (err) {
        errors[key] = err;
        break;
      }
    }
  }
  return errors;
};
