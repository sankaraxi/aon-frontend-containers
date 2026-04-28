import React, { useEffect, useRef, useState } from 'react';

const Timer = () => {
  const TOTAL_TIME = 30 * 60; // 30 minutes in seconds
  const [remainingTime, setRemainingTime] = useState(TOTAL_TIME);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);

  // Format time as mm:ss
  const formatTime = (time) => {
    const mins = Math.floor(time / 60).toString().padStart(2, '0');
    const secs = (time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Function to start the timer
  const startTimer = () => {
    if (intervalRef.current !== null) return; // Avoid multiple intervals

    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function to stop the timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Effect to start/stop timer based on online status
  useEffect(() => {
    if (isOnline) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isOnline]);

  // Effect to listen to online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopTimer();
    };
  }, []);

  return (
    <div className="text-center mt-4 text-2xl font-mono">
      <p>Time Remaining: {formatTime(remainingTime)}</p>
      <p>Status: {isOnline ? '🟢 Online' : '🔴 Offline - Timer Paused'}</p>
    </div>
  );
};

export default Timer;
