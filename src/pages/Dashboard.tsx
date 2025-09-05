import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import StatsCards from '../components/dashboard/StatsCards';
import Calendar from '../components/dashboard/Calendar';
import Analytics from '../components/dashboard/Analytics';
import Tracking from '../components/dashboard/Tracking';
import Projects from '../components/dashboard/Projects';
import WorkHistory from '../components/dashboard/WorkHistory';
import Tools from '../components/dashboard/Tools';
import Inbox from '../components/dashboard/Inbox';
import Settings from '../components/dashboard/Settings';
import AddTaskModal from '../components/dashboard/AddTaskModal';
import TaskList from '../components/dashboard/TaskList';


function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([
    {
      id: 1,
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      project: 'dashboard-design',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '10:00',
      assignee: 'sarah-johnson',
      tags: 'meeting, team',
      status: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Client Review',
      description: 'Review client feedback on dashboard design',
      project: 'dashboard-design',
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '13:00',
      assignee: 'mike-chen',
      tags: 'client, review',
      status: 'in-progress',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Design Sprint',
      description: 'Sprint planning for next iteration',
      project: 'app-ui-ux',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '15:30',
      assignee: 'emma-wilson',
      tags: 'design, sprint',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]);

  const handleAddTask = (taskData: any) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: taskData.status || 'pending',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    console.log('New task created:', newTask);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tracking':
        return <Tracking tasks={tasks} />;
      case 'projects':
        return <Projects tasks={tasks} />;
      case 'work-history':
        return <WorkHistory tasks={tasks} />;
      case 'tools':
        return <Tools />;
      case 'inbox':
        return <Inbox />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <>
            <WelcomeSection />
            <StatsCards tasks={tasks} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Analytics tasks={tasks} />
              </div>
              <div>
                <Calendar tasks={tasks} />
              </div>
            </div>
            <TaskList tasks={tasks} title="Recent Tasks" />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onAddTask={() => setIsAddTaskModalOpen(true)}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
      
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}

export default App;