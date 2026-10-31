export type EventPriority = 'low' | 'medium' | 'high';

export type CalendarTask = {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_duration: number | null;
  is_completed?: boolean;
  description?: string | null;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color: string;
  priority: EventPriority;
  allDay: boolean;
  completed: boolean;
};

export const PRIORITY_COLORS: Record<EventPriority, string> = {
  high: '#EF4444',
  medium: '#3B82F6',
  low: '#9CA3AF',
};

export const DEFAULT_WORK_START_TIME = '09:00';

function normalizePriority(priority: string): EventPriority {
  return priority === 'high' || priority === 'medium' ? priority : 'low';
}

function parseClock(value: string | null | undefined): { hours: number; minutes: number } {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? '');
  if (!match) {
    const [hours, minutes] = DEFAULT_WORK_START_TIME.split(':');
    return { hours: Number(hours), minutes: Number(minutes) };
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function parseDueDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function tasksToCalendarEvents(
  tasks: CalendarTask[],
  workStartTime?: string | null
): CalendarEvent[] {
  const clock = parseClock(workStartTime);

  const events = tasks.flatMap(task => {
    if (!task.due_date) return [];

    const due = parseDueDate(task.due_date);
    if (!due) return [];

    const duration =
      typeof task.estimated_duration === 'number' && task.estimated_duration > 0
        ? task.estimated_duration
        : null;

    const priority = normalizePriority(task.priority);
    const completed = task.status === 'done' || task.is_completed === true;

    let start: Date;
    let end: Date;
    let allDay: boolean;

    if (duration !== null) {
      allDay = false;
      start = new Date(due.year, due.month - 1, due.day, clock.hours, clock.minutes, 0, 0);
      end = new Date(start.getTime() + duration * 60_000);
    } else {
      allDay = true;
      start = new Date(due.year, due.month - 1, due.day, 0, 0, 0, 0);
      end = new Date(due.year, due.month - 1, due.day + 1, 0, 0, 0, 0);
    }

    const event: CalendarEvent = {
      id: `task-${task.id}`,
      title: task.title,
      start,
      end,
      color: PRIORITY_COLORS[priority],
      priority,
      allDay,
      completed,
    };

    if (task.description) {
      event.description = task.description;
    }

    return [event];
  });

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}
