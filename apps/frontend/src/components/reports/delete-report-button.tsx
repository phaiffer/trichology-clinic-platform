"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePatientReport } from "@/lib/api";

type DeleteReportButtonProps = {
  patientId: string;
  reportId: string;
  reportTitle: string;
  redirectTo?: string;
};

export function DeleteReportButton({
  patientId,
  reportId,
  reportTitle,
  redirectTo,
}: DeleteReportButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete report "${reportTitle}"? This also removes the generated PDF from local storage.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePatientReport(patientId, reportId);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to delete report.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isDeleting ? "Deleting..." : "Delete report"}
    </button>
  );
}
