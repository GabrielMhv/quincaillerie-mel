"use client";

import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

interface ExportButtonsProps {
  data: any[];
  filename?: string;
}

export function ExportButtons({ data, filename = "Rapport_Transactions" }: ExportButtonsProps) {
  const exportToCSV = () => {
    if (!data.length) return;
    
    // Header
    const headers = ["Date", "Boutique", "Caissier", "Statut", "Total (FCFA)"];
    
    // Rows
    const rows = data.map(o => [
      format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      o.boutique?.name || "Réseau",
      o.employee?.name || "N/A",
      "Validé",
      o.total
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!data.length) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text("Journal de Comptabilite", 14, 22);
    
    // Sub-header
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generé le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`, 14, 30);
    doc.text(`Nombre de transactions: ${data.length}`, 14, 36);

    const tableData = data.map(o => [
      format(new Date(o.created_at), "dd/MM/yyyy HH:mm"),
      o.boutique?.name || "Réseau",
      o.employee?.name || "N/A",
      formatCurrency(Number(o.total))
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Date", "Boutique", "Caissier", "Montant Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    doc.save(`${filename}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="flex gap-4">
      <button 
        onClick={exportToPDF}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-border/50 text-xs font-black tracking-widest hover:bg-primary hover:text-white transition-all"
      >
        <Download className="h-4 w-4" /> PDF
      </button>
      <button 
        onClick={exportToCSV}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-border/50 text-xs font-black tracking-widest hover:bg-primary hover:text-white transition-all"
      >
        <Download className="h-4 w-4" /> CSV
      </button>
    </div>
  );
}
