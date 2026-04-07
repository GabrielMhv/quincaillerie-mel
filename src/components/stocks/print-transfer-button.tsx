"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface PrintTransferButtonProps {
  transferId: string;
}

export function PrintTransferButton({ transferId }: PrintTransferButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const supabase = createClient();

  const handleDownload = async () => {
    console.log("Download started for transferId:", transferId);
    setIsDownloading(true);
    try {
      console.log("Fetching transfer data from Supabase...");
      // 1. Fetch full details (Simplified to exclude non-existent 'phone' column)
      const { data: transfer, error } = await supabase
        .from("stock_transfers")
        .select(
          `
          *,
          from_boutique:boutiques!from_boutique_id(name, address),
          to_boutique:boutiques!to_boutique_id(name, address),
          creator:users!created_by(name)
        `,
        )
        .eq("id", transferId)
        .single();

      if (error) {
        console.error("Supabase transfer query error:", error);
        throw error;
      }

      if (!transfer) {
        console.error("No transfer found for ID:", transferId);
        throw new Error("Transfer introuvable");
      }

      console.log("Transfer header data received:", transfer);

      // 2. Fetch items separately to avoid complex join issues
      const { data: items, error: itemsError } = await supabase
        .from("stock_transfer_items")
        .select(
          `
          quantity,
          product:products(name, id)
        `,
        )
        .eq("transfer_id", transferId);

      if (itemsError) {
        console.error("Supabase items query error:", itemsError);
        throw itemsError;
      }

      console.log("Items data received:", items);

      // 3. Generate PDF using jsPDF
      console.log("Importing jsPDF and autoTable...");
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      console.log("Generating PDF for transfer:", transfer.id);
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("BON DE RÉCEPTION", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Référence : ${transfer.id.slice(0, 8).toUpperCase()}`, 14, 35);
      doc.text(
        `Date d'émission : ${format(new Date(transfer.created_at), "dd/MM/yyyy HH:mm")}`,
        14,
        40,
      );
      if (transfer.updated_at) {
        doc.text(
          `Date de réception : ${format(new Date(transfer.updated_at), "dd/MM/yyyy HH:mm")}`,
          14,
          45,
        );
      }

      // Expéditeur et Destinataire
      doc.setFont("helvetica", "bold");
      doc.text("Boutique Expéditrice (Origine) :", 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`${transfer.from_boutique?.name || "N/A"}`, 14, 60);

      doc.setFont("helvetica", "bold");
      doc.text("Boutique Destinataire (Réception) :", 110, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`${transfer.to_boutique?.name || "N/A"}`, 110, 60);

      const tableData: string[][] = [];

      const transferItems = items || [];
      transferItems.forEach(
        (item: {
          quantity: number;
          product?: { id: string; name: string };
        }) => {
          tableData.push([
            item.product?.id?.slice(0, 8).toUpperCase() || "-",
            item.product?.name || "Produit Inconnu",
            item.quantity.toString(),
          ]);
        },
      );

      autoTable(doc, {
        startY: 70,
        head: [["Réf. Produit", "Désignation", "Quantité Reçue"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129] }, // Emerald color
        margin: { top: 70 },
      });

      const finalY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 20;

      doc.setFont("helvetica", "bold");
      doc.text("Visa Expéditeur", 30, finalY);
      doc.text("Visa Réceptionnaire (Accusé)", 130, finalY);

      doc.setLineWidth(0.5);
      doc.line(20, finalY + 15, 70, finalY + 15);
      doc.line(120, finalY + 15, 180, finalY + 15);

      doc.save(`Transfert_${transfer.id.slice(0, 8)}.pdf`);
      toast.success("Bon de transfert téléchargé !");
    } catch (err: unknown) {
      console.error("PDF Generation Error:", err);
      toast.error(
        err instanceof Error
          ? `Erreur: ${err.message}`
          : "Erreur lors de la génération du PDF",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-10 px-6 rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 font-black tracking-tighter text-xs"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
    </Button>
  );
}
