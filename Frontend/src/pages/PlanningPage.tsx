import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Target } from 'lucide-react';
import { getEatThatFrogTask, getEstimatedMinutes, formatTime, type Task } from '../lib/productivity';
import { api } from '../lib/axios';
import type { PlanBlock, PlanningTodayResponse } from '../lib/braindump';

interface PlanningPageProps {
  tasks: Task[];
}

interface TimeBlock {
  id: string;
  startHour: number;
  startMinute: number;
  duration: number;
  task: Task | null;
  title?: string;
  type: 'work' | 'break' | 'meeting';
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8h to 19h
const SLOT_HEIGHT = 80; // px per hour

const parsePlanBlock = (block: PlanBlock, index: number): TimeBlock | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(block.start);
  if (!match) return null;
  return {
    id: `plan-${block.task_id}-${index}`,
    startHour: Number(match[1]),
    startMinute: Number(match[2]),
    duration: block.minutes > 0 ? block.minutes : 30,
    task: null,
    title: block.title,
    type: 'work',
  };
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const PlanningPage = ({ tasks }: PlanningPageProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayBlocks, setTodayBlocks] = useState<PlanBlock[] | null>(null);

  const isToday = isSameDay(selectedDate, new Date());

  // Planning sauvegardé (Brain Dump) : GET /api/planning/today, uniquement pour aujourd'hui.
  useEffect(() => {
    if (!isToday) {
      setTodayBlocks(null);
      return;
    }

    let cancelled = false;
    setTodayBlocks(null);

    api
      .get<PlanningTodayResponse>('/planning/today')
      .then(({ data }) => {
        if (!cancelled) {
          setTodayBlocks(Array.isArray(data.blocks) ? data.blocks : []);
        }
      })
      .catch(() => {
        if (!cancelled) setTodayBlocks(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, isToday]);

  const timeBlocks = useMemo((): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    const activeTasks = tasks.filter(t => t.status !== 'done');
    const frogTask = getEatThatFrogTask(tasks);
    
    let currentHour = 9; // Start at 9:00
    let currentMinute = 0;

    // First block: Eat That Frog (if exists)
    if (frogTask) {
      const duration = getEstimatedMinutes(frogTask);
      blocks.push({
        id: `frog-${frogTask.id}`,
        startHour: currentHour,
        startMinute: currentMinute,
        duration,
        task: frogTask,
        type: 'work',
      });
      
      currentMinute += duration;
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
      
      // Add break after frog
      blocks.push({
        id: 'break-frog',
        startHour: currentHour,
        startMinute: currentMinute,
        duration: 15,
        task: null,
        type: 'break',
      });
      currentMinute += 15;
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }

    // Add other high priority tasks
    const otherTasks = activeTasks
      .filter(t => t.id !== frogTask?.id)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      });

    otherTasks.forEach(task => {
      if (currentHour >= 19) return; // Stop at 19:00
      
      const duration = getEstimatedMinutes(task);
      blocks.push({
        id: `task-${task.id}`,
        startHour: currentHour,
        startMinute: currentMinute,
        duration,
        task,
        type: 'work',
      });
      
      currentMinute += duration + 15; // 15min break
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    });

    return blocks;
  }, [tasks]);

  // Les blocs sauvegardés (Brain Dump) priment sur le fallback calculé côté client.
  const displayBlocks = useMemo((): TimeBlock[] => {
    if (isToday && todayBlocks && todayBlocks.length > 0) {
      return todayBlocks
        .map(parsePlanBlock)
        .filter((block): block is TimeBlock => block !== null);
    }
    return timeBlocks;
  }, [isToday, todayBlocks, timeBlocks]);

