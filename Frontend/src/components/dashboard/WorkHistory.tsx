import React, { useState } from 'react';
import { Clock, Download, Search, Loader2 } from 'lucide-react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';

const WorkHistory: React.FC = () => {
  const { entries, loading } = useTimeEntries();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [exporting] = useState(false);

  const getProjectName = (id: number | null) => {
    if (!id) return 'Sans projet';
    const project = projects.find(p => p.id === id);
    return project?.name || 'Sans projet';
  };

  const getProjectColor = (id: number | null) => {
    if (!id) return '#00B4DB';
    const project = projects.find(p => p.id === id);
    return project?.color || '#00B4DB';
  };

  const getTaskTitle = (id: number | null) => {
    if (!id) return null;
    const task = tasks.find(t => t.id === id);
    return task?.title || null;
  };

  const filteredEntries = entries.filter(entry => {
    if (selectedProject && entry.project_id?.toString() !== selectedProject) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const projectName = getProjectName(entry.project_id)?.toLowerCase() || '';
      const taskTitle = getTaskTitle(entry.task_id)?.toLowerCase() || '';
      const description = entry.description?.toLowerCase() || '';
      return projectName.includes(query) || taskTitle.includes(query) || description.includes(query);
    }
    return true;
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const exportToCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = ['Date', 'Projet', 'Tâche', 'Description', 'Début', 'Fin', 'Durée'];
    const rows = filteredEntries.map(entry => {
      const startDate = new Date(entry.start_time);
      const endDate = entry.end_time ? new Date(entry.end_time) : null;
      return [
        startDate.toLocaleDateString('fr-FR'),
        getProjectName(entry.project_id),
        getTaskTitle(entry.task_id) || '',
        entry.description || '',
        startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        endDate ? endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        formatDuration(entry.duration),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timepro_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const htmlEscape = (str: string | null | undefined): string => {
    if (!str) return '-';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const entriesHtml = filteredEntries.map(entry => {
      const startDate = new Date(entry.start_time);
      return `
        <tr>
          <td>${htmlEscape(startDate.toLocaleDateString('fr-FR'))}</td>
          <td>${htmlEscape(getProjectName(entry.project_id))}</td>
          <td>${htmlEscape(getTaskTitle(entry.task_id))}</td>
          <td>${htmlEscape(entry.description)}</td>
          <td>${htmlEscape(startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}</td>
          <td>${htmlEscape(formatDuration(entry.duration))}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TimePro - Export des temps</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #16213e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #00B4DB; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>TimePro - Historique des temps</h1>
        <p>Export du ${new Date().toLocaleDateString('fr-FR')}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Projet</th>
              <th>Tâche</th>
              <th>Description</th>
              <th>Début</th>
              <th>Durée</th>
            </tr>
          </thead>
          <tbody>
            ${entriesHtml}
          </tbody>
        </table>
        <div class="summary">
          <strong>Total des entrées:</strong> ${filteredEntries.length}<br>
          <strong>Temps total:</strong> ${formatDuration(filteredEntries.reduce((sum, e) => sum + (e.duration || 0), 0))}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = new Date(entry.start_time).toLocaleDateString('fr-FR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof filteredEntries>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Historique</h1>
          <p className="text-text-soft mt-1">Analysez vos sessions de travail</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportToCSV}
            disabled={exporting || filteredEntries.length === 0}
            className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-text-dark px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>CSV</span>
          </button>
          <button 
            onClick={exportToPDF}
            disabled={exporting || filteredEntries.length === 0}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">Vue d'ensemble</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                  selectedPeriod === period
                    ? 'bg-primary text-white'
                    : 'text-text-soft hover:text-text-dark'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-dark">
                {formatDuration(entries.reduce((sum, e) => sum + (e.duration || 0), 0))}
              </div>
              <div className="text-text-soft">Temps total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-dark">{entries.length}</div>
              <div className="text-text-soft">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-dark">
                {entries.length > 0 ? formatDuration(entries.reduce((sum, e) => sum + (e.duration || 0), 0) / entries.length) : '0h 0m'}
              </div>
              <div className="text-text-soft">Durée moyenne</div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-soft w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les projets</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Work Sessions List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <p className="text-text-soft text-center py-8">Aucune session trouvée</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date}>
                <h4 className="text-sm font-semibold text-text-soft mb-3">{date}</h4>
                <div className="space-y-2">
                  {(dateEntries as typeof filteredEntries).map((entry) => {
                    const startDate = new Date(entry.start_time);
                    const endDate = entry.end_time ? new Date(entry.end_time) : null;
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-bg-light rounded-xl transition-colors">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getProjectColor(entry.project_id) }}
                          />
                          <div>
                            <h4 className="font-medium text-text-dark">
                              {getTaskTitle(entry.task_id) || getProjectName(entry.project_id)}
                            </h4>
                            <p className="text-sm text-text-soft">
                              {entry.description || getProjectName(entry.project_id)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2 text-text-soft">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {endDate && ` - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="font-semibold text-text-dark">
                              {formatDuration(entry.duration)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkHistory;