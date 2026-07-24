/**
 * Botlify — client-side password policy (mirrors backend src/utils/passwordPolicy.js).
 * Gives live signup/change feedback; the backend remains the authority.
 */

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "qwerty123",
  "111111111",
  "iloveyou",
  "letmein123",
  "admin123",
  "welcome123",
  "botlify123",
  "instagram",
  "changeme123",
]);

export const MIN_PASSWORD_LENGTH = 8;

/**
 * @returns {{ ok, score (0-4), label, message? }}
 */
export function checkPassword(password, { email, name } = {}) {
  const pw = String(password || "");
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

  if (pw.length === 0) return { ok: false, score: 0, label: "" };
  if (pw.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      score: 0,
      label: labels[0],
      message: "At least 8 characters.",
    };
  }
  if (pw.length > 128) {
    return { ok: false, score: 0, label: labels[0], message: "Too long." };
  }

  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasNumber, hasSymbol].filter(
    Boolean,
  ).length;

  if (classes < 3) {
    return {
      ok: false,
      score: 1,
      label: labels[1],
      message: "Mix upper, lower, numbers & symbols (any 3).",
    };
  }

  const lower = pw.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return {
      ok: false,
      score: 1,
      label: labels[1],
      message: "That password is too common.",
    };
  }

  const localPart = String(email || "").split("@")[0]?.toLowerCase();
  if (localPart && localPart.length >= 4 && lower.includes(localPart)) {
    return {
      ok: false,
      score: 1,
      label: labels[1],
      message: "Don't include your email.",
    };
  }
  const firstName = String(name || "")
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase();
  if (firstName && firstName.length >= 4 && lower.includes(firstName)) {
    return {
      ok: false,
      score: 1,
      label: labels[1],
      message: "Don't include your name.",
    };
  }
  if (/(.)\1{5,}/.test(pw)) {
    return {
      ok: false,
      score: 1,
      label: labels[1],
      message: "Too many repeated characters.",
    };
  }

  let score = 2;
  if (pw.length >= 12) score += 1;
  if (classes === 4 && pw.length >= 10) score += 1;
  score = Math.min(score, 4);

  return { ok: true, score, label: labels[score] };
}
