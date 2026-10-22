"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePatient } from "@/lib/api";

type DeletePatientButtonProps = {
  patientId: string;
  patientName: string;
};

export function DeletePatientButton({
  patientId,
  patientName,
}: DeletePatientButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir o paciente "${patientName}" permanentemente? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deletePatient(patientId);
      router.push("/patients");
      router.refresh();
    } catch (deletionError) {
      setError(
        deletionError instanceof Error
          ? deletionError.message
          : "Não foi possível excluir o paciente",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isDeleting ? "Excluindo..." : "Excluir paciente"}
      </button>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
