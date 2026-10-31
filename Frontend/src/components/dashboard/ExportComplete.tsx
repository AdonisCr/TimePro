import { useState } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import {
  downloadFile,
  sectionsToCsv,
  sectionsToMarkdown,
  toJsonContent,
  type ExportColumn,
  type ExportData,
  type ExportFormat,
  type ExportSection,
} from '../../lib/export';

interface ExportCompleteProps {
  data: ExportData;
}

const taskColumns: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Titre' },
  { key: 'status', label: 'Statut' },
  { key: 'priority', label: 'Priorité' },
  { key: 'due_date', label: 'Échéance' },
  { key: 'start_date', label: 'Début' },
  { key: 'estimated_duration', label: 'Durée estimée (min)' },
  { key: 'project_name', label: 'Projet' },
  { key: 'is_completed', label: 'Terminée' },
];

const timeEntryColumns: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'task_title', label: 'Tâche' },
  { key: 'project_name', label: 'Projet' },
  { key: 'description', label: 'Description' },
  { key: 'start_time', label: 'Début' },
  { key: 'end_time', label: 'Fin' },
  { key: 'duration', label: 'Durée (s)' },
];

const projectColumns: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'description', label: 'Description' },
  { key: 'color', label: 'Couleur' },
  { key: 'status', label: 'Statut' },
  { key: 'deadline', label: 'Échéance' },
  { key: 'time_budget', label: 'Budget (s)' },
  { key: 'spent_seconds', label: 'Temps passé (s)' },
  { key: 'tasks_count', label: 'Tâches' },
];

const habitColumns: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'current_streak', label: 'Série (jours)' },
];

const goalColumns: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'current', label: 'Actuel' },
  { key: 'target', label: 'Objectif' },
];

const ExportComplete = ({ data }: ExportCompleteProps) => {
  const [exported, setExported] = useState<ExportFormat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [includeOptions, setIncludeOptions] = useState({
    tasks: true,
    timeEntries: true,
    projects: true,
    habits: true,
    goals: true,
    settings: true,
  });

  const buildSections = (): ExportSection[] => {
    const sections: ExportSection[] = [];

    if (includeOptions.tasks) {
      sections.push({ title: 'Tâches', columns: taskColumns, rows: data.tasks });
    }
    if (includeOptions.timeEntries) {
      sections.push({ title: 'Entrées de temps', columns: timeEntryColumns, rows: data.timeEntries });
    }
    if (includeOptions.projects) {
      sections.push({ title: 'Projets', columns: projectColumns, rows: data.projects });
    }
    if (includeOptions.habits) {
      sections.push({ title: 'Habitudes', columns: habitColumns, rows: data.habits });
    }
    if (includeOptions.goals) {
      sections.push({ title: 'Objectifs mensuels', columns: goalColumns, rows: data.goals });
    }
    if (includeOptions.settings) {
      sections.push({
        title: 'Paramètres',
        columns: [
          { key: 'key', label: 'Clé' },
          { key: 'value', label: 'Valeur' },
        ],
        rows: Object.entries(data.settings).map(([key, value]) => ({ key, value })),
      });
    }

    return sections;
  };

  const buildExportData = (): ExportData => ({
    tasks: includeOptions.tasks ? data.tasks : [],
    timeEntries: includeOptions.timeEntries ? data.timeEntries : [],
    projects: includeOptions.projects ? data.projects : [],
    habits: includeOptions.habits ? data.habits : [],
    goals: includeOptions.goals ? data.goals : [],
    settings: includeOptions.settings ? data.settings : {},
  });

  const handleExport = (format: ExportFormat) => {
    setError(null);

    try {
      const sections = buildSections();

      switch (format) {
        case 'json':
          downloadFile(
            toJsonContent(buildExportData()),
            'timepro-export.json',
            'application/json;charset=utf-8'
          );
          break;
        case 'csv':
          downloadFile(
            '\uFEFF' + sectionsToCsv(sections),
            'timepro-export.csv',
            'text/csv;charset=utf-8'
          );
          break;
        case 'markdown':
          downloadFile(
            sectionsToMarkdown(sections, 'Export Time Pro'),
            'timepro-export.md',
            'text/markdown;charset=utf-8'
          );
          break;
      }

      setExported(prev => (prev.includes(format) ? prev : [...prev, format]));
    } catch {
      setError("L'export a échoué. Réessaie dans un instant.");
    }
  };

  const exportFormats = [
    {
      format: 'json' as ExportFormat,
      icon: FileJson,
      title: 'JSON',
      description: 'Format complet avec toutes les données',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      format: 'csv' as ExportFormat,
      icon: FileSpreadsheet,
      title: 'CSV',
      description: 'Compatible Excel et tableurs',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      format: 'markdown' as ExportFormat,
      icon: FileText,
      title: 'Markdown',
      description: 'Pour documentation et partage',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const dataTypes = [
    { key: 'tasks' as const, label: 'Tâches', count: data.tasks.length },
    { key: 'timeEntries' as const, label: 'Entrées de temps', count: data.timeEntries.length },
    { key: 'projects' as const, label: 'Projets', count: data.projects.length },
    { key: 'habits' as const, label: 'Habitudes', count: data.habits.length },
    { key: 'goals' as const, label: 'Objectifs', count: data.goals.length },
    { key: 'settings' as const, label: 'Paramètres', count: Object.keys(data.settings).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-dark">Exporter mes données</h2>
        <p className="text-text-soft text-sm">Télécharge une copie complète de tes données Time Pro</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4 border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* What to export */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Données à exporter</h3>
        <div className="space-y-2">
          {dataTypes.map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeOptions[item.key]}
                  onChange={(e) => setIncludeOptions(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-text-dark">{item.label}</span>
              </div>
              <span className="text-sm text-text-soft">{item.count} élément{item.count > 1 ? 's' : ''}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Export formats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportFormats.map(({ format, icon: Icon, title, description, color, bgColor }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={Object.values(includeOptions).every(v => !v)}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all text-left hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              exported.includes(format) ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <h4 className="font-semibold text-text-dark mb-1">{title}</h4>
            <p className="text-sm text-text-soft mb-4">{description}</p>
            <div className="flex items-center gap-2">
              {exported.includes(format) ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  Exporté
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-primary">
                  <Download className="w-4 h-4" />
                  Télécharger
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Export info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Export sécurisé</h4>
            <p className="text-sm text-blue-600">
              Tes données sont exportées localement. Aucune donnée n'est envoyée à nos serveurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportComplete;
