
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds <= 0) return "0:00:00";
  
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], { 
    month: 'short',
    day: 'numeric'
  });
};

export const calculateSessionDuration = (startTime: Date, endTime: Date | null): number => {
  if (!endTime) return 0;
  return endTime.getTime() - startTime.getTime();
};

export const calculateTotalTime = (sessions: Array<{ duration?: number, startTime: Date, endTime: Date | null }>): number => {
  return sessions.reduce((total, session) => {
    if (session.duration) {
      return total + session.duration;
    }
    
    if (session.endTime) {
      return total + (session.endTime.getTime() - session.startTime.getTime());
    }
    
    // For active sessions, calculate time until now
    return total + (Date.now() - session.startTime.getTime());
  }, 0);
};

export const getRandomPastelColor = (): string => {
  // Pre-defined list of soft, pleasant colors that work well together
  const colors = [
    "hsl(210, 100%, 92%)", // soft blue
    "hsl(180, 100%, 92%)", // soft teal
    "hsl(150, 100%, 92%)", // soft green
    "hsl(300, 100%, 95%)", // soft purple
    "hsl(330, 100%, 95%)", // soft pink
    "hsl(30, 100%, 94%)",  // soft orange
    "hsl(50, 100%, 94%)",  // soft yellow
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};