  const getBlockStyle = (block: TimeBlock) => {
    const topOffset = (block.startHour - 8) * SLOT_HEIGHT + (block.startMinute / 60) * SLOT_HEIGHT;
    const height = (block.duration / 60) * SLOT_HEIGHT;
    
    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 30)}px`,
    };
  };

  const getBlockColor = (block: TimeBlock) => {
    if (block.type === 'break') return 'bg-green-100 border-green-200';
    if (!block.task && block.title) return 'bg-primary/5 border-primary/20';
    if (!block.task) return 'bg-gray-100 border-gray-200';
    
    if (block.id.startsWith('frog-')) return 'bg-orange-100 border-orange-300 ring-2 ring-orange-200';
    
    switch (block.task.priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const totalWorkMinutes = displayBlocks
    .filter(b => b.type === 'work')
    .reduce((acc, b) => acc + b.duration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Planning intelligent</h1>
          <p className="text-text-soft">
            {formatTime(totalWorkMinutes)} de travail planifié
            {isToday && todayBlocks && todayBlocks.length > 0
              ? ' • planning du jour synchronisé'
              : ''}
          </p>
        </div>
        
        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-text-dark min-w-[150px] text-center">
            {isToday ? 'Aujourd’hui · ' : ''}
            {selectedDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </span>
          <button
            onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-dark">Capacité du jour</span>
          <span className="text-sm text-text-soft">
            {formatTime(totalWorkMinutes)} / 8h
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              totalWorkMinutes > 480 ? 'bg-red-500' : totalWorkMinutes > 360 ? 'bg-yellow-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min((totalWorkMinutes / 480) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-text-soft mt-1">
          {totalWorkMinutes > 480 
            ? '⚠️ Tu as trop de tâches. Veux-tu en reporter ?'
            : totalWorkMinutes > 360
            ? '🟡 Journée chargée mais faisable.'
            : '🟢 Tu as de la marge pour l\'imprévu.'}
        </p>
      </div>

      {/* Time blocks */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative" style={{ height: `${HOURS.length * SLOT_HEIGHT}px` }}>
          {/* Hour lines */}
          {HOURS.map(hour => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${(hour - 8) * SLOT_HEIGHT}px` }}
            >
              <span className="absolute -top-3 left-4 text-xs text-text-soft bg-white px-1">
                {hour}:00
              </span>
            </div>
          ))}

          {/* Time blocks */}
          {displayBlocks.map(block => (
            <div
              key={block.id}
              className={`absolute left-20 right-4 rounded-lg border p-2 transition-shadow ${getBlockColor(block)} ${
                block.task ? 'cursor-pointer hover:shadow-md' : ''
              }`}
              style={getBlockStyle(block)}
              onClick={() => {
                if (block.task) {
                  navigate('/focus', { state: { task: block.task } });
                } else if (block.title) {
                  navigate('/focus');
                }
              }}
            >
              {block.type === 'break' ? (
                <div className="flex items-center justify-center h-full text-green-600 text-sm font-medium">
                  ☕ Pause
                </div>
              ) : block.task ? (
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {block.id.startsWith('frog-') && <span className="text-sm">🐸</span>}
                      <h4 className="font-medium text-text-dark text-sm truncate">{block.task.title}</h4>
                    </div>
                    {block.task.project && (
                      <span 
                        className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full text-white"
                        style={{ backgroundColor: block.task.project.color }}
                      >
                        {block.task.project.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-soft">
                    <span>{formatTime(block.duration)}</span>
                    <Target className="w-3 h-3" />
                  </div>
                </div>
              ) : block.title ? (
                <div className="h-full flex flex-col justify-between">
                  <h4 className="font-medium text-text-dark text-sm truncate">{block.title}</h4>
                  <span className="text-xs text-text-soft">{formatTime(block.duration)}</span>
                </div>
              ) : null}
            </div>
          ))}

          {/* Current time indicator */}
          <div 
            className="absolute left-16 right-4 h-0.5 bg-red-500 z-10"
            style={{ 
              top: `${(new Date().getHours() - 8) * SLOT_HEIGHT + (new Date().getMinutes() / 60) * SLOT_HEIGHT}px` 
            }}
          >
            <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/brain-dump')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Vider mon esprit</span>
        </button>
        <button
          onClick={() => navigate('/focus')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-text-dark font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Target className="w-5 h-5" />
          <span>Mode Focus</span>
        </button>
      </div>
    </div>
  );
};

export default PlanningPage;
