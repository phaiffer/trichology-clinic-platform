"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthenticatedUser } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  hiddenForRoles?: AuthenticatedUser["roles"];
};

const navItems: NavItem[] = [
  { href: "/", label: "Painel" },
  { href: "/patients", label: "Pacientes" },
  { href: "/anamnesis", label: "Anamnese" },
  { href: "/photos", label: "Fotos" },
  { href: "/scoring", label: "Pontuação", hiddenForRoles: ["STAFF"] },
  { href: "/reports", label: "Relatórios" },
  { href: "/reminders", label: "Lembretes" },
];

type SidebarProps = {
  currentUser: AuthenticatedUser;
};

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const previousOpenRef = useRef(false);

  const visibleNavItems = navItems.filter(
    (item) =>
      !item.hiddenForRoles ||
      !currentUser.roles.some((role) => item.hiddenForRoles?.includes(role)),
  );

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      firstMobileLinkRef.current?.focus();
    } else if (previousOpenRef.current) {
      toggleButtonRef.current?.focus();
    }
    previousOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  function isItemActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="w-full border-b border-brand-100 bg-white lg:flex lg:min-h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 border-b border-brand-100 px-4 py-4 sm:px-6 lg:block lg:py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
            PhaifferTech
          </p>
          <h1 className="mt-1 text-lg font-semibold text-brand-900 lg:mt-2 lg:text-xl">
            Clínica de Tricologia
          </h1>
          <p className="mt-1 hidden text-sm text-slate-500 lg:mt-2 lg:block">
            Ambiente clínico para avaliação capilar e acompanhamento.
          </p>
        </div>

        <button
          ref={toggleButtonRef}
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-controls="sidebar-mobile-navigation"
          aria-label={
            isMobileMenuOpen
              ? "Fechar menu de navegação"
              : "Abrir menu de navegação"
          }
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 lg:hidden"
        >
          <span>{isMobileMenuOpen ? "Fechar" : "Menu"}</span>
          <span aria-hidden="true" className="text-base leading-none">
            {isMobileMenuOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      <nav
        id="sidebar-mobile-navigation"
        aria-label="Navegação principal (celular)"
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } border-b border-brand-100 bg-white px-3 py-3 lg:hidden`}
      >
        <div className="space-y-1">
          {visibleNavItems.map((item, index) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                ref={index === 0 ? firstMobileLinkRef : undefined}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 font-semibold text-brand-900"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Navegação principal"
        className="hidden flex-1 space-y-1 px-3 py-4 lg:block"
      >
        {visibleNavItems.map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 font-semibold text-brand-900"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
