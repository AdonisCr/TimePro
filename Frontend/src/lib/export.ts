export type ExportFormat = 'json' | 'csv' | 'markdown';

export type ExportTask = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  start_date: string | null;
  estimated_duration: number | null;
  is_completed: boolean;
  project_name: string | null;
  created_at: string;
};

export type ExportTimeEntry = {
  id: number;
  task_title: string;
  project_name: string | null;
  description: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  is_manual: boolean;
};

export type ExportProject = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  status: string;
  deadline: string | null;
  time_budget: number | null;
  spent_seconds: number;
  tasks_count: number | null;
};

export type ExportHabit = {
  id: number;
  name: string;
  current_streak: number;
};

export type ExportGoal = {
  id: number;
  name: string;
  current: number;
  target: number;
};

export type ExportData = {
  tasks: ExportTask[];
  timeEntries: ExportTimeEntry[];
  projects: ExportProject[];
  habits: ExportHabit[];
  goals: ExportGoal[];
  settings: Record<string, unknown>;
};

export type ExportColumn = { key: string; label: string };

export type ExportSection = {
  title: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
};

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleString('fr-FR');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function escapeCsvCell(value: unknown): string {
  return `"${formatCellValue(value).replace(/"/g, '""')}"`;
}

export function sectionsToCsv(sections: ExportSection[]): string {
  const blocks = sections.map(section => {
    const lines = [
      section.title.toUpperCase(),
      section.columns.map(column => escapeCsvCell(column.label)).join(','),
      ...section.rows.map(row =>
        section.columns.map(column => escapeCsvCell(row[column.key])).join(',')
      ),
    ];
    return lines.join('\n');
  });

  return blocks.join('\n\n');
}

function escapeMarkdownCell(value: unknown): string {
  return formatCellValue(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

export function sectionsToMarkdown(sections: ExportSection[], heading: string): string {
  const lines: string[] = [
    `# ${heading}`,
    '',
    `Généré le ${new Date().toLocaleString('fr-FR')}`,
    '',
  ];

  for (const section of sections) {
    lines.push(`## ${section.title}`, '');
    lines.push(`| ${section.columns.map(column => column.label).join(' | ')} |`);
    lines.push(`| ${section.columns.map(() => '---').join(' | ')} |`);
    for (const row of section.rows) {
      lines.push(`| ${section.columns.map(column => escapeMarkdownCell(row[column.key])).join(' | ')} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function toJsonContent(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: ExportColumn[]
) {
  if (data.length === 0) return;

  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
  const header = cols.map(c => escapeCsvCell(c.label)).join(',');
  const rows = data.map(row => cols.map(c => escapeCsvCell(row[c.key])).join(','));

  const csv = [header, ...rows].join('\n');
  downloadFile('\uFEFF' + csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function printPage(title: string) {
  const originalTitle = document.title;
  document.title = `Time Pro - ${title}`;
  window.print();
  document.title = originalTitle;
}
