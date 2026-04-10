import { LogoutButton } from "@/components/auth/logout-button";
import { AuthenticatedUser } from "@/lib/types";

type HeaderProps = {
  currentUser: AuthenticatedUser;
};

export function Header({ currentUser }: HeaderProps) {
  const primaryRole = currentUser.roles[0] ?? "UNKNOWN";

  return (
    <header className="flex items-center justify-between border-b border-brand-100 bg-white px-6 py-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Clinical Operations</p>
        <h2 className="text-2xl font-semibold text-brand-900">
          Trichology Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full border border-brand-100 bg-sand px-4 py-2 text-sm font-medium text-brand-700">
          {currentUser.fullName} • {primaryRole}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
