
export interface TimeSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime: Date | null;
  note: string;
  duration?: number; // in milliseconds, calculated when session ends
}

export interface Project {
  id: string;
  name: string;
  color: string;
  sessions: TimeSession[];
  isActive: boolean;
  totalTime: number; // in milliseconds
}
