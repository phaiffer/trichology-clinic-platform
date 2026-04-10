import Link from "next/link";

type PaginationControlsProps = {
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  search: string;
};

function createHref(page: number, size: number, search: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  if (search) {
    params.set("search", search);
  }

  return `/patients?${params.toString()}`;
}

export function PaginationControls({
  page,
  size,
  totalPages,
  hasNext,
  hasPrevious,
  search,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-brand-100 px-6 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <p>
        Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
      </p>

      <div className="flex items-center gap-3">
        {hasPrevious ? (
          <Link
            href={createHref(page - 1, size, search)}
            className="rounded-full border border-brand-100 px-4 py-2 font-medium text-brand-700 transition hover:bg-brand-50"
          >
            Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-300">
            Previous
          </span>
        )}

        {hasNext ? (
          <Link
            href={createHref(page + 1, size, search)}
            className="rounded-full border border-brand-100 px-4 py-2 font-medium text-brand-700 transition hover:bg-brand-50"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-300">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
