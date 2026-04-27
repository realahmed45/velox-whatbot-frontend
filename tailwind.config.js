/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Botlify primary — deep indigo → vibrant violet (premium SaaS look)
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Warm accent — coral/rose-pink for highlights & premium
        accent: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.12), 0 12px 40px -10px rgba(139,92,246,0.35)",
        "glow-lg":
          "0 0 0 1px rgba(139,92,246,0.18), 0 30px 80px -20px rgba(139,92,246,0.55)",
        "glow-pink":
          "0 0 0 1px rgba(236,72,153,0.18), 0 25px 70px -15px rgba(236,72,153,0.45)",
        card: "0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.04)",
        "card-lg":
          "0 4px 6px -1px rgba(15,23,42,0.05), 0 10px 20px -5px rgba(15,23,42,0.08)",
        hero: "0 25px 60px -15px rgba(124,58,237,0.45)",
        soft: "0 4px 24px -6px rgba(15,23,42,0.08)",
        ring: "0 0 0 4px rgba(139,92,246,0.12)",
        "neon-violet":
          "0 0 24px rgba(139,92,246,0.55), 0 0 64px rgba(139,92,246,0.35)",
        "neon-pink":
          "0 0 24px rgba(236,72,153,0.55), 0 0 64px rgba(236,72,153,0.35)",
        "inner-glow":
          "inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.25)",
        glass:
          "0 8px 32px 0 rgba(15,23,42,0.12), inset 0 1px 0 0 rgba(255,255,255,0.6)",
        "glass-dark":
          "0 8px 32px 0 rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
      perspective: {
        1000: "1000px",
        1500: "1500px",
        2000: "2000px",
      },
      backgroundImage: {
        // Signature gradient — indigo → violet → rose
        "brand-gradient":
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        "brand-gradient-r":
          "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, #f5f3ff 0%, #fff1f2 100%)",
        "premium-gradient": "linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)",
        "dark-mesh":
          "radial-gradient(at 8% 0%, rgba(139,92,246,0.18) 0px, transparent 50%), radial-gradient(at 92% 100%, rgba(236,72,153,0.16) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(99,102,241,0.1) 0px, transparent 50%)",
        "hero-mesh":
          "radial-gradient(ellipse at top left, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.15), transparent 60%), radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)",
        aurora:
          "conic-gradient(from 230.29deg at 51.63% 52.16%, rgba(36,0,255,0.18) 0deg, rgba(0,135,255,0.18) 67.5deg, rgba(108,39,157,0.18) 198.75deg, rgba(24,38,163,0.18) 251.25deg, rgba(54,103,196,0.18) 301.88deg, rgba(105,30,255,0.18) 360deg)",
        "grid-light":
          "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        shine:
          "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
        noise:
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.035'/></svg>\")",
      },
      backgroundSize: {
        "grid-32": "32px 32px",
        "grid-48": "48px 48px",
        "shine-200": "200% 100%",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        blob: "blob 18s ease-in-out infinite",
        orbit: "orbit 24s linear infinite",
        "spin-slow": "spin 16s linear infinite",
        tilt: "tilt 12s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        aurora: "aurora 14s ease infinite",
        shine: "shine 3.5s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientShift: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-40px) scale(1.1)" },
          "66%": { transform: "translate(-20px,30px) scale(0.95)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(40px) rotate(0deg)" },
          "100%": {
            transform: "rotate(360deg) translateX(40px) rotate(-360deg)",
          },
        },
        tilt: {
          "0%,100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        glowPulse: {
          "0%,100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.04)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        aurora: {
          "0%,100%": { backgroundPosition: "0% 50%, 0% 50%" },
          "50%": { backgroundPosition: "100% 50%, 100% 50%" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".perspective-1000": { perspective: "1000px" },
        ".perspective-1500": { perspective: "1500px" },
        ".perspective-2000": { perspective: "2000px" },
        ".preserve-3d": { transformStyle: "preserve-3d" },
        ".backface-hidden": { backfaceVisibility: "hidden" },
        ".rotate-y-6": { transform: "rotateY(6deg)" },
        ".rotate-y-12": { transform: "rotateY(12deg)" },
        ".rotate-x-6": { transform: "rotateX(6deg)" },
        ".rotate-x-12": { transform: "rotateX(12deg)" },
        ".rotate-x-n6": { transform: "rotateX(-6deg)" },
        ".translate-z-20": { transform: "translateZ(20px)" },
        ".text-balance": { textWrap: "balance" },
      });
    },
  ],
};
