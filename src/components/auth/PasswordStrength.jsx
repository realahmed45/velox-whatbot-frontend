import { checkPassword } from "@/utils/passwordPolicy";

/**
 * Compact password-strength meter + hint. Renders nothing for an empty field.
 * Pass the same { email, name } you pass to the backend so the guidance matches.
 */
export default function PasswordStrength({ password, email, name }) {
  if (!password) return null;
  const { score, label, message, ok } = checkPassword(password, {
    email,
    name,
  });

  const barColors = [
    "bg-red-400",
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-500",
    "bg-emerald-500",
  ];
  const textColors = [
    "text-red-500",
    "text-red-500",
    "text-amber-600",
    "text-lime-600",
    "text-emerald-600",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? barColors[score] : "bg-ink-150 bg-ink-200/60"
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] mt-1 font-medium ${textColors[score]}`}>
        {label}
        {!ok && message ? (
          <span className="text-ink-400 font-normal"> — {message}</span>
        ) : null}
      </p>
    </div>
  );
}
