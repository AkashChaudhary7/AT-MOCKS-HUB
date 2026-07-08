import { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  onTick: (secondsRemaining: number) => void;
  isDarkMode: boolean;
}

export function CountdownTimer({
  durationMinutes,
  onTimeUp,
  onTick,
  isDarkMode,
}: CountdownTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTickRef.current = onTick;
  }, [onTimeUp, onTick]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTickRef.current(0);
          onTimeUpRef.current();
          return 0;
        }
        const next = prev - 1;
        onTickRef.current(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const isLowTime = secondsRemaining < 60;

  return (
    <div className={`flex items-center space-x-1.5 rounded-full border px-2.5 sm:px-3 py-1 font-mono text-xs font-bold select-none transition-all ${
      isLowTime
        ? 'border-red-200 bg-red-500/10 text-red-600 animate-pulse'
        : isDarkMode
        ? 'border-indigo-900 bg-indigo-900/30 text-indigo-400'
        : 'border-indigo-100 bg-indigo-50/50 text-indigo-700'
    }`} id="countdown-timer-container">
      <Timer className={`h-3.5 w-3.5 ${isLowTime ? 'animate-bounce' : ''}`} />
      <span>{formatTime(secondsRemaining)}</span>
    </div>
  );
}
export default CountdownTimer;
