import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/anamnesis", label: "Anamnesis" },
  { href: "/photos", label: "Photos" },
  { href: "/scoring", label: "Scoring" },
  { href: "/reports", label: "Reports" },
  { href: "/reminders", label: "Reminders" },
];

export function Sidebar() {
  return (
    <aside className="flex min-h-screen w-full max-w-64 flex-col border-r border-brand-100 bg-white">
      <div className="border-b border-brand-100 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
          Phaiffer Tech
        </p>
        <h1 className="mt-2 text-xl font-semibold text-brand-900">
          Trichology Clinic
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Local-first workspace for clinical operations.
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

