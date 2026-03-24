"use client";

import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExportButtonsProps {
  data: any[];
  filename?: string;
}

export function ExportButtons({ data, filename = "Rapport_Transactions" }: ExportButtonsProps) {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCsvLoading, setIsCsvLoading] = useState(false);

  const exportToCSV = async () => {
    setIsCsvLoading(true);
    try {
      if (!data.length) {
        toast.error("Aucune donnée à exporter");
        return;
      }
      
      const headers = ["Date", "Boutique", "Caissier", "Statut", "Total (FCFA)"];
      const rows = data.map(o => [
        `"${format(new Date(o.created_at), "yyyy-MM-dd HH:mm")}"`, 
        `"${o.boutique?.name || "Reseau"}"`,
        `"${o.employee?.name || "NA"}"`,
        `"Valide"`,
        o.total
      ]);
      
      const BOM = "\uFEFF";
      const csvContent = BOM + [
        headers.join(";"),
        ...rows.map(row => row.join(";"))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Export CSV réussi");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'export CSV");
    } finally {
      setIsCsvLoading(false);
    }
  };

  const exportToPDF = async () => {
    setIsPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.text("Journal de Comptabilite", 14, 22);
      
      const tableData = data.map(o => [
        format(new Date(o.created_at), "dd/MM/yyyy HH:mm"),
        o.boutique?.name || "Reseau",
        o.employee?.name || "NA",
        formatCurrency(Number(o.total))
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["Date", "Boutique", "Caissier", "Montant Total"]],
        body: tableData,
      });

      doc.save(`${filename}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("Export PDF réussi");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="flex gap-4 relative z-50">
      <button 
        type="button"
        disabled={isPdfLoading}
        onClick={exportToPDF}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black tracking-widest hover:bg-primary/80 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        PDF
      </button>
      <button 
        type="button"
        disabled={isCsvLoading}
        onClick={exportToCSV}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-primary/20 text-xs font-black tracking-widest hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCsvLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        CSV
      </button>
    </div>
  );
}
