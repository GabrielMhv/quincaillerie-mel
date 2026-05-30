"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

interface PrintOrderButtonProps {
  order: any;
}

export function PrintOrderButton({ order }: PrintOrderButtonProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const date = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text("Ets La Championne", 20, 20);
    doc.setFontSize(10);
    doc.text(`Commande: #${(order.id || "").slice(0, 8)}`, 20, 28);
    doc.text(`Date: ${date}`, 20, 34);

    // Group by boutique
    const groups: Record<string, any[]> = {};
    (order.order_items || []).forEach((it: any) => {
      const key = it.boutique?.name || it.boutique_id || "Réseau central";
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    });

    let y = 44;
    const palette = [
      [37, 99, 235],
      [99, 102, 241],
      [16, 185, 129],
      [234, 88, 12],
      [220, 38, 38],
    ];

    Object.entries(groups).forEach(([name, items], idx) => {
      const color = palette[idx % palette.length];
      doc.setTextColor(...color);
      doc.setFontSize(12);
      doc.text(name, 20, y);
      doc.setTextColor(0, 0, 0);

      const rows = items.map((it: any) => [
        it.product?.name || "Produit",
        formatCurrency(it.price || it.unit_price || 0),
        it.quantity,
        formatCurrency((it.price || it.unit_price || 0) * (it.quantity || 0)),
      ]);

      autoTable(doc, {
        startY: y + 4,
        head: [["Désignation", "Prix U.", "Qté", "Total"]],
        body: rows,
        margin: { left: 20, right: 20 },
      });

      y = ((doc as any).lastAutoTable?.finalY || y + 20) + 10;
    });

    doc.save(`Ticket-${(order.id || "").slice(0, 8)}.pdf`);
  };

  return (
    <Button
      onClick={generatePDF}
      size="lg"
      className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Imprimer le ticket
    </Button>
  );
}
