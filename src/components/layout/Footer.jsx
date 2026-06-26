/**
 * Botlify Unified Footer
 * One footer for entire site - marketing + dashboard pages
 * Professional, clean, enterprise-grade
 */
import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-400 py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo size="sm" dark />
            <p className="text-sm text-ink-500 leading-relaxed">
              The Instagram automation platform for creators and brands. Set up
              once. Sells while you sleep.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/botlify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-500 hover:text-accent transition"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition">
                  Guide
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition">
                  Help & Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-ink-500" />
                <a
                  href="mailto:contactus@botlify.com"
                  className="hover:text-white transition"
                >
                  contactus@botlify.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
          <p>© {new Date().getFullYear()} Botlify. Built for creators.</p>
          <p className="text-xs">Made with care · Karachi · Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
