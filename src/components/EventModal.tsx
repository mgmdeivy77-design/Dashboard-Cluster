import React, { useState, useEffect } from 'react';
import { Event, User } from '../types';
import { X, Calendar as CalendarIcon, Clock, Users, AlertTriangle } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<Event, 'id' | 'createdAt'> & { id?: string }) => void;
  users: User[];
  currentUserId: string;
  editEvent?: Event; // If provided, we are editing!
  defaultDate?: string; // Preselected date
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  users,
  currentUserId,
  editEvent,
  defaultDate,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState<'ninguna' | 'diaria' | 'semanal' | 'mensual'>('ninguna');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title || '');
      setDate(editEvent.date || '');
      setTime(editEvent.time || '09:00');
      setDescription(editEvent.description || '');
      setParticipantIds(editEvent.participantIds || []);
      setRecurrence(editEvent.recurrence || 'ninguna');
    } else {
      setTitle('');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setDescription('');
      setParticipantIds([currentUserId]); // Default to creator being participant
      setRecurrence('ninguna');
    }
    setErrorMsg('');
  }, [editEvent, isOpen, currentUserId, defaultDate]);

  if (!isOpen) return null;

  const handleToggleParticipant = (userId: string) => {
    setParticipantIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor especifica un título para el evento.');
      return;
    }
    if (!date) {
      setErrorMsg('Por favor selecciona una fecha válida.');
      return;
    }
    if (!time) {
      setErrorMsg('Por favor indica una hora de encuentro.');
      return;
    }

    onSave({
      id: editEvent?.id,
      title: title.trim(),
      date,
      time,
      description: description.trim(),
      participantIds,
      creatorId: editEvent ? editEvent.creatorId : currentUserId,
      recurrence,
    });
    onClose();
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
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
            <span>{editEvent ? 'Editar Evento de Calendario' : 'Agendar Nuevo Evento'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nombre de Evento / Asunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Sincronización de Sprint Semanal..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              maxLength={80}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Descripción del propósito
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Orden del día, enlace de llamada o preparaciones previas..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none"
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Meet Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fecha programada
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Meet Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hora de inicio
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Recurrence Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ¿Es un evento recurrente? (Repetir automáticamente)
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-750 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ninguna">No se repite (Hito único)</option>
              <option value="diaria">Repetir diariamente</option>
              <option value="semanal">Repetir semanalmente (Mismo día de la semana)</option>
              <option value="mensual">Repetir mensualmente (Mismo día del mes)</option>
            </select>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium leading-relaxed">
              Los eventos recurrentes aparecerán automáticamente en el calendario para todas las fechas futuras que cumplan con la condición.
            </span>
          </div>

          {/* Participantes checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Participantes convocados</span>
            </label>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 max-h-[160px] overflow-y-auto">
              {users.map((item) => {
                const isSelected = participantIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center justify-between cursor-pointer group/user py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Avatar Circle */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: item.color }}
                      >
                        {getInitials(item.name)}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover/user:text-slate-900 dark:group-hover/user:text-slate-100 transition-colors">
                        {item.name} {item.id === currentUserId && <span className="text-[10px] text-slate-400">(Tú)</span>}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleParticipant(item.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">
              Puedes seleccionar múltiples participantes del tablero para convocarlos automáticamente.
            </span>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-transform hover:-translate-y-0.5 shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            {editEvent ? 'Guardar Cambios' : 'Agendar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
