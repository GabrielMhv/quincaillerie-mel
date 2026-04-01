"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderPDFLinkProps {
  order: {
    id: string;
    created_at: string;
    total: number;
    client_name?: string;
    client_phone?: string;
    boutique?: { name: string };
    order_items: Array<{
      products?: { name: string };
      unit_price: number;
      quantity: number;
    }>;
  };
}

export function OrderPDFLink({ order }: OrderPDFLinkProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const date = order.created_at
      ? format(new Date(order.created_at), "dd MMMM yyyy 'à' HH:mm", {
          locale: fr,
        })
      : format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    const orderRef = `#${(order.id || "").slice(0, 8).toUpperCase()}`;

    // Header - Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // primary-600
    doc.text("Ets La Championne", 20, 25);

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // muted-foreground
    doc.text("Ségbé & Sanguera - Votre partenaire de confiance", 20, 31);

    // Order Info Block
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(`Réception de commande: ${orderRef}`, 20, 45);
    doc.text(`Date: ${date}`, 20, 50);
    doc.text(`Boutique: ${order.boutique?.name || "Réseau central"}`, 20, 55);

    // Client Info
    doc.setFont("helvetica", "bold");
    doc.text("Destinataire :", 120, 45);
    doc.setFont("helvetica", "normal");
    doc.text(order.client_name || "Client particulier", 120, 50);
    doc.text(order.client_phone || "N/A", 120, 55);

    // Table
    const tableRows = order.order_items.map((item) => [
      item.products?.name || "Produit inconnu",
      formatCurrency(item.unit_price),
      item.quantity,
      formatCurrency(item.unit_price * item.quantity),
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["Désignation", "Prix unitaire", "Quantité", "Total"]],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: 31,
        fontStyle: "bold",
      },
      margin: { left: 20, right: 20 },
    });

    // Total Section
    const finalY = ((doc as unknown) as { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Montant total HT :`, 120, finalY);
    doc.text(`${formatCurrency(order.total / 1.18)}`, 170, finalY, {
      align: "right",
    });

    doc.text(`TVA (18%) :`, 120, finalY + 7);
    doc.text(
      `${formatCurrency(order.total - order.total / 1.18)}`,
      170,
      finalY + 7,
      { align: "right" },
    );

    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text(`Total TTC :`, 120, finalY + 16);
    doc.text(`${formatCurrency(order.total)}`, 170, finalY + 16, {
      align: "right",
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Ce document est un reçu numérique officiel généré par le système Ets La Championne.",
      20,
      pageHeight - 20,
    );
    doc.text(
      "Expertise & qualité à Ségbé et Sanguera. © 2026.",
      20,
      pageHeight - 15,
    );

    // Save
    doc.save(`Facture-${order.id.slice(0, 8)}.pdf`);
  };

  return (
    <Button
      onClick={generatePDF}
      className="w-full rounded-2xl h-14 font-bold tracking-tight text-[11px] bg-primary shadow-xl shadow-primary/20 group animate-in slide-in-from-right-4"
    >
      <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
      Télécharger le reçu PDF
    </Button>
  );
}
