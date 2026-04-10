"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePatientPhoto } from "@/lib/api";

type DeletePhotoButtonProps = {
  patientId: string;
  photoId: string;
  originalFileName: string;
  redirectTo?: string;
};

export function DeletePhotoButton({
  patientId,
  photoId,
  originalFileName,
  redirectTo,
}: DeletePhotoButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete photo "${originalFileName}"? This also removes the file from local storage.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePatientPhoto(patientId, photoId);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to delete patient photo.",
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
      {isDeleting ? "Deleting..." : "Delete photo"}
    </button>
  );
}
