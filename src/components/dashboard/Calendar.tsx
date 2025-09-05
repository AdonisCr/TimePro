import React from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarProps {
  tasks: any[];
}

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Transform tasks for calendar display
  const calendarTasks = tasks.map(task => {
    const taskDate = task.dueDate ? new Date(task.dueDate) : new Date();
    const endTime = task.dueTime ? 
      new Date(`2000-01-01T${task.dueTime}`).getTime() + (90 * 60 * 1000) : // Add 1.5 hours
      new Date(`2000-01-01T${task.dueTime || '09:00'}`).getTime() + (90 * 60 * 1000);
    const endTimeString = new Date(`2000-01-01T00:00:00.000Z`).setTime(endTime);
    const endTimeFormatted = new Date(endTimeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in-progress': return 'bg-primary/10 text-primary';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-text-soft';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'completed': return 'Done';
        case 'in-progress': return 'In Progress';
        case 'pending': return 'Pending';
        default: return 'Upcoming';
      }
    };

    return {
      date: taskDate.toDateString(),
      time: task.dueTime ? `${task.dueTime} - ${endTimeFormatted}` : '09:00 - 10:30',
      title: task.title,
      status: getStatusLabel(task.status),
      color: getStatusColor(task.status)
    };
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get previous month's last days
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (day: number) => {
    const newSelectedDate = new Date(year, month, day);
    setSelectedDate(newSelectedDate);
  };

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year;
  };

  const hasTask = (day: number) => {
    const dateToCheck = new Date(year, month, day).toDateString();
    return calendarTasks.some(task => task.date === dateToCheck);
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true
    });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false
    });
  }
  
  // Next month's days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false
    });
  }

  // Filter tasks for selected date
  const selectedDateTasks = calendarTasks.filter(task => task.date === selectedDate.toDateString());

  return (
    <div className="space-y-6">
      {/* Calendar Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">
            {monthNames[month]} {year}
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-text-soft" />
            </button>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-text-soft" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-text-soft py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dateObj, index) => {
            const { day, isCurrentMonth } = dateObj;
            const isCurrentDay = isCurrentMonth && isToday(day);
            const isSelectedDay = isCurrentMonth && isSelected(day);
            const hasTaskToday = isCurrentMonth && hasTask(day);

            return (
              <div
                key={index}
                onClick={() => isCurrentMonth && selectDate(day)}
                className={`relative h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelectedDay
                    ? 'bg-primary text-white font-semibold shadow-md'
                    : isCurrentDay
                    ? 'bg-primary/20 text-primary font-semibold'
                    : isCurrentMonth
                    ? 'hover:bg-gray-100 text-text-dark'
                    : 'text-gray-300 cursor-default'
                }`}
              >
                {day}
                {hasTaskToday && isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-dark">
            {selectedDate.toDateString() === today.toDateString() 
              ? "Today's Schedule" 
              : `Schedule for ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}`
            }
          </h3>
        </div>

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-3">
            {selectedDateTasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-1 h-12 bg-primary/30 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-text-dark">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.color}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-soft">{task.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-text-dark mb-2">No tasks scheduled</h4>
            <p className="text-text-soft text-sm">
              {selectedDate.toDateString() === today.toDateString() 
                ? "You have no tasks for today. Great job staying organized!" 
                : "No tasks scheduled for this date."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;