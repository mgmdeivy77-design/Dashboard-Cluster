export interface User {
  id: string;
  name: string;
  color: string; // Tailwind bg color class prefix or hex color
  role?: 'admin' | 'user' | 'supervisor' | 'pastor';
  password?: string;
  supervisorId?: string;
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
  isGroupTask?: boolean;
  completedAssigneeIds?: string[]; // track individual assignee completions
  subtasks?: { id: string; title: string; completed: boolean }[];
  recurrence?: 'ninguna' | 'diaria' | 'semanal' | 'mensual';
  comments?: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'user' | 'supervisor' | 'pastor';
  text: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  action: string; // e.g. 'created', 'updated', 'completed', 'deleted', 'status_changed'
  targetType: 'task' | 'event' | 'user';
  targetName: string;
  timestamp: string; // ISO string
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
  recurrence?: 'ninguna' | 'diaria' | 'semanal' | 'mensual';
}

export interface AppNotification {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

export function getAssignmentType(task: {
  creatorId: string;
  assigneeId?: string;
  assigneeIds?: string[];
  isMassAssignment?: boolean;
  isGroupTask?: boolean;
}) {
  const isMass = task.isMassAssignment || task.isGroupTask || (task.assigneeIds && task.assigneeIds.length > 1);
  const assignees = task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []);
  const uniqueAssignees = Array.from(new Set(assignees));
  
  if (isMass || uniqueAssignees.length > 1) {
    return {
      type: 'grupal' as const,
      label: 'Asignada Grupal',
      bgClass: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60',
    };
  }
  
  const isAuto = uniqueAssignees.length === 1 && uniqueAssignees[0] === task.creatorId;
  if (isAuto) {
    return {
      type: 'autoasignada' as const,
      label: 'Autoasignada',
      bgClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60',
    };
  }
  
  return {
    type: 'individual' as const,
    label: 'Asignada Individual',
    bgClass: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60',
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'user' | 'supervisor' | 'pastor';
  senderColor: string;
  receiverId?: string; // empty or undefined for global/general channel
  receiverIds?: string[]; // Multiple receivers for private group or single private recipient
  text: string;
  timestamp: string; // ISO format
  edited?: boolean;
}
