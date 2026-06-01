import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, differenceInDays, parseISO, isBefore, isAfter, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface TaskItem {
  id: number;
  title: string;
  status: string;
  priority: string;
  project?: string;
  projectColor?: string;
  start_date?: string | null;
  dueDate?: string | null;
  estimated_duration?: number | null;
}

interface GanttChartProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
}

type ZoomLevel = 'day' | 'week' | 'month';

const STATUS_COLORS: Record<string, string> = {
  'todo': 'bg-blue-500',
  'in-progress': 'bg-amber-500',
  'completed': 'bg-emerald-500',
  'pending': 'bg-gray-400',
};

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
  const [zoom, setZoom] = useState<ZoomLevel>('week');

  const today = useMemo(() => new Date(), []);

  const { timelineStart, days } = useMemo(() => {
    if (tasks.length === 0) {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = addDays(start, 27);
      return {
        timelineStart: start,
        days: eachDayOfInterval({ start, end }),
      };
    }

    let minDate = today;
    let maxDate = today;

    tasks.forEach(t => {
      if (t.start_date) {
        const d = parseISO(t.start_date);
        if (isBefore(d, minDate)) minDate = d;
      }
      if (t.dueDate) {
        const d = parseISO(t.dueDate);
        if (isAfter(d, maxDate)) maxDate = d;
      }
    });

    const start = startOfWeek(addDays(minDate, -7), { weekStartsOn: 1 });
    const end = addDays(startOfWeek(addDays(maxDate, 14), { weekStartsOn: 1 }), 6);
    const dayList = eachDayOfInterval({ start, end });

    return { timelineStart: start, days: dayList };
  }, [tasks, today]);

  const dayWidth = zoom === 'day' ? 60 : zoom === 'week' ? 40 : 24;
  const headerHeight = zoom === 'month' ? 60 : 40;
  const rowHeight = 48;

  const totalWidth = days.length * dayWidth;

  const getTaskStartOffset = (task: TaskItem): number => {
    const start = task.start_date ? parseISO(task.start_date) : null;
    const due = task.dueDate ? parseISO(task.dueDate) : null;
    const effectiveStart = start || due || today;
    const diff = differenceInDays(effectiveStart, timelineStart);
    return Math.max(0, diff) * dayWidth;
  };

  const getTaskWidth = (task: TaskItem): number => {
    const start = task.start_date ? parseISO(task.start_date) : null;
    const due = task.dueDate ? parseISO(task.dueDate) : null;

    if (start && due) {
      const diff = differenceInDays(due, start);
      return Math.max(dayWidth, (diff + 1) * dayWidth);
    }
    if (due) {
      return dayWidth * 3;
    }
    if (task.estimated_duration) {
      return Math.max(dayWidth, task.estimated_duration * dayWidth);
    }
    return dayWidth * 2;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0 && zoom !== 'day') {
        setZoom(prev => prev === 'month' ? 'week' : 'day');
      } else if (e.deltaY > 0 && zoom !== 'month') {
        setZoom(prev => prev === 'day' ? 'week' : 'month');
      }
    }
  };

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskItem[]> = {};
    tasks.forEach(t => {
      const key = t.project || 'Sans projet';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [tasks]);

  const zoomLabel = zoom === 'day' ? 'Jour' : zoom === 'week' ? 'Semaine' : 'Mois';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-text-dark">Diagramme de Gantt</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['month', 'week', 'day'] as ZoomLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setZoom(level)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  zoom === level
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-soft hover:text-text-dark'
                }`}
              >
                {level === 'day' ? 'Jour' : level === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setZoom(prev => prev === 'day' ? 'week' : prev === 'week' ? 'month' : 'month')}
              className="p-2 text-text-soft hover:text-text-dark hover:bg-gray-100 rounded-lg transition-all"
              title={`Zoom arrière (${zoomLabel})`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => prev === 'month' ? 'week' : prev === 'week' ? 'day' : 'day')}
              className="p-2 text-text-soft hover:text-text-dark hover:bg-gray-100 rounded-lg transition-all"
              title={`Zoom avant (${zoomLabel})`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-text-soft">Aucune tâche à afficher</p>
          <p className="text-sm text-text-gray mt-1">Ajoutez des tâches avec des dates pour voir le diagramme de Gantt</p>
        </div>
      ) : (
        <div className="overflow-x-auto" onWheel={handleWheel}>
          <div className="min-w-[600px]" style={{ width: Math.max(600, totalWidth + 280) }}>
            {/* Timeline Header */}
            <div className="flex border-b border-gray-100" style={{ marginLeft: 280 }}>
              <div className="flex" style={{ width: totalWidth }}>
                {zoom === 'month' ? (
                  (() => {
                    const months: { label: string; days: number; start: Date }[] = [];
                    let i = 0;
                    while (i < days.length) {
                      const monthStart = days[i];
                      const monthEnd = endOfMonth(monthStart);
                      let count = 0;
                      while (i < days.length && !isAfter(days[i], monthEnd)) {
                        count++;
                        i++;
                      }
                      months.push({ label: format(monthStart, 'MMMM yyyy', { locale: fr }), days: count, start: monthStart });
                    }
                    return (
                      <div className="flex w-full">
                        {months.map((m, mi) => (
                          <div
                            key={mi}
                            className="flex-shrink-0 py-2 text-xs font-semibold text-text-soft text-center border-r border-gray-50"
                            style={{ width: m.days * dayWidth }}
                          >
                            {m.label}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex w-full">
                    {days.map((day, i) => {
                      const isWeekStart = day.getDay() === 1;
                      return (
                        <div
                          key={i}
                          className={`flex-shrink-0 text-center border-r border-gray-50 flex flex-col justify-center ${
                            isToday(day) ? 'bg-primary/5' : ''
                          } ${isWeekStart ? 'border-l-2 border-l-gray-200' : ''}`}
                          style={{ width: dayWidth, height: headerHeight }}
                        >
                          <span className="text-[10px] font-medium text-text-gray leading-tight">
                            {format(day, 'EEE', { locale: fr })}
                          </span>
                          <span className={`text-xs font-bold leading-tight ${isToday(day) ? 'text-primary' : 'text-text-dark'}`}>
                            {format(day, 'd')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Rows */}
            <div>
              {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                <div key={projectName}>
                  {/* Project Group Header */}
                  <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <div className="flex-shrink-0 px-4 py-2 text-xs font-bold text-text-soft uppercase tracking-wider" style={{ width: 280 }}>
                      {projectName}
                    </div>
                    <div style={{ width: totalWidth }} />
                  </div>

                  {/* Task Rows */}
                  {projectTasks.map(task => {
                    const left = getTaskStartOffset(task);
                    const width = getTaskWidth(task);

                    return (
                      <div key={task.id} className="flex border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        {/* Task Label */}
                        <div
                          className="flex-shrink-0 px-4 py-2 flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                          style={{ width: 280, minHeight: rowHeight }}
                          onClick={() => onTaskClick(task)}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status] || 'bg-gray-400'}`} />
                          <span className="text-sm text-text-dark truncate font-medium">{task.title}</span>
                        </div>
                        {/* Timeline Area */}
                        <div className="relative" style={{ width: totalWidth, minHeight: rowHeight }}>
                          {/* Today line */}
                          {days.some(d => isToday(d)) && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-primary/40 z-10"
                              style={{
                                left: days.findIndex(d => isToday(d)) * dayWidth + dayWidth / 2,
                              }}
                            />
                          )}
                          {/* Task Bar */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-7 rounded-lg cursor-pointer group transition-all hover:shadow-md hover:scale-y-110"
                            style={{
                              left,
                              width: Math.max(dayWidth, width),
                              backgroundColor: task.projectColor || '#00B4DB',
                              opacity: task.status === 'completed' ? 0.5 : 0.85,
                            }}
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="px-2 h-full flex items-center">
                              <span className={`text-xs font-medium truncate ${width > 60 ? 'text-white' : 'sr-only'}`}>
                                {task.title}
                              </span>
                            </div>
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
                              <p className="font-semibold">{task.title}</p>
                              <p className="text-white/70 mt-0.5">
                                {task.start_date ? format(parseISO(task.start_date), 'dd MMM', { locale: fr }) : '?'} → {task.dueDate ? format(parseISO(task.dueDate), 'dd MMM', { locale: fr }) : '?'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-text-gray">
        <span className="font-medium">Légende:</span>
        {Object.entries({
          'todo': 'À faire',
          'in-progress': 'En cours',
          'completed': 'Terminé',
          'pending': 'En attente',
        }).map(([status, label]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
            {label}
          </span>
        ))}
        <span className="ml-auto">
          Ctrl+Molette pour zoomer · Aujourd'hui: <span className="text-primary font-medium">{format(today, 'dd MMM yyyy', { locale: fr })}</span>
        </span>
      </div>
    </div>
  );
};

export default GanttChart;
