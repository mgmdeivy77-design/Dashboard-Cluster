import React, { useState } from 'react';
import { Event, User } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Plus, Edit2, Trash2, Tag, Info, Repeat } from 'lucide-react';

interface EventCalendarProps {
  events: Event[];
  users: User[];
  currentUserId: string;
  onAddEvent: (dateStr: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

const MONTHS_SPANISH = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_SHORT_SPANISH = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function EventCalendar({ events, users, currentUserId, onAddEvent, onEditEvent, onDeleteEvent }: EventCalendarProps) {
  // Let's anchor on current Date
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Total days in current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Preceding month details
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);

  // JS Day for the 1st of currentYear & currentMonth
  // Sunday is 0, Monday is 1, etc.
  const firstDayIndexRaw = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const firstDayIndex = (firstDayIndexRaw + 6) % 7;

  // Render arrays
  const daysArray: number[] = [];
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    daysArray.push(i);
  }

  // Preceding month filler days
  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex);
  const prevMonthFillerDays: number[] = [];
  for (let i = daysInPrevMonth - firstDayIndex + 1; i <= daysInPrevMonth; i++) {
    if (firstDayIndex > 0) {
      prevMonthFillerDays.push(i);
    }
  }

  // Next month filler days: we want a total Grid of 35 or 42 cells (6 rows * 7 days = 42)
  const totalCellsWritten = prevMonthFillerDays.length + daysArray.length;
  const remainingCells = totalCellsWritten > 35 ? 42 - totalCellsWritten : 35 - totalCellsWritten;
  const nextMonthFillerDays: number[] = [];
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthFillerDays.push(i);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Convert Day Number into YYYY-MM-DD
  const formatDateString = (year: number, month: number, dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Get events on a target date (including recurrence mapping)
  const getEventsForDate = (dateString: string) => {
    return events.filter((e) => {
      if (e.date === dateString) return true;
      if (!e.recurrence || e.recurrence === 'ninguna') return false;
      if (dateString < e.date) return false;

      try {
        const eventD = new Date(e.date + 'T00:00:00');
        const targetD = new Date(dateString + 'T00:00:00');

        if (e.recurrence === 'diaria') {
          return true;
        }
        if (e.recurrence === 'semanal') {
          return eventD.getDay() === targetD.getDay();
        }
        if (e.recurrence === 'mensual') {
          return eventD.getDate() === targetD.getDate();
        }
      } catch (err) {
        return false;
      }
      return false;
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDateStr);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CALENDAR BODY */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        {/* Navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {MONTHS_SPANISH[currentMonth]} <span className="text-slate-400 font-normal">{currentYear}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week titles */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
          {DAYS_SHORT_SPANISH.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid cells */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[320px]">
          {/* Previous month filler */}
          {prevMonthFillerDays.map((dayNum, idx) => {
            const thisDateString = formatDateString(prevYear, prevMonthIndex, dayNum);
            const relativeEvents = getEventsForDate(thisDateString);

            return (
              <div
                key={`prev-${idx}`}
                onClick={() => setSelectedDateStr(thisDateString)}
                className={`group border border-slate-50 dark:border-transparent opacity-35 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg p-1.5 min-h-[50px] flex flex-col justify-between cursor-pointer hover:opacity-75 transition-all ${
                  selectedDateStr === thisDateString ? 'ring-2 ring-blue-500/50' : ''
                }`}
              >
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-600 block text-right">
                  {dayNum}
                </span>
                <div className="flex gap-1 justify-end flex-wrap">
                  {relativeEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Current month days */}
          {daysArray.map((dayNum) => {
            const thisDateString = formatDateString(currentYear, currentMonth, dayNum);
            const relativeEvents = getEventsForDate(thisDateString);
            const isToday =
              today.getDate() === dayNum &&
              today.getMonth() === currentMonth &&
              today.getFullYear() === currentYear;

            const isSelected = selectedDateStr === thisDateString;

            return (
              <div
                key={`day-${dayNum}`}
                id={`calendar-day-${thisDateString}`}
                onClick={() => setSelectedDateStr(thisDateString)}
                className={`group border rounded-xl p-1.5 min-h-[60px] flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 ring-2 ring-blue-500/30'
                    : isToday
                    ? 'border-slate-350 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  {relativeEvents.length > 0 && (
                    <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                      {relativeEvents.length}
                    </span>
                  )}
                  <span
                    className={`text-xs ml-auto font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isSelected
                        ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* mini event tiles */}
                <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                  {relativeEvents.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className="text-[10px] bg-slate-100 dark:bg-slate-805 text-slate-700 dark:text-slate-300 px-1 py-0.5 rounded truncate font-medium border-l-2 border-blue-500"
                    >
                      {e.title}
                    </div>
                  ))}
                  {relativeEvents.length > 2 && (
                    <span className="text-[8px] text-slate-400 font-semibold self-end">
                      +{relativeEvents.length - 2} más
                    </span>
                  )}
                </div>

                {/* Small indicator dots for mobile view */}
                <div className="sm:hidden flex gap-0.5 justify-center mt-1">
                  {relativeEvents.map((e) => (
                    <span key={e.id} className="w-1 h-1 rounded-full bg-blue-500" />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Next month filler */}
          {nextMonthFillerDays.map((dayNum, idx) => {
            const nextMonthRealIndex = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYearReal = currentMonth === 11 ? currentYear + 1 : currentYear;
            const thisDateString = formatDateString(nextYearReal, nextMonthRealIndex, dayNum);
            const relativeEvents = getEventsForDate(thisDateString);

            return (
              <div
                key={`next-${idx}`}
                onClick={() => setSelectedDateStr(thisDateString)}
                className={`group border border-slate-50 dark:border-transparent opacity-35 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg p-1.5 min-h-[50px] flex flex-col justify-between cursor-pointer hover:opacity-75 transition-all ${
                  selectedDateStr === thisDateString ? 'ring-2 ring-blue-500/50' : ''
                }`}
              >
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-600 block text-right">
                  {dayNum}
                </span>
                <div className="flex gap-1 justify-end flex-wrap">
                  {relativeEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EVENT DETAILED LIST FOR SELECTED DAY */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Eventos del Día
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 font-semibold">
                {selectedDateStr}
              </p>
            </div>
            <button
              onClick={() => onAddEvent(selectedDateStr)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-transform hover:-translate-y-0.5 cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <Info className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-350 dark:text-slate-600" />
              <p className="text-sm">No hay eventos agendados para este día.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Haz clic en el botón Nuevo para programar uno.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {selectedDateEvents.map((event) => {
                const eventCreator = users.find((u) => u.id === event.creatorId);

                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-xl shadow-xs border-l-4 border-l-blue-500 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-100 flex flex-col gap-1 items-start">
                        <span>{event.title}</span>
                        {event.recurrence && event.recurrence !== 'ninguna' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-55 dark:text-indigo-300 dark:bg-indigo-950/40 border border-indigo-200/40 rounded-sm uppercase tracking-widest mt-0.5">
                            <Repeat className="w-2.5 h-2.5 shrink-0" />
                            <span>Recurrente ({event.recurrence})</span>
                          </span>
                        )}
                      </h5>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                      {event.description || 'Sin explicación.'}
                    </p>

                    <div className="flex flex-col gap-1.5 text-[11px] text-slate-450 dark:text-slate-500 mt-2 border-t border-slate-50 dark:border-slate-900/50 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-550 shrink-0" />
                        <span>Hora: <strong className="text-slate-700 dark:text-slate-350">{event.time} hs</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-550 shrink-0" />
                        <span className="truncate">
                          Participantes:{' '}
                          <span className="font-semibold text-slate-700 dark:text-slate-350">
                            {event.participantIds.length === 0
                              ? 'Ninguno'
                              : event.participantIds
                                  .map((pid) => users.find((u) => u.id === pid)?.name || '')
                                  .filter(Boolean)
                                  .join(', ')}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-slate-50/50 dark:border-slate-900/30">
                        <span className="text-[10px] text-slate-400">
                          Organizado por:{' '}
                          <strong className="text-slate-500 dark:text-slate-300 font-semibold text-[10px]">
                            {eventCreator?.name || 'Sist.'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic quote or notice footer */}
        <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 block leading-relaxed font-medium">
          Selecciona cualquier fecha en el calendario interactivo de la izquierda para desplegar, editar o registrar nuevos hitos compartidos.
        </div>
      </div>
    </div>
  );
}
