import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../lib/axios';
import { PageTransition } from '../components/ui/Animations';
import ExportComplete from '../components/dashboard/ExportComplete';
import type { ExportData, ExportProject, ExportTask, ExportTimeEntry } from '../lib/export';
import type { Task } from '../hooks/useTasks';
import type { Project } from '../hooks/useProjects';
import type { TimeEntry } from '../hooks/useTimeEntries';

const MAX_TIME_ENTRY_PAGES = 20;

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

function toExportTask(task: Task): ExportTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    start_date: task.start_date,
    estimated_duration: task.estimated_duration,
    is_completed: task.is_completed,
    project_name: task.project?.name ?? null,
    created_at: task.created_at,
  };
}

function toExportProject(project: Project): ExportProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    status: project.status,
    deadline: project.deadline,
    time_budget: project.time_budget,
    spent_seconds: project.spent_seconds,
    tasks_count: project.tasks_count ?? null,
  };
}

function toExportTimeEntry(entry: TimeEntry): ExportTimeEntry {
  return {
    id: entry.id,
    task_title: entry.task?.title ?? entry.description ?? 'Sans tâche',
    project_name: entry.project?.name ?? null,
    description: entry.description,
    start_time: entry.start_time,
    end_time: entry.end_time,
    duration: entry.duration,
    is_manual: entry.is_manual,
  };
}

async function fetchAllTimeEntries(): Promise<TimeEntry[]> {
  const entries: TimeEntry[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await api.get<{ data: TimeEntry[]; meta: { last_page: number } }>(
      `/time-entries?page=${page}&per_page=100`
    );
    entries.push(...response.data.data);
    lastPage = response.data.meta?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage && page <= MAX_TIME_ENTRY_PAGES);

  return entries;
}

async function fetchSettings(): Promise<Record<string, unknown>> {
  try {
    const response = await api.get<unknown>('/preferences');
    const payload = response.data;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }
  } catch {
    // Paramètres optionnels : l'export reste possible sans eux
  }
  return {};
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? 'Impossible de charger les données. Vérifie ta connexion puis réessaie.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Erreur inconnue lors du chargement des données.';
}

const ExportPage = () => {
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tasksResponse, projectsResponse, timeEntries] = await Promise.all([
        api.get<unknown>('/tasks'),
        api.get<unknown>('/projects?per_page=100'),
        fetchAllTimeEntries(),
      ]);
      const settings = await fetchSettings();

      setData({
        tasks: toList<Task>(tasksResponse.data).map(toExportTask),
        projects: toList<Project>(projectsResponse.data).map(toExportProject),
        timeEntries: timeEntries.map(toExportTimeEntry),
        habits: [],
        goals: [],
        settings,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-text-soft">Chargement des données...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : data ? (
            <ExportComplete data={data} />
          ) : null}
        </div>
      </div>
    </PageTransition>
  );
};

export default ExportPage;
