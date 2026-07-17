import React, { useState } from 'react';
import { Task, User, TaskStatus, Priority, getAssignmentType, Comment } from '../types';
import { 
  X, 
  Calendar, 
  Tag, 
  CheckCircle, 
  Square, 
  User as UserIcon, 
  Users, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckSquare, 
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Send,
  Save
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | undefined;
  users: User[];
  currentUserId: string;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditClick: (task: Task) => void;
  onDeleteClick: (id: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  onDeleteComment: (taskId: string, commentId: string) => void;
  onUpdateComment: (taskId: string, commentId: string, newText: string) => void;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  users,
  currentUserId,
  onStatusChange,
  onToggleSubtask,
  onEditClick,
  onDeleteClick,
  onAddComment,
  onDeleteComment,
  onUpdateComment
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const assignee = users.find((u) => u.id === task.assigneeId);
  const creator = users.find((u) => u.id === task.creatorId);
  const isMass = task.isMassAssignment || (task.assigneeIds && task.assigneeIds.length > 1);
  const uniqueAssigneeIds = Array.from(new Set(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : [])));

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
        return 'bg-red-50 text-red-700 dark:bg-red-955/40 dark:text-red-400 border-red-200 dark:border-red-900/40';
      case 'Media':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-955/45 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
      case 'Baja':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.status !== 'Completada' && task.dueDate < todayStr;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs transition-opacity overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color stripe if overdue */}
        <div className={`h-2 w-full ${isOverdue ? 'bg-red-500' : task.status === 'Completada' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

        {isReadOnly && (
          <div className="bg-amber-50 dark:bg-amber-955/20 border-b border-amber-250 dark:border-amber-900/40 px-6 py-2.5 text-xs text-amber-800 dark:text-amber-400 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
            <span>Modo de Solo Lectura: Esta es una tarea de su colaborador asignado. Solo puede visualizarla y agregar comentarios.</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getPriorityStyle(task.priority)}`}>
              Prioridad {task.priority}
            </span>
            {(() => {
              const assignment = getAssignmentType(task);
              return (
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${assignment.bgClass}`}>
                  {assignment.label}
                </span>
              );
            })()}
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-800">
              <Tag className="w-3 h-3 text-slate-400" />
              {task.category || 'General'}
            </span>
            {task.recurrence && task.recurrence !== 'ninguna' && (
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-150 dark:border-indigo-900/30 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                {task.recurrence}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {task.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500 animate-pulse font-bold' : 'text-slate-400'}`} />
                <span>Fecha Límite:</span>
                <span className={`font-bold ${isOverdue ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {task.dueDate} {isOverdue && '(Vencido)'}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Creada:</span>
                <span className="font-medium text-slate-700 dark:text-slate-350">
                  {new Date(task.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Bar Selector */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                task.status === 'Completada' ? 'bg-emerald-500' : task.status === 'En Progreso' ? 'bg-blue-500' : 'bg-amber-500'
              }`} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Estado actual: <strong className="uppercase">{task.status}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Cambiar a:</span>
              <div className="flex gap-1.5">
                {(['Pendiente', 'En Progreso', 'Completada'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={isReadOnly}
                    onClick={() => !isReadOnly && onStatusChange(task.id, st)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      isReadOnly
                        ? task.status === st
                          ? 'bg-indigo-600/50 border-indigo-600/50 text-white cursor-not-allowed opacity-70'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-350 dark:text-slate-600 border-slate-200 dark:border-slate-850 cursor-not-allowed'
                        : task.status === st
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs cursor-pointer'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    {st === 'Pendiente' ? '⏳ Pendiente' : st === 'En Progreso' ? '🚀 Progreso' : '✅ Lista'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assignees List Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {isMass ? `Responsables Asignados (${uniqueAssigneeIds.length})` : 'Responsable Asignado'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {uniqueAssigneeIds.length > 0 ? (
                uniqueAssigneeIds.map((uid) => {
                  const u = users.find((usr) => usr.id === uid);
                  if (!u) return null;
                  return (
                    <div 
                      key={uid} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        isMass && task.completedAssigneeIds?.includes(uid)
                          ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/5'
                          : 'border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-905/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: u.color }}
                        >
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            {u.role === 'admin' ? '🛡️ Facilitador' : u.role === 'pastor' ? '⛪ Pastor Gerente' : u.role === 'supervisor' ? '🕵️ Supervisor' : '👤 Colaborador'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Completion status for group tasks */}
                      {isMass && (
                        <div className="shrink-0 ml-2">
                          {task.completedAssigneeIds?.includes(uid) ? (
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Completó
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider">
                              <Clock className="w-2.5 h-2.5" />
                              Falta
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <UserIcon className="w-4 h-4 text-slate-350" />
                  Sin asignar responsable específico.
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Descripción detallada
            </h3>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
              {task.description ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No se ha ingresado una descripción para esta tarea.
                </p>
              )}
            </div>
          </div>

          {/* Interactive Subtasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                Subtareas / Checklist ({completedSubtasksCount}/{subtasksCount})
              </h3>
              {subtasksCount > 0 && (
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {subtasksPct}% completado
                </span>
              )}
            </div>

            {subtasksCount > 0 && (
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-200/20">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${subtasksPct}%` }}
                />
              </div>
            )}

            <div className="space-y-2">
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks.map((st) => (
                  <div 
                    key={st.id}
                    onClick={() => !isReadOnly && onToggleSubtask(task.id, st.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all select-none ${
                      isReadOnly 
                        ? 'cursor-not-allowed bg-slate-50/50 dark:bg-slate-950/25 border-slate-150 dark:border-slate-850'
                        : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    } ${
                      st.completed 
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-slate-400 dark:text-slate-500' 
                        : 'text-slate-750 dark:text-slate-350'
                    }`}
                  >
                    <div className="flex items-start gap-3 pr-4 min-w-0 flex-1">
                      <div className="shrink-0 mt-0.5">
                        {st.completed ? (
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 fill-current" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-350 dark:text-slate-700" />
                        )}
                      </div>
                      <span className={`text-xs font-semibold whitespace-normal break-words leading-relaxed flex-1 ${st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {st.title}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {st.completed ? (
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Listo</span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Pendiente</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-slate-200/50 dark:border-slate-800/80 border-dashed rounded-2xl text-slate-400 italic text-xs">
                  Esta tarea no tiene subtareas adicionales.
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-slate-150 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Comentarios e Indicaciones ({(task.comments || []).length})
            </h3>

            {/* List of comments */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {(task.comments || []).length > 0 ? (
                (task.comments || []).map((comment) => {
                  const isCommentOwner = comment.userId === currentUserId;
                  const commentAuthor = users.find((u) => u.id === comment.userId);
                  const isEditingThisComment = editingCommentId === comment.id;

                  const roleLabels: Record<string, string> = {
                    admin: '🛡️ Admin',
                    pastor: '⛪ Pastor Gerente',
                    supervisor: '🕵️ Director',
                    user: '👤 Colaborador'
                  };

                  return (
                    <div 
                      key={comment.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1.5"
                    >
                      {/* Comment Header */}
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                            style={{ backgroundColor: commentAuthor?.color || '#94a3b8' }}
                          >
                            {comment.userName[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {comment.userName}
                          </span>
                          <span className="text-[9px] bg-slate-250 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold px-1.5 py-0.5 rounded-md">
                            {roleLabels[comment.userRole] || 'Miembro'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {new Date(comment.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Comment Content */}
                      {isEditingThisComment ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-850 dark:text-slate-150 focus:outline-hidden focus:border-blue-500"
                          />
                          <button
                            onClick={() => {
                              if (editingCommentText.trim()) {
                                onUpdateComment(task.id, comment.id, editingCommentText.trim());
                                setEditingCommentId(null);
                              }
                            }}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-md transition-all cursor-pointer"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium pl-6 whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      )}

                      {/* Comment Actions (Only owner can edit/delete) */}
                      {isCommentOwner && !isEditingThisComment && (
                        <div className="flex gap-2.5 justify-end pl-6">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingCommentText(comment.text);
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Está seguro de eliminar este comentario?')) {
                                onDeleteComment(task.id, comment.id);
                              }
                            }}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold hover:underline transition-all cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-400 italic text-xs bg-slate-50/40 dark:bg-slate-950/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  No hay comentarios aún. Escribe una instrucción o nota a continuación.
                </div>
              )}
            </div>

            {/* Post comment form */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Escribir un comentario o instrucción para el colaborador..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCommentText.trim()) {
                    onAddComment(task.id, newCommentText.trim());
                    setNewCommentText('');
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-850 dark:text-slate-150 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (newCommentText.trim()) {
                    onAddComment(task.id, newCommentText.trim());
                    setNewCommentText('');
                  }
                }}
                disabled={!newCommentText.trim()}
                className="p-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-45 rounded-xl transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                title="Enviar comentario"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Creator Detail Section */}
          <div className="flex items-center gap-2 text-[10.5px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-semibold">Creador del registro:</span>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                style={{ backgroundColor: creator?.color || '#94a3b8' }}
              >
                {creator?.name[0]?.toUpperCase() || '?'}
              </div>
              <span className="font-bold text-slate-500 dark:text-slate-400">{creator?.name || 'Sistema'}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {canEditOrDelete && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEditClick(task);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Tarea
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDeleteClick(task.id);
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/35 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
