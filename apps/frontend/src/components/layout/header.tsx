export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-brand-100 bg-white px-6 py-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Clinical Operations</p>
        <h2 className="text-2xl font-semibold text-brand-900">
          Trichology Dashboard
        </h2>
      </div>

      <div className="rounded-full border border-brand-100 bg-sand px-4 py-2 text-sm font-medium text-brand-700">
        Security baseline enabled
      </div>
    </header>
  );
}

