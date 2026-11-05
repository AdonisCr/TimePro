import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import StatsCards from '../components/dashboard/StatsCards';
import Calendar from '../components/dashboard/Calendar';
import Analytics from '../components/dashboard/Analytics';
import TrackingPage from '../components/dashboard/TrackingPage';
import Projects from '../components/dashboard/Projects';
import Tools from '../components/dashboard/Tools';
import Inbox from '../components/dashboard/Inbox';
import Settings from '../components/dashboard/Settings';
import AddTaskModal, { type NewTaskPayload } from '../components/dashboard/AddTaskModal';
import AddProjectModal from '../components/dashboard/AddProjectModal';
import TaskList from '../components/dashboard/TaskList';
import KanbanBoard from '../components/dashboard/KanbanBoard';
import GanttChart from '../components/dashboard/GanttChart';
import ExportButton from '../components/dashboard/ExportButton';
import TaskDetailModal, { type TaskUpdatePayload } from '../components/dashboard/TaskDetailModal';
import Workload from '../components/dashboard/Workload';
import Automations from '../components/dashboard/Automations';
import TeamSettings from '../components/dashboard/TeamSettings';
import CoachCard from '../components/dashboard/CoachCard';
import HabitsPage from './HabitsPage';
import PlanningPage from './PlanningPage';
import WeeklyReport from './WeeklyReport';
import MonthlyGoals from './MonthlyGoals';
import { useTasks, type Task as ApiTask } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useUser } from '../hooks/useUser';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useNotifications } from '../hooks/useNotifications';
import { generateInsights } from '../lib/productivity';
import { getTodayReport, type FocusMethod } from '../lib/focus';

const normalizePriority = (value: string): ApiTask['priority'] =>
  value === 'low' || value === 'high' ? value : 'medium';

const normalizeStatus = (value?: string): ApiTask['status'] =>
  value === 'in_progress' || value === 'done' ? value : 'todo';

const normalizeRecurrence = (value: string): ApiTask['recurrence'] =>
  value === 'daily' || value === 'weekly' || value === 'monthly' || value === 'yearly'
    ? value
    : 'none';

