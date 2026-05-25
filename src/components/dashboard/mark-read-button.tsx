"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MarkReadButton({
  id,
  status,
}: {
  id: string;
  status?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (status === "read") return null;

  async function markRead() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Erreur lors de la mise à jour");
      }

      toast.success("Message marqué comme lu");
      router.refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("mark read error:", err);
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={markRead}
      disabled={loading}
      variant="outline"
      className="ml-3"
    >
      {loading ? "En cours..." : "Marquer lu"}
    </Button>
  );
}
