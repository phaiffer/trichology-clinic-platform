"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAnamnesisTemplateStatus } from "@/lib/api";

type TemplateStatusToggleProps = {
  templateId: string;
  active: boolean;
};

export function TemplateStatusToggle({
  templateId,
  active,
}: TemplateStatusToggleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateAnamnesisTemplateStatus(templateId, !active);
      router.refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to update template status",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleToggle}
        className="rounded-full border border-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? "Updating status..."
          : active
            ? "Set inactive"
            : "Set active"}
      </button>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
