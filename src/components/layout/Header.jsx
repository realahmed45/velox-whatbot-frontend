/**
 * Botlify dashboard top bar (Nov 2026) — replaces the old left sidebar.
 *
 *  [logo] [Today Bookings Messages … Settings  More▾]   [search] [bell] [property] [account] [avatar]
 *
 * - Sticky, white, the ONLY backdrop-blur in the shell.
 * - Tabs live in <TopNav/> (sliding black pill, overflow → "More").
 * - Account switcher = separate businesses; PropertySwitcher = hotels inside
 *   this account (only shown when there are 2+).
 * - On < lg the tabs move to the bottom dock (MobileBottomNav).
 */
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Logo from "@/components/Logo";
import { NotificationBell } from "@/components/notifications";
import TopNav from "./TopNav";
import PropertySwitcher from "./PropertySwitcher";
import AccountSwitcher from "./AccountSwitcher";
import UserMenu from "./UserMenu";

export default function Header({ items = [], badges, onSearchClick, onShortcuts }) {
  return (
    <header className="topbar-glass relative z-30 flex h-[var(--topbar-h)] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] px-3 sm:px-5 lg:gap-5 lg:px-6">
      {/* thin brand line on the very top edge */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5A1F] to-transparent opacity-70" />

      <Link to="/dashboard" className="group flex shrink-0 items-center rounded-lg" aria-label="Botlify — Today">
        <span className="transition-transform duration-300 ease-spring group-hover:-rotate-3 group-active:scale-95">
          <Logo size="sm" />
        </span>
      </Link>

      <span aria-hidden className="hidden h-6 w-px shrink-0 bg-black/[0.08] lg:block" />

      {/* Tabs (desktop) */}
      <div className="hidden min-w-0 flex-1 lg:flex">
        <TopNav items={items} badges={badges} />
      </div>
      <div className="flex-1 lg:hidden" />

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          onClick={onSearchClick}
          className="group flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] text-neutral-500 ring-1 ring-black/[0.08] transition hover:bg-neutral-50 hover:text-neutral-900 hover:ring-black/[0.14] active:scale-[0.97] 2xl:min-w-[200px]"
          aria-label="Search (Ctrl+K)"
          title="Search  ⌘K"
        >
          <Search className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:-rotate-12" />
          <span className="hidden 2xl:inline">Search…</span>
          <span className="kbd ml-auto hidden 2xl:inline-flex">⌘K</span>
        </button>

        <NotificationBell />

        <PropertySwitcher className="hidden sm:block" />
        <AccountSwitcher className="hidden sm:block" />
        <UserMenu onShortcuts={onShortcuts} />
      </div>
    </header>
  );
}
