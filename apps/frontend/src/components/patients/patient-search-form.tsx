type PatientSearchFormProps = {
  defaultValue: string;
};

export function PatientSearchForm({ defaultValue }: PatientSearchFormProps) {
  return (
    <form className="flex flex-col gap-3 md:flex-row md:items-center">
      <input
        type="search"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search by patient name"
        className="w-full rounded-2xl border border-brand-100 px-4 py-3 text-sm outline-none transition focus:border-brand-500 md:max-w-md"
      />
      <input type="hidden" name="page" value="0" />
      <input type="hidden" name="size" value="10" />
      <button
        type="submit"
        className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
      >
        Search
      </button>
    </form>
  );
}

