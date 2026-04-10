"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatientScoreResult } from "@/lib/api";

type CreateScoreButtonProps = {
  patientId: string;
  recordId: string;
};

export function CreateScoreButton({
  patientId,
  recordId,
}: CreateScoreButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsSubmitting(true);

    try {
      const score = await createPatientScoreResult(patientId, recordId);
      router.push(`/patients/${patientId}/scores/${score.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to calculate score",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Calculating score..." : "Calculate score"}
      </button>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
