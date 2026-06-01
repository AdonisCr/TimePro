import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { exportToCSV, printPage } from '../../lib/export';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  title: string;
  columns?: { key: string; label: string }[];
  onPrint?: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, title, columns, onPrint }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-soft hover:text-text-dark bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-all"
      >
        <Download className="w-4 h-4" />
        Exporter
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-30">
          <button
            onClick={() => { exportToCSV(data, filename, columns); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-dark hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <div className="text-left">
              <p className="font-medium">CSV</p>
              <p className="text-xs text-text-gray">Tableur compatible Excel</p>
            </div>
          </button>
          <button
            onClick={() => { printPage(title); onPrint?.(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-dark hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="font-medium">PDF / Impression</p>
              <p className="text-xs text-text-gray">Enregistrer en PDF via le navigateur</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
