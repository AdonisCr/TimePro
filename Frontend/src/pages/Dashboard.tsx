import { useState, useEffect } from 'react';
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
import AddTaskModal from '../components/dashboard/AddTaskModal';
import AddProjectModal from '../components/dashboard/AddProjectModal';
import TaskList from '../components/dashboard/TaskList';
import KanbanBoard from '../components/dashboard/KanbanBoard';
import GanttChart from '../components/dashboard/GanttChart';
import ExportButton from '../components/dashboard/ExportButton';
import TaskDetailModal from '../components/dashboard/TaskDetailModal';
import Workload from '../components/dashboard/Workload';
import Automations from '../components/dashboard/Automations';
import TeamSettings from '../components/dashboard/TeamSettings';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useUser } from '../hooks/useUser';
import { useTimeEntries } from '../hooks/useTimeEntries';

interface TaskItem {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  dueTime?: string;
  assignee?: string;
  project?: string;
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
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
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, fetchTasks } = useTasks();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const { entries: timeEntries } = useTimeEntries();

  const handleAddTask = async (taskData: any) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        project_id: taskData.project_id || null,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        due_date: taskData.due_date || null,
        recurrence: taskData.recurrence || 'none',
        recurrence_end_date: taskData.recurrence_end_date || null,
        parent_id: taskData.parent_id || null,
        depends_on: taskData.depends_on || null,
        subtasks: taskData.subtasks,
      });
    } catch {
      console.error('Erreur création tâche');
    }
  };

  const handleViewTask = (task: TaskItem) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleUpdateTask = async (id: number, data: any) => {
    try {
      await updateTask(id, data);
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

  const handleAddProject = async (projectData: any) => {
    try {
      await createProject({
        name: projectData.name,
        description: projectData.description || null,
        color: projectData.color || '#00B4DB',
        deadline: projectData.deadline || null,
        time_budget: projectData.time_budget || null,
        status: 'active',
      });
    } catch {
      console.error('Erreur création projet');
    }
  };

  const apiTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    project: task.project?.name || 'No Project',
    projectColor: task.project?.color,
    priority: task.priority,
    start_date: task.start_date,
    dueDate: task.due_date,
    estimated_duration: task.estimated_duration,
    status: task.status === 'todo' ? 'pending' : task.status === 'in_progress' ? 'in-progress' : 'completed',
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
      default:
        return (
          <>
            <WelcomeSection userName={user?.name || 'User'} />
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <StatsCards tasks={apiTasks} projects={projects} timeEntries={timeEntries} />
              <div className="flex items-center gap-2">
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
              setCurrentPage(page);
              setSidebarOpen(false);
            }}
            onAddTask={() => setIsAddTaskModalOpen(true)}
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
          <Header onLogout={logout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-8xl mx-auto space-y-8">
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