const PAGE_ROUTES: Record<string, string> = {
  calendar: '/calendar',
  export: '/export',
  'share-planning': '/share-planning',
};

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { user, logout, refreshUser } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, remove: removeNotification } = useNotifications();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, fetchTasks } = useTasks();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const { entries: timeEntries } = useTimeEntries();

  const [focusByMethod, setFocusByMethod] = useState<
    Partial<Record<FocusMethod, number>> | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    getTodayReport()
      .then((report) => {
        if (!cancelled) setFocusByMethod(report.by_method);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const insights = useMemo(
    () => generateInsights(tasks, focusByMethod),
    [tasks, focusByMethod]
  );

  const handleAddTask = async (taskData: NewTaskPayload) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        project_id: taskData.project_id || null,
        priority: normalizePriority(taskData.priority),
        status: normalizeStatus(taskData.status),
        due_date: taskData.due_date || null,
        recurrence: normalizeRecurrence(taskData.recurrence),
        recurrence_end_date: taskData.recurrence_end_date || null,
        parent_id: taskData.parent_id || null,
        depends_on: taskData.depends_on || null,
        subtasks: taskData.subtasks,
      });
    } catch {
      console.error('Erreur création tâche');
    }
  };

  const handleViewTask = (task: { id: number }) => {
    setSelectedTask(tasks.find(item => item.id === task.id) ?? null);
    setIsTaskDetailOpen(true);
  };

  const handleUpdateTask = async (id: number, data: TaskUpdatePayload) => {
    try {
      await updateTask(id, data as Partial<ApiTask>);
      await fetchTasks();
    } catch {
      console.error('Erreur mise à jour');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setIsTaskDetailOpen(false);
      await fetchTasks();
    } catch {
      console.error('Erreur suppression');
    }
  };

  const handleAddProject = async (projectData: Record<string, unknown>) => {
    try {
      await createProject({
        name: projectData.name as string,
        description: (projectData.description as string) || null,
        color: (projectData.color as string) || '#00B4DB',
        deadline: (projectData.deadline as string) || null,
        time_budget: projectData.time_budget ? Number(projectData.time_budget) : null,
        status: 'active',
      });
    } catch {
      console.error('Erreur création projet');
    }
  };

  const apiTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    project: task.project?.name || 'No Project',
    projectColor: task.project?.color,
    priority: task.priority,
    start_date: task.start_date || undefined,
    dueDate: task.due_date || undefined,
    estimated_duration: task.estimated_duration ?? undefined,
    status: task.status,
  }));

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tracking':
        return <TrackingPage tasks={apiTasks} />;
      case 'projects':
        return <Projects 
          tasks={apiTasks} 
          projects={projects} 
          onAddProject={() => setIsAddProjectModalOpen(true)}
        />;
      case 'gantt':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-text-dark">Diagramme de Gantt</h1>
              <ExportButton
                data={apiTasks.map(t => ({ 'Tâche': t.title, 'Projet': t.project || '', 'Début': t.start_date || '', 'Échéance': t.dueDate || '', 'Statut': t.status }))}
                filename="gantt"
                title="Diagramme de Gantt"
              />
            </div>
            <GanttChart tasks={apiTasks} onTaskClick={handleViewTask} />
          </div>
        );
      case 'workload':
        return <Workload />;
      case 'automations':
        return <Automations />;
      case 'team':
        return <TeamSettings />;
      case 'tools':
        return <Tools />;
      case 'inbox':
        return <Inbox />;
      case 'settings':
        return <Settings user={user} onLogout={logout} onProfileUpdate={refreshUser} />;
      case 'habits':
        return <HabitsPage />;
      case 'planning':
        return <PlanningPage tasks={tasks} />;
      case 'weekly-report':
        return <WeeklyReport tasks={tasks} timeEntries={timeEntries} />;
      case 'monthly-goals':
        return <MonthlyGoals />;
      default:
        return (
          <>
            <WelcomeSection userName={user?.name || 'User'} />
            
            {/* Coach insights */}
            <CoachCard insights={insights} />
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <StatsCards tasks={apiTasks} projects={projects} timeEntries={timeEntries} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/planning')}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  📅 Planning
                </button>
                <ExportButton
                  data={apiTasks.map(t => ({ 'Tâche': t.title, 'Projet': t.project || '', 'Statut': t.status, 'Priorité': t.priority, 'Échéance': t.dueDate || '' }))}
                  filename="taches"
                  title="Liste des tâches"
                />
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'text-text-soft hover:text-text-dark'
                  }`}
                >
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'kanban' ? 'bg-primary text-white' : 'text-text-soft hover:text-text-dark'
                  }`}
                >
                  Kanban
                </button>
                </div>
            </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {viewMode === 'kanban' ? (
                  <KanbanBoard tasks={tasks} onTaskClick={handleViewTask} />
                ) : (
                  <Analytics tasks={apiTasks} />
                )}
              </div>
              <div>
                <Calendar tasks={apiTasks} />
              </div>
            </div>
            {viewMode === 'list' && (
              <TaskList tasks={apiTasks} title="Tâches récentes" onTaskClick={handleViewTask} />
            )}
          </>
        );
    }
  };

  if (tasksLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-soft">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - fixed with full height */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="h-screen bg-white">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={(page) => {
              const route = PAGE_ROUTES[page];
              if (route) {
                navigate(route);
              } else {
                setCurrentPage(page);
              }
              setSidebarOpen(false);
            }}
            onAddTask={() => setIsAddTaskModalOpen(true)}
            onBrainDump={() => navigate('/brain-dump')}
            user={user}
            onLogout={logout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>
      
      {/* Main Content Area - with left margin for sidebar */}
      <div className="flex-1 flex flex-col min-h-0 ml-0 lg:ml-64">
        {/* Header - fixed at top */}
        <div className="sticky top-0 z-20">
          <Header
            onLogout={logout}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearNotification={removeNotification}
          />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="site-container mx-auto space-y-8">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
      
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={handleAddTask}
        projects={projects}
        tasks={tasks.map(t => ({ id: t.id, title: t.title }))}
      />

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSubmit={handleAddProject}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        projects={projects}
      />
    </div>
  );
}

export default Dashboard;