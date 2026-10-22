import { LogoutButton } from "@/components/auth/logout-button";
import { formatRole } from "@/lib/formatters";
import { AuthenticatedUser } from "@/lib/types";

type HeaderProps = {
  currentUser: AuthenticatedUser;
};

export function Header({ currentUser }: HeaderProps) {
  const primaryRole = formatRole(currentUser.roles[0]);

  return (
    <header className="flex flex-col gap-3 border-b border-brand-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Operações clínicas</p>
        <h2 className="text-xl font-semibold text-brand-900 sm:text-2xl">
          Painel de Tricologia
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-brand-100 bg-sand px-4 py-2 text-sm font-medium text-brand-700">
          {currentUser.fullName} • {primaryRole}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
