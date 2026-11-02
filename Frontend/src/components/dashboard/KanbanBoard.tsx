import { useState, useEffect, type ComponentProps } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Plus, MoreHorizontal, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  estimated_duration?: number | null;
  project?: { id: number; name: string; color: string };
  created_at: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: number, data: Partial<Task>) => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const PRIORITY_ICONS = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

const STATUS_COLUMNS = [
  { id: 'todo', title: 'À faire', color: 'bg-gray-100', icon: '📋' },
  { id: 'in_progress', title: 'En cours', color: 'bg-blue-100', icon: '🔄' },
  { id: 'done', title: 'Terminé', color: 'bg-green-100', icon: '✅' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<{ [key: string]: Task[] }>({
    todo: [],
    in_progress: [],
    done: [],
  });

  useEffect(() => {
    const grouped = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done'),
    };
    setColumns(grouped);
  }, [tasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as Task['status'];

    setColumns(prev => {
      const sourceTasks = [...prev[source.droppableId as keyof typeof prev]];
      const destTasks = source.droppableId === destination.droppableId 
        ? sourceTasks 
        : [...prev[destination.droppableId as keyof typeof prev]];
      
      const [movedTask] = sourceTasks.splice(source.index, 1);
      if (source.droppableId === destination.droppableId) {
        sourceTasks.splice(destination.index, 0, movedTask);
        return { ...prev, [source.droppableId]: sourceTasks };
      }

      const updatedTask = { ...movedTask, status: newStatus };
      destTasks.splice(destination.index, 0, updatedTask);
      
      return {
        ...prev,
        [source.droppableId]: sourceTasks,
        [destination.droppableId]: destTasks,
      };
    });

    try {
      await api.post('/tasks/reorder', {
        tasks: [{ id: parseInt(draggableId), status: newStatus }],
      });
    } catch (err) {
      console.error('Erreur lors de la réorganisation:', err);
    }
  };

  const handleFocusMode = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/focus', { state: { task } });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((column, columnIndex) => (
          <motion.div 
            key={column.id} 
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: columnIndex * 0.1 }}
          >
            <div className={`rounded-t-xl px-4 py-3 ${column.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{column.icon}</span>
                  <h3 className="font-semibold text-text-dark">{column.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-soft bg-white/50 px-2 py-0.5 rounded-full">
                    {columns[column.id]?.length || 0}
                  </span>
                  <button className="p-1 hover:bg-white/50 rounded transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-text-soft" />
                  </button>
                </div>
              </div>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[300px] bg-gray-50 rounded-b-xl p-2 space-y-2 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-primary/10 ring-2 ring-primary/30' : ''
                  }`}
                >
                  <AnimatePresence>
                    {columns[column.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...(provided.draggableProps as unknown as ComponentProps<typeof motion.div>)}
                            {...(provided.dragHandleProps as unknown as ComponentProps<typeof motion.div>)}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group ${
                              snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : ''
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">{PRIORITY_ICONS[task.priority]}</span>
                                  <h4 className="font-medium text-text-dark truncate">{task.title}</h4>
                                </div>
                                
                                {task.description && (
                                  <p className="text-xs text-text-soft line-clamp-2 mb-2">{task.description}</p>
                                )}
                                
                                {task.project && (
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full" 
                                      style={{ backgroundColor: task.project.color }}
                                    />
                                    <span className="text-xs text-text-soft">{task.project.name}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                                      {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                    </span>
                                    {task.estimated_duration && (
                                      <span className="text-xs text-text-soft">
                                        {task.estimated_duration}min
                                      </span>
                                    )}
                                  </div>
                                  {task.due_date && (
                                    <span className="text-xs text-text-soft">
                                      {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Quick actions on hover */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleFocusMode(task, e)}
                                className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                title="Mode Focus"
                              >
                                <Target className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                  
                  {/* Add task button */}
                  <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-text-soft hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              )}
            </Droppable>
          </motion.div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;