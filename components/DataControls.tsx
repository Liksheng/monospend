
import React, { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Expense, BudgetState } from '../types';

interface DataControlsProps {
  expenses: Expense[];
  budgets: BudgetState;
  onImport: (expenses: Expense[], budgets: BudgetState) => void;
}

const DataControls: React.FC<DataControlsProps> = ({ expenses, budgets, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      expenses,
      budgets,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monospend-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
      const headers = ['ID', 'Date', 'Category', 'Description', 'Amount'];
      const csvContent = [
          headers.join(','),
          ...expenses.map(e => [
              e.id,
              e.date,
              e.category,
              `"${e.description.replace(/"/g, '""')}"`,
              e.amount.toFixed(2)
          ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `monospend-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.expenses && json.budgets) {
           if (window.confirm("OVERWRITE SYSTEM DATA?")) {
              onImport(json.expenses, json.budgets);
              alert("SYSTEM RESTORED.");
           }
        } else {
            alert("ERR: INVALID FORMAT");
        }
      } catch (error) {
        alert("ERR: READ FAIL");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset
  };

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={handleExportCSV}
        className="p-1 text-y2k-green border border-y2k-green hover:bg-y2k-green hover:text-black transition-all"
        title="EXPORT CSV"
      >
        <FileText className="w-3 h-3" />
      </button>

      <button 
        onClick={handleExport}
        className="p-1 text-y2k-green border border-y2k-green hover:bg-y2k-green hover:text-black transition-all"
        title="BACKUP JSON"
      >
        <Download className="w-3 h-3" />
      </button>
      
      <button 
        onClick={handleImportClick}
        className="p-1 text-y2k-green border border-y2k-green hover:bg-y2k-green hover:text-black transition-all"
        title="RESTORE JSON"
      >
        <Upload className="w-3 h-3" />
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />
    </div>
  );
};

export default DataControls;
