import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import api from '../../lib/axios';

interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
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

const STATUS_COLUMNS = [
  { id: 'todo', title: 'À faire', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'En cours', color: 'bg-blue-100' },
  { id: 'done', title: 'Terminé', color: 'bg-green-100' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate }) => {
  const [columns, setColumns] = useState<{ [key: string]: Task[] }>({
    todo: [],
    in_progress: [],
    done: [],
  });
  const [loading, setLoading] = useState(false);

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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            <div className={`rounded-t-xl px-4 py-3 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-dark">{column.title}</h3>
                <span className="text-sm text-text-soft">
                  {column.id === 'todo' 
                    ? tasks.filter(t => t.status === 'todo').length
                    : column.id === 'in_progress'
                    ? tasks.filter(t => t.status === 'in_progress').length
                    : tasks.filter(t => t.status === 'done').length
                  }
                </span>
              </div>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[200px] bg-gray-50 rounded-b-xl p-2 space-y-2 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-primary/10' : ''
                  }`}
                >
                  {columns[column.id]?.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onTaskClick && onTaskClick(task)}
                          className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer ${
                            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-dark truncate">{task.title}</h4>
                              {task.project && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: task.project.color }}
                                  />
                                  <span className="text-xs text-text-soft">{task.project.name}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                                  {task.priority}
                                </span>
                                {task.due_date && (
                                  <span className="text-xs text-text-soft">
                                    {new Date(task.due_date).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;