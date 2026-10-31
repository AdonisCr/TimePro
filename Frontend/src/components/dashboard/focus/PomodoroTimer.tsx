interface PomodoroTimerProps {
  progress: number;
  timeRemaining: number;
  currentSession: number;
  totalSessions: number;
  isBreak: boolean;
}

const PomodoroTimer = ({
  progress,
  timeRemaining,
  isBreak,
}: PomodoroTimerProps) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeString =
    hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;

  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-linear ${
            isBreak ? 'text-green-500' : 'text-primary'
          }`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-mono font-bold text-text-dark tracking-wider">
          {timeString}
        </span>
        <span className={`text-sm font-medium mt-2 ${isBreak ? 'text-green-600' : 'text-primary'}`}>
          {isBreak ? '☕ Pause' : '🍅 Concentré'}
        </span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
