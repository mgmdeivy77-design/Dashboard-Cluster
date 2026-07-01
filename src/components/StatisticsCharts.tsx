import React, { useState } from 'react';
import { Task, User } from '../types';
import { Users, User as UserIcon, BarChart3, Layers } from 'lucide-react';

interface StatisticsChartsProps {
  tasks: Task[];
  users: User[];
  currentUserId: string;
}

export function StatisticsCharts({ tasks, users, currentUserId }: StatisticsChartsProps) {
  const [filterType, setFilterType] = useState<'grupal' | 'individual'>('grupal');
  const [selectedUser, setSelectedUser] = useState<string>(currentUserId);

  // Filter tasks based on selected metric mode
  const filteredTasks = tasks.filter((task) => {
    if (filterType === 'grupal') {
      return true;
    } else {
      // Check if user is either primary assignee or is in mass assigneeIds
      return task.assigneeId === selectedUser || task.assigneeIds?.includes(selectedUser);
    }
  });

  const total = filteredTasks.length;
  const pending = filteredTasks.filter((t) => t.status === 'Pendiente').length;
  const inProgress = filteredTasks.filter((t) => t.status === 'En Progreso').length;
  const completed = filteredTasks.filter((t) => t.status === 'Completada').length;

  // Priority counts
  const highPriority = filteredTasks.filter((t) => t.priority === 'Alta').length;
  const mediumPriority = filteredTasks.filter((t) => t.priority === 'Media').length;
  const lowPriority = filteredTasks.filter((t) => t.priority === 'Baja').length;

  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Stroke calculations for the SVG Doughnut
  const r = 50;
  const circ = 2 * Math.PI * r;

  const pctPending = total > 0 ? pending / total : 0;
  const pctInProgress = total > 0 ? inProgress / total : 0;
  const pctCompleted = total > 0 ? completed / total : 0;

  const strokePending = circ * pctPending;
  const strokeInProgress = circ * pctInProgress;
  const strokeCompleted = circ * pctCompleted;

  const offsetCompleted = 0;
  const offsetInProgress = strokeCompleted;
  const offsetPending = strokeCompleted + strokeInProgress;

  // Most active categories
  const categoryCounts: Record<string, number> = {};
  filteredTasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const selectedUserInfo = users.find((u) => u.id === selectedUser);

  return (
    <div className="space-y-6">
      {/* FILTER PANEL FOR INDIVIDUAL VS GRUPAL */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Filtro de Estadísticas & Métricas
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Conmutar vistas entre rendimiento colectivo o de un colaborador específico
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Type Buttons */}
          <div className="flex bg-slate-200/60 dark:bg-slate-950 p-1 rounded-xl border border-slate-300/40 dark:border-slate-800">
            <button
              onClick={() => setFilterType('grupal')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'grupal'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Grupal</span>
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'individual'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Individual</span>
            </button>
          </div>

          {/* User selector for Individual mode */}
          {filterType === 'individual' && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800">
              {selectedUserInfo && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: selectedUserInfo.color }}
                >
                  {getInitials(selectedUserInfo.name)}
                </div>
              )}
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {users.map((usr) => (
                  <option key={usr.id} value={usr.id} className="dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    {usr.name} {usr.role === 'admin' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DONUT CHART: ESTADO DE TAREAS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Tareas por Estado ({filterType === 'grupal' ? 'Todo el Equipo' : selectedUserInfo?.name})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribución proporcional del progreso actual
            </p>
          </div>

          {total === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <svg
                className="w-12 h-12 mb-2 stroke-current opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              <p className="text-sm font-bold">Sin tareas en este filtro</p>
              <p className="text-[10px] text-slate-400">Este usuario no tiene tareas asignadas o correspondientes en estas listas.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 flex-1 py-4">
              {/* SVG Donut */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="transparent"
                    stroke="rgba(226, 232, 240, 0.4)"
                    strokeWidth="12"
                  />

                  {/* Completed (Green) segment */}
                  {strokeCompleted > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#10b981" // emerald-500
                      strokeWidth="12"
                      strokeDasharray={`${strokeCompleted} ${circ}`}
                      strokeDashoffset={-offsetCompleted}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  )}

                  {/* In Progress (Blue) segment */}
                  {strokeInProgress > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#3b82f6" // blue-500
                      strokeWidth="12"
                      strokeDasharray={`${strokeInProgress} ${circ}`}
                      strokeDashoffset={-offsetInProgress}
                      strokeLinecap={strokeCompleted === 0 ? 'round' : 'butt'}
                      className="transition-all duration-500 ease-out"
                    />
                  )}

                  {/* Pending (Amber) segment */}
                  {strokePending > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#f59e0b" // amber-500
                      strokeWidth="12"
                      strokeDasharray={`${strokePending} ${circ}`}
                      strokeDashoffset={-offsetPending}
                      strokeLinecap={strokeCompleted === 0 && strokeInProgress === 0 ? 'round' : 'butt'}
                      className="transition-all duration-500 ease-out"
                    />
                  )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-850 dark:text-white">
                    {completedPercentage}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Completado
                  </span>
                </div>
              </div>

              {/* Labels and values */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Completadas
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-150">
                      {completed} <span className="text-[11px] font-normal text-slate-400">({Math.round(pctCompleted * 100)}%)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      En Progreso
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-150">
                      {inProgress} <span className="text-[11px] font-normal text-slate-400">({Math.round(pctInProgress * 100)}%)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pendientes
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-150">
                      {pending} <span className="text-[11px] font-normal text-slate-400">({Math.round(pctPending * 100)}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* METRICAS DE PRIORIDAD Y CATEGORIAS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-1">
              Prioridad e Impacto ({filterType === 'grupal' ? 'Todo el Equipo' : selectedUserInfo?.name})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Distribución de tareas críticas vs operativas
            </p>
          </div>

          {total === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <svg
                className="w-12 h-12 mb-2 stroke-current opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-bold">Sin datos para mostrar</p>
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {/* Priority bars */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-red-600 dark:text-red-400">Alta</span>
                  <span className="text-slate-700 dark:text-slate-300">{highPriority} de {total}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (highPriority / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-600 dark:text-amber-400">Media</span>
                  <span className="text-slate-700 dark:text-slate-300">{mediumPriority} de {total}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (mediumPriority / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">Baja</span>
                  <span className="text-slate-700 dark:text-slate-300">{lowPriority} de {total}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (lowPriority / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Top Categories Pill meters */}
              {sortedCategories.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Categorías Principales
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sortedCategories.map(([cat, count]) => (
                      <div
                        key={cat}
                        className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>{cat}</span>
                        <span className="font-bold text-slate-400 dark:text-slate-500">[{count}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
