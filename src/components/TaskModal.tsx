import React, { useState, useEffect } from 'react';
import { Task, User, Priority, TaskStatus } from '../types';
import { X, Calendar as CalendarIcon, Tag, User as UserIcon, AlertTriangle, Users, Check, Square, CheckSquare } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  users: User[];
  currentUserId: string;
  editTask?: Task; // If provided, we are editing!
  initialSelectedDate?: string; // Optional default date
}

const COMMON_CATEGORIES = [
  'Diseño',
  'Frontend',
  'Backend',
  'QA / Testing',
  'DevOps',
  'Gestión',
  'Documentación',
  'Marketing',
];

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  users,
  currentUserId,
  editTask,
  initialSelectedDate,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Media');
  const [status, setStatus] = useState<TaskStatus>('Pendiente');
  const [assigneeId, setAssigneeId] = useState('');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<'ninguna' | 'diaria' | 'semanal' | 'mensual'>('ninguna');
  const [errorMsg, setErrorMsg] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGroupTask, setIsGroupTask] = useState(false);

  const currentUserObj = users.find((u) => u.id === currentUserId);
  const isAdmin = currentUserObj?.role === 'admin' || currentUserObj?.role === 'supervisor' || currentUserObj?.role === 'pastor';

  const assignmentUsers = users.filter((u) => {
    if (!currentUserObj) return true;
    if (currentUserObj.role === 'admin') return true;
    if (currentUserObj.role === 'pastor') {
      const getCdiNum = (n: string) => n.match(/CDI-(\d+)/)?.[1] || '';
      const currentCdi = getCdiNum(currentUserObj.name);
      return getCdiNum(u.name) === currentCdi || u.id === currentUserId;
    }
    if (currentUserObj.role === 'supervisor') {
      const getCdiNum = (n: string) => n.match(/CDI-(\d+)/)?.[1] || '';
      const currentCdi = getCdiNum(currentUserObj.name);
      return getCdiNum(u.name) === currentCdi || u.id === currentUserId || u.supervisorId === currentUserId;
    }
    return u.id === currentUserId;
  });

  // Mass assignment states
  const [isMassAssignMode, setIsMassAssignMode] = useState(false);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  // Sychronize form state when editTask changes
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setPriority(editTask.priority || 'Media');
      setStatus(editTask.status || 'Pendiente');
      setCategory(editTask.category || 'General');
      setDueDate(editTask.dueDate || '');
      setRecurrence(editTask.recurrence || 'ninguna');
      setSubtasks(editTask.subtasks || []);
      setNewSubtaskTitle('');
      setIsGroupTask(!!editTask.isGroupTask);

      if (!isAdmin) {
        setIsMassAssignMode(false);
        setAssigneeId(currentUserId);
        setSelectedAssigneeIds([currentUserId]);
      } else {
        const isMass = editTask.isMassAssignment || (editTask.assigneeIds && editTask.assigneeIds.length > 1);
        setIsMassAssignMode(!!isMass);

        if (isMass) {
          setSelectedAssigneeIds(editTask.assigneeIds || [editTask.assigneeId]);
          setAssigneeId(editTask.assigneeId || editTask.assigneeIds?.[0] || currentUserId);
        } else {
          setAssigneeId(editTask.assigneeId || currentUserId);
          setSelectedAssigneeIds([editTask.assigneeId || currentUserId]);
        }
      }
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setPriority('Media');
      setStatus('Pendiente');
      setAssigneeId(currentUserId || (users[0]?.id || ''));
      setCategory('General');
      const fallbackDate = initialSelectedDate || new Date().toISOString().split('T')[0];
      setDueDate(fallbackDate);
      setRecurrence('ninguna');
      setIsMassAssignMode(false);
      setSelectedAssigneeIds([currentUserId || (users[0]?.id || '')]);
      setSubtasks([]);
      setNewSubtaskTitle('');
      setIsGroupTask(false);
    }
    setErrorMsg('');
  }, [editTask, isOpen, currentUserId, users, initialSelectedDate, isAdmin]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `st-${Math.random().toString(36).substr(2, 9)}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks((prev) => [...prev, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (stId: string) => {
    setSubtasks((prev) => {
      const updated = prev.map((s) => (s.id === stId ? { ...s, completed: !s.completed } : s));
      const allCompleted = updated.length > 0 && updated.every((s) => s.completed);
      if (allCompleted && status !== 'Completada') {
        setStatus('Completada');
      } else if (!allCompleted && status === 'Completada') {
        setStatus('En Progreso');
      }
      return updated;
    });
  };

  const handleRemoveSubtask = (stId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== stId));
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedAssigneeIds((prev) => {
      if (prev.includes(userId)) {
        // Don't empty the selection completely
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    setSelectedAssigneeIds(assignmentUsers.map((u) => u.id));
  };

  const handleSelectNoUsers = () => {
    // Keep at least currentUserId
    setSelectedAssigneeIds([currentUserId]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor especifica un título para la tarea.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Por favor suministra una fecha límite correcta.');
      return;
    }

    let finalAssigneeId = assigneeId;
    let finalAssigneeIds: string[] = [];

    if (isMassAssignMode) {
      if (selectedAssigneeIds.length === 0) {
        setErrorMsg('Debes seleccionar al menos un responsable para la asignación en masa.');
        return;
      }
      finalAssigneeIds = selectedAssigneeIds;
      finalAssigneeId = selectedAssigneeIds[0]; // primary
    } else {
      finalAssigneeId = assigneeId;
      finalAssigneeIds = [assigneeId];
    }

    onSave({
      id: editTask?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assigneeId: finalAssigneeId,
      assigneeIds: finalAssigneeIds,
      isMassAssignment: isMassAssignMode || finalAssigneeIds.length > 1,
      isGroupTask,
      creatorId: editTask ? editTask.creatorId : currentUserId,
      category: category.trim(),
      dueDate,
      subtasks,
      recurrence,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Contents container */}
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <span>{editTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Título de la Tarea <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Programar pruebas unitarias..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
              maxLength={80}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Descripción detallada
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe aquí las especificaciones del trabajo..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 resize-none"
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prioridad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Baja', 'Media', 'Alta'] as Priority[]).map((p) => {
                  const isActive = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? p === 'Alta'
                            ? 'bg-red-500 border-red-500 text-white shadow-xs'
                            : p === 'Media'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fecha límite de entrega <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado Actual
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="En Progreso">🚀 En Progreso</option>
                <option value="Completada">✅ Completada</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Categoría del trabajo
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Escribe o selecciona abajo..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                  maxLength={25}
                />
              </div>
            </div>

            {/* Recurrence Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recurrencia de Tarea
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
              >
                <option value="ninguna">No se repite (Única vez)</option>
                <option value="diaria">⏳ Repetir diariamente</option>
                <option value="semanal">🔄 Repetir semanalmente</option>
                <option value="mensual">📅 Repetir mensualmente</option>
              </select>
            </div>
          </div>

          {/* Quick Suggestions list */}
          <div className="flex flex-wrap gap-1.5 pt-0.5 pb-2">
            {COMMON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mass Assign Selector Header */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
            {isAdmin ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Asignación de Responsables
                  </label>
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsMassAssignMode(false)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        !isMassAssignMode
                          ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <UserIcon className="w-3 h-3 inline-block mr-1" />
                      Único
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMassAssignMode(true)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        isMassAssignMode
                          ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Users className="w-3 h-3 inline-block mr-1" />
                      En Masa
                    </button>
                  </div>
                </div>

                {/* Conditionally render single vs multiple assignee selectors */}
                {!isMassAssignMode ? (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                    >
                      {assignmentUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.role === 'admin' ? '(Admin)' : u.role === 'pastor' ? '(Pastor)' : u.role === 'supervisor' ? '(Supervisor)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-955/30 border border-slate-200 dark:border-slate-850 rounded-xl p-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-slate-150 dark:border-slate-800 pb-1.5 mb-1.5">
                      <span>Selecciona uno o más colaboradores:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllUsers}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Todos
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          onClick={handleSelectNoUsers}
                          className="text-slate-500 hover:underline cursor-pointer"
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {assignmentUsers.map((usr) => {
                        const isChecked = selectedAssigneeIds.includes(usr.id);
                        return (
                          <button
                            key={usr.id}
                            type="button"
                            onClick={() => handleToggleUserSelection(usr.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer ${
                              isChecked
                                ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                            )}
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                              style={{ backgroundColor: usr.color }}
                            >
                              {getInitials(usr.name)}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {usr.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955/30 border border-slate-150 dark:border-slate-850 rounded-xl">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: currentUserObj?.color || '#4f46e5' }}
                  >
                    {getInitials(currentUserObj?.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-250">
                      {currentUserObj?.name} (Tú)
                    </span>
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                      Auto-asignación obligatoria
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Como colaborador, todas las tareas que registres se auto-asignarán automáticamente a tu cuenta. No tienes permitido asignar tareas a otros colaboradores.
                </p>
              </div>
            )}

            {/* SUBTASKS/CHECKLIST SECTION */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Subtareas / Checklist ({subtasks.filter(s => s.completed).length}/{subtasks.length})
              </label>

              {/* Subtask Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Agregar subtarea... (Ej: Revisar documentación)"
                  className="flex-1 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-250 dark:border-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Añadir
                </button>
              </div>

              {/* Subtask List */}
              {subtasks.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No hay subtareas añadidas todavía.</p>
              ) : (
                <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1">
                  {subtasks.map((st) => (
                    <div 
                      key={st.id} 
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850/60 rounded-xl"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st.id)}
                        className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        {st.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                        )}
                        <span className={`text-xs font-semibold truncate ${st.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-750 dark:text-slate-300'}`}>
                          {st.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Subtarea"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-transform hover:-translate-y-0.5 shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            {editTask ? 'Guardar Cambios' : 'Registrar Tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
