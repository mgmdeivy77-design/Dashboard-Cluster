import React from 'react';
import { Task, User, Priority, TaskStatus, getAssignmentType } from '../types';
import { Trash2, Edit3, Calendar, Tag, User as UserIcon, CheckCircle, Users } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  users: User[];
  currentUserId: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  viewMode: 'kanban' | 'list';
  onViewDetails?: (task: Task) => void;
}

export function TaskCard({ task, users, currentUserId, onEdit, onDelete, onStatusChange, viewMode, onViewDetails }: TaskCardProps) {
  const assignee = users.find((u) => u.id === task.assigneeId);
  const creator = users.find((u) => u.id === task.creatorId);
  const currentUserObj = users.find((u) => u.id === currentUserId);

  const isCollaboratorTask = (() => {
    if (currentUserObj?.role !== 'supervisor') return false;
    const ids = Array.from(new Set(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : [])));
    return ids.some(uid => {
      const u = users.find(usr => usr.id === uid);
      return u?.supervisorId === currentUserId;
    });
  })();

  const isReadOnly = currentUserObj?.role === 'supervisor' && isCollaboratorTask;
  const canEditOrDelete = (currentUserObj?.role === 'admin' || currentUserObj?.role === 'pastor' || (currentUserObj?.role === 'supervisor' && !isReadOnly) || task.creatorId === currentUserId) && !isReadOnly;

  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasksCount = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksPct = subtasksCount > 0 ? Math.round((completedSubtasksCount / subtasksCount) * 100) : 0;

  // Style priority pill
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'Media':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/45 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'Baja':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const isMass = task.isMassAssignment || (task.assigneeIds && task.assigneeIds.length > 1);
  const uniqueAssigneeIds = Array.from(new Set(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : [])));
  const isSelfCompleted = isMass ? (task.completedAssigneeIds?.includes(currentUserId) || false) : (task.status === 'Completada');

  // Check if task is overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isSelfCompleted && task.dueDate < todayStr;

  // Render initials
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Standard component markup for Kanban state
  if (viewMode === 'kanban') {
    return (
      <div 
        id={`task-kanban-${task.id}`}
        onClick={() => onViewDetails?.(task)}
        className={`group bg-white dark:bg-slate-900 border cursor-pointer hover:border-blue-400 dark:hover:border-blue-800/80 ${
          isOverdue 
            ? 'border-red-500/70 shadow-red-500/5 dark:border-red-500/50' 
            : 'border-slate-200 dark:border-slate-800'
        } rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-300 relative flex flex-col justify-between`}
      >
        {isOverdue && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t-xl" />
        )}

        <div>
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-1.5 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                {task.priority}
              </span>
              {(() => {
                const assignment = getAssignmentType(task);
                return (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${assignment.bgClass}`}>
                    {assignment.label}
                  </span>
                );
              })()}
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
              <Tag className="w-2.5 h-2.5" />
              {task.category || 'General'}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 flex-wrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <span>{task.title}</span>
            {task.recurrence && task.recurrence !== 'ninguna' && (
              <span className="text-[9px] bg-indigo-55 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-indigo-200/25 shrink-0">
                🔄 {task.recurrence}
              </span>
            )}
          </h4>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-3 line-clamp-3 leading-relaxed">
            {task.description || 'Sin descripción.'}
          </p>

          {/* Subtasks summary progress bar */}
          {subtasksCount > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">
                <span>Subtareas</span>
                <span>{completedSubtasksCount}/{subtasksCount} ({subtasksPct}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/20">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${subtasksPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Due date status */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-3 text-[11px]">
            <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-500 font-bold animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate}
              {isOverdue && ' (Vencido)'}
            </span>

            {/* Quick status cycle button */}
            <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-slate-400">Estado:</span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-750 dark:text-slate-300 text-[11px] rounded px-1.5 py-0.5 border border-slate-250 dark:border-slate-700 focus:outline-hidden"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
          </div>

          {/* Assignee / Creator / Action buttons footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Assignee Avatars (Stack if multiple) */}
              <div className="flex -space-x-1.5 overflow-hidden">
                {isMass && uniqueAssigneeIds.length > 1 ? (
                  uniqueAssigneeIds.slice(0, 3).map((uid) => {
                    const u = users.find((usr) => usr.id === uid);
                    if (!u) return null;
                    return (
                      <div 
                        key={uid}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white dark:border-slate-900 relative group/avatar shrink-0 shadow-xs"
                        style={{ backgroundColor: u.color }}
                      >
                        {getInitials(u.name)}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-1 px-2 rounded opacity-0 pointer-events-none group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                          {u.name}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs relative group/avatar shrink-0"
                    style={{ backgroundColor: assignee?.color || '#94a3b8' }}
                  >
                    {getInitials(assignee?.name)}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 pointer-events-none group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                      Responsable: {assignee?.name || 'Sin Asignar'}
                    </span>
                  </div>
                )}
                {isMass && uniqueAssigneeIds.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-extrabold text-slate-600 dark:text-slate-450 shrink-0 shadow-xs">
                    +{uniqueAssigneeIds.length - 3}
                  </div>
                )}
              </div>

              {/* Creator details / Mass label */}
              <div className="text-[10px] text-slate-400">
                {isMass ? (
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    Masa ({task.completedAssigneeIds?.length || 0}/{uniqueAssigneeIds.length})
                  </span>
                ) : (
                  <>
                    <span className="block">Asignado</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-300 truncate max-w-[80px] block">
                      {assignee?.name || 'Sist.'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {canEditOrDelete && (
              <div className="flex items-center gap-1.5">
                <button
                  id={`btn-edit-task-${task.id}`}
                  onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                  className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Editar Tarea"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`btn-delete-task-${task.id}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar Tarea"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW LAYOUT
  return (
    <div 
      id={`task-list-${task.id}`}
      onClick={() => onViewDetails?.(task)}
      className={`bg-white dark:bg-slate-900 border cursor-pointer hover:border-blue-400 dark:hover:border-blue-800/80 ${
        isOverdue 
          ? 'border-red-500/60 shadow-red-500/5 dark:border-red-500/40' 
          : 'border-slate-200 dark:border-slate-800/80'
      } rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-250 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
    >
      <div className="flex items-start gap-3 flex-1">
        {/* Quick Done checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, isSelfCompleted ? 'Pendiente' : 'Completada'); }}
          className={`shrink-0 mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
            isSelfCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-350 dark:border-slate-700 bg-transparent hover:border-blue-500 dark:hover:border-blue-400'
          }`}
          title={isSelfCompleted ? 'Marcar como Pendiente' : 'Marcar como Completada'}
        >
          {isSelfCompleted && <CheckCircle className="w-4 h-4 text-white fill-current" />}
        </button>

        <div className="space-y-1 pr-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className={`text-sm font-semibold text-slate-800 dark:text-slate-100 ${
              isSelfCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}>
              {task.title}
            </h4>
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
              {task.category || 'General'}
            </span>
            {(() => {
              const assignment = getAssignmentType(task);
              return (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${assignment.bgClass}`}>
                  {assignment.label}
                </span>
              );
            })()}
            {subtasksCount > 0 && (
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700/60">
                <span>📋 Subtareas: {completedSubtasksCount}/{subtasksCount}</span>
              </span>
            )}
            {task.recurrence && task.recurrence !== 'ninguna' && (
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/40 uppercase tracking-wider">
                <span>🔄 {task.recurrence}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
            {task.description || 'Sin descripción adicional.'}
          </p>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              Asignado: <strong className="text-slate-500 dark:text-slate-300 font-bold">
                {isMass && uniqueAssigneeIds.length > 1 
                  ? `${uniqueAssigneeIds.length} Colaboradores` 
                  : assignee?.name || 'Ninguno'}
              </strong>
            </span>
            <span>•</span>
            <span>Creado por: <strong className="text-slate-500 dark:text-slate-300 font-medium">{creator?.name || 'Sist.'}</strong></span>
          </div>
        </div>
      </div>

      {/* Right control columns */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l sm:border-slate-100 sm:dark:border-slate-800/80 sm:pl-4 shrink-0">
        {/* Due date */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
          isOverdue 
            ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-900/60' 
            : task.status === 'Completada' 
              ? 'text-slate-450' 
              : 'text-slate-550 dark:text-slate-400'
        }`}>
          {task.dueDate}
          {isOverdue && <span className="block text-[8px] uppercase tracking-wider text-center text-red-500">Vencido</span>}
        </span>

        {/* Status selection Dropdown */}
        <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            disabled={isReadOnly}
            onChange={(e) => !isReadOnly && onStatusChange(task.id, e.target.value as TaskStatus)}
            className={`text-xs rounded-lg px-2 py-1 outline-hidden border ${
              isReadOnly
                ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-850'
                : task.status === 'Completada' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 cursor-pointer' 
                  : task.status === 'En Progreso'
                    ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 cursor-pointer'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 cursor-pointer'
            }`}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

        {/* Action icons */}
        {canEditOrDelete && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-2 text-slate-450 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Editar Tarea"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-2 text-slate-450 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Eliminar Tarea"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
