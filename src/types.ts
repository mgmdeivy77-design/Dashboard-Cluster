export interface User {
  id: string;
  name: string;
  color: string; // Tailwind bg color class prefix or hex color
  role?: 'admin' | 'user';
  password?: string;
}

export type Priority = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completada';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string; // Backward compatibility User ID
  assigneeIds?: string[]; // Multiple assignees (mass assignment / mass allocation)
  creatorId: string;  // User ID
  priority: Priority;
  status: TaskStatus;
  dueDate: string;    // YYYY-MM-DD
  category: string;
  createdAt: string;
  isMassAssignment?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  description: string;
  participantIds: string[]; // User IDs
  creatorId: string;   // User ID
  createdAt: string;
}

export interface AppNotification {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}
