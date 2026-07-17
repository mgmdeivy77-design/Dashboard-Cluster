import React, { useState } from 'react';
import { Task, User } from '../types';
import { AdminDashboard, PastorDashboard, DirectorDashboard } from './RoleDashboards';
import { SmartReportWidget } from './SmartReportWidget';
import { PastoralInbox } from './PastoralInbox';
import { 
  Users, 
  User as UserIcon, 
  BarChart3, 
  Layers, 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Calendar,
  Sparkles,
  Search,
  Check,
  Activity,
  Award,
  TrendingDown,
  Heart,
  ShieldAlert,
  ArrowDownRight,
  Sparkle,
  FileText,
  Download,
  Plus,
  RefreshCw
} from 'lucide-react';

interface StatisticsChartsProps {
  tasks: Task[];
  users: User[];
  currentUserId: string;
}

export function StatisticsCharts({ tasks, users, currentUserId }: StatisticsChartsProps) {
  const currentUserObj = users.find((u) => u.id === currentUserId);
  const isSupervisorOrAdmin = currentUserObj?.role === 'admin' || currentUserObj?.role === 'supervisor' || currentUserObj?.role === 'pastor';

  // State for collaborator drill-down detail
  const [selectedCollabId, setSelectedCollabId] = useState<string>(() => {
    const supervised = users.filter(u => {
      if (currentUserObj?.role === 'admin') return u.role === 'user';
      return u.supervisorId === currentUserId;
    });
    return supervised.length > 0 ? supervised[0].id : currentUserId;
  });

  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbStatusFilter, setDbStatusFilter] = useState<'all' | 'high_perf' | 'low_perf' | 'critical'>('all');
  const [pastoralMessageUser, setPastoralMessageUser] = useState<string | null>(null);
  const [pastoralMessageText, setPastoralMessageText] = useState('');
  const [pastoralFeedbackSent, setPastoralFeedbackSent] = useState<string | null>(null);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportDirectives, setReportDirectives] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [reportFormat, setReportFormat] = useState('general');
  const [reportError, setReportError] = useState('');

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Resolve target users for supervision
  const supervisedUsers = users.filter(u => {
    if (currentUserObj?.role === 'admin') {
      return u.role === 'user' || u.role === 'supervisor' || u.role === 'pastor';
    }
    if (currentUserObj?.role === 'pastor') {
      // Pastor supervises Directors under their hierarchy (and they report to Pastor)
      // They also supervise any users whose supervisor is a Director who reports to this Pastor
      const directors = users.filter(d => d.role === 'supervisor' && d.supervisorId === currentUserId);
      const directorIds = directors.map(d => d.id);
      return u.supervisorId === currentUserId || directorIds.includes(u.supervisorId || '') || u.id === currentUserId;
    }
    return u.supervisorId === currentUserId || u.id === currentUserId;
  });

  // Calculate statistics for a single collaborator
  const getCollabStats = (userId: string) => {
    const userTasks = tasks.filter(t => t.assigneeId === userId || t.assigneeIds?.includes(userId));
    const totalT = userTasks.length;
    const compT = userTasks.filter(t => t.status === 'Completada').length;
    const progT = userTasks.filter(t => t.status === 'En Progreso').length;
    const pendT = userTasks.filter(t => t.status === 'Pendiente').length;
    const pct = totalT > 0 ? Math.round((compT / totalT) * 100) : 0;
    const highT = userTasks.filter(t => t.priority === 'Alta' && t.status !== 'Completada').length;
    return { totalT, compT, progT, pendT, pct, highT, userTasks };
  };

  // Collective team computations
  const collectiveTasks = tasks.filter(t => {
    // If Admin/Facilitador, monitor all standard task completions
    if (currentUserObj?.role === 'admin') {
      return users.some(u => (u.role === 'user' || u.role === 'supervisor' || u.role === 'pastor') && (t.assigneeId === u.id || t.assigneeIds?.includes(u.id)));
    }
    // If CDI Director, monitor tasks assigned to their specific 3-collaborator team
    return supervisedUsers.some(u => t.assigneeId === u.id || t.assigneeIds?.includes(u.id));
  });

  const teamTotal = collectiveTasks.length;
  const teamCompleted = collectiveTasks.filter(t => t.status === 'Completada').length;
  const teamInProgress = collectiveTasks.filter(t => t.status === 'En Progreso').length;
  const teamPending = collectiveTasks.filter(t => t.status === 'Pendiente').length;
  const teamSuccessRate = teamTotal > 0 ? Math.round((teamCompleted / teamTotal) * 100) : 0;
  const teamHighPriorityAlerts = collectiveTasks.filter(t => t.priority === 'Alta' && t.status !== 'Completada').length;

  // Render Supervisor Dashboard
  if (isSupervisorOrAdmin) {
    const selectedCollabObj = users.find(u => u.id === selectedCollabId) || currentUserObj;
    const selectedCollabStats = getCollabStats(selectedCollabId);

    // Stroke calculations for selected collaborator
    const r = 50;
    const circ = 2 * Math.PI * r;
    const pctPending = selectedCollabStats.totalT > 0 ? selectedCollabStats.pendT / selectedCollabStats.totalT : 0;
    const pctInProgress = selectedCollabStats.totalT > 0 ? selectedCollabStats.progT / selectedCollabStats.totalT : 0;
    const pctCompleted = selectedCollabStats.totalT > 0 ? selectedCollabStats.compT / selectedCollabStats.totalT : 0;

    const strokePending = circ * pctPending;
    const strokeInProgress = circ * pctInProgress;
    const strokeCompleted = circ * pctCompleted;

    const offsetCompleted = 0;
    const offsetInProgress = strokeCompleted;
    const offsetPending = strokeCompleted + strokeInProgress;

    // Categories
    const categoryCounts: Record<string, number> = {};
    selectedCollabStats.userTasks.forEach((t) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return (
      <div className="space-y-8 animate-fade-in" id="supervisor-dashboard">
        {/* TOP WELCOME/SUMMARY BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
            <div className="space-y-1.5">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-300 inline-flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Panel de Supervisión Profesional</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Estadísticas de Control CDI
              </h2>
              <p className="text-xs text-slate-300 max-w-xl font-medium">
                Monitorea el desempeño en tiempo real de tus colaboradores de doble vía, detecta cuellos de botella y supervisa el cumplimiento de metas asignadas.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Éxito</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{teamSuccessRate}%</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tareas Colectivas</p>
                <p className="text-2xl font-extrabold text-white mt-0.5">{teamTotal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Colaboradores</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{supervisedUsers.length} CDIs</h4>
              <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium">Equipo de Doble Vía</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">En Progreso / Pendientes</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{teamInProgress + teamPending}</h4>
              <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium">{teamInProgress} activas, {teamPending} por iniciar</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Completadas</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{teamCompleted} tareas</h4>
              <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium">{teamSuccessRate}% de eficiencia acumulada</p>
            </div>
          </div>

          <div className={`border rounded-2xl p-4 shadow-xs flex items-center gap-4 transition-all ${
            teamHighPriorityAlerts > 0 
              ? 'bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-900/60 text-red-900 dark:text-red-200' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              teamHighPriorityAlerts > 0 ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-850 text-slate-500'
            }`}>
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Alertas Críticas</p>
              <h4 className="text-lg font-black mt-0.5">{teamHighPriorityAlerts} Pendientes</h4>
              <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium">Tareas de alta prioridad sin completar</p>
            </div>
          </div>
        </div>

        {/* DYNAMIC ROLE DASHBOARD ("MATRIZ DE DESEMPEÑO DEL EQUIPO") */}
        {currentUserObj?.role === 'admin' && (
          <AdminDashboard
            users={users}
            tasks={tasks}
            currentUserId={currentUserId}
            supervisedUsers={supervisedUsers}
            getCollabStats={getCollabStats}
            selectedCollabId={selectedCollabId}
            setSelectedCollabId={setSelectedCollabId}
            getInitials={getInitials}
          />
        )}
        {currentUserObj?.role === 'pastor' && (
          <PastorDashboard
            users={users}
            tasks={tasks}
            currentUserId={currentUserId}
            supervisedUsers={supervisedUsers}
            getCollabStats={getCollabStats}
            selectedCollabId={selectedCollabId}
            setSelectedCollabId={setSelectedCollabId}
            getInitials={getInitials}
          />
        )}
        {currentUserObj?.role === 'supervisor' && (
          <DirectorDashboard
            users={users}
            tasks={tasks}
            currentUserId={currentUserId}
            supervisedUsers={supervisedUsers}
            getCollabStats={getCollabStats}
            selectedCollabId={selectedCollabId}
            setSelectedCollabId={setSelectedCollabId}
            getInitials={getInitials}
          />
        )}

        {/* DETAILED DRILL-DOWN INSPECTION SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* CHARTS CARD: PIE CHART FOR SPECIFIC COLLAB */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between lg:col-span-1">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: selectedCollabObj.color }}
                >
                  {getInitials(selectedCollabObj.name)}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Inspección de Estado</h4>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white truncate">{selectedCollabObj.name}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                Distribución de tareas del colaborador por estado actual.
              </p>
            </div>

            {selectedCollabStats.totalT === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <Clock className="w-10 h-10 mb-2 stroke-current opacity-40" />
                <p className="text-xs font-bold">Sin tareas asignadas</p>
                <p className="text-[10px] text-center mt-1">Este colaborador no tiene tareas cargadas en las listas de trabajo.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 flex-1 py-4 justify-center">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="rgba(226, 232, 240, 0.4)"
                      strokeWidth="10"
                    />
                    {strokeCompleted > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={r}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${strokeCompleted} ${circ}`}
                        strokeDashoffset={-offsetCompleted}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    )}
                    {strokeInProgress > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={r}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray={`${strokeInProgress} ${circ}`}
                        strokeDashoffset={-offsetInProgress}
                        strokeLinecap={strokeCompleted === 0 ? 'round' : 'butt'}
                        className="transition-all duration-500 ease-out"
                      />
                    )}
                    {strokePending > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={r}
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="10"
                        strokeDasharray={`${strokePending} ${circ}`}
                        strokeDashoffset={-offsetPending}
                        strokeLinecap={strokeCompleted === 0 && strokeInProgress === 0 ? 'round' : 'butt'}
                        className="transition-all duration-500 ease-out"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-850 dark:text-white">
                      {selectedCollabStats.pct}%
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                      Completado
                    </span>
                  </div>
                </div>

                {/* Labels and values */}
                <div className="grid grid-cols-3 gap-2 w-full text-center">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-extrabold uppercase text-emerald-500 block">Completadas</span>
                    <span className="text-sm font-black text-slate-850 dark:text-slate-100">{selectedCollabStats.compT}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-extrabold uppercase text-blue-500 block">En Proceso</span>
                    <span className="text-sm font-black text-slate-850 dark:text-slate-100">{selectedCollabStats.progT}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-extrabold uppercase text-amber-500 block">Pendientes</span>
                    <span className="text-sm font-black text-slate-850 dark:text-slate-100">{selectedCollabStats.pendT}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PRIORITY & IMPACT CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between lg:col-span-1">
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Prioridades y Categorías</h4>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white mb-2">Críticas de {selectedCollabObj.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                Visualiza qué tan críticas son las tareas asignadas a este colaborador.
              </p>
            </div>

            {selectedCollabStats.totalT === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <AlertTriangle className="w-10 h-10 mb-2 stroke-current opacity-40" />
                <p className="text-xs font-bold">Sin datos críticos</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {/* Priority Bars */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-red-500">Prioridad Alta</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedCollabStats.userTasks.filter(t => t.priority === 'Alta').length} tareas</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(selectedCollabStats.userTasks.filter(t => t.priority === 'Alta').length / selectedCollabStats.totalT) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-amber-500">Prioridad Media</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedCollabStats.userTasks.filter(t => t.priority === 'Media').length} tareas</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(selectedCollabStats.userTasks.filter(t => t.priority === 'Media').length / selectedCollabStats.totalT) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-500">Prioridad Baja</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedCollabStats.userTasks.filter(t => t.priority === 'Baja').length} tareas</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(selectedCollabStats.userTasks.filter(t => t.priority === 'Baja').length / selectedCollabStats.totalT) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Categorias */}
                {sortedCategories.length > 0 && (
                  <div className="pt-3 border-t border-slate-150 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                      Frecuencia de Trabajo
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sortedCategories.map(([cat, count]) => (
                        <span 
                          key={cat}
                          className="px-2 py-0.8 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-350"
                        >
                          {cat} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVE TASKS OVERVIEW: REVEALS BARRIERS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between lg:col-span-1">
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Control de Bloqueos</h4>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white mb-2">Tareas de {selectedCollabObj.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                Listado de tareas críticas o pendientes para realizar seguimiento.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1">
              {selectedCollabStats.userTasks.filter(t => t.status !== 'Completada').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/70" />
                  <p className="text-xs font-bold">¡Todo al día!</p>
                  <p className="text-[9px] text-slate-400 text-center">No hay tareas pendientes para este colaborador.</p>
                </div>
              ) : (
                selectedCollabStats.userTasks
                  .filter(t => t.status !== 'Completada')
                  .slice(0, 5)
                  .map(task => {
                    const isHigh = task.priority === 'Alta';
                    return (
                      <div 
                        key={task.id} 
                        className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                            isHigh 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' 
                              : task.priority === 'Media'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-150 line-clamp-1">{task.title}</p>
                        <p className="text-[9.5px] text-slate-400 dark:text-slate-500 truncate">{task.description}</p>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* AI SMART REPORT WIDGET */}
        <SmartReportWidget
          currentUser={currentUserObj}
          stats={{
            total: teamTotal,
            completed: teamCompleted,
            inProgress: teamInProgress,
            pending: teamPending,
            successRate: teamSuccessRate,
            highPriority: teamHighPriorityAlerts
          }}
        />
      </div>
    );
  }

  // Render Collaborator Dashboard (Standard task completion view)
  const stats = getCollabStats(currentUserId);
  const r = 50;
  const circ = 2 * Math.PI * r;
  const pctPending = stats.totalT > 0 ? stats.pendT / stats.totalT : 0;
  const pctInProgress = stats.totalT > 0 ? stats.progT / stats.totalT : 0;
  const pctCompleted = stats.totalT > 0 ? stats.compT / stats.totalT : 0;

  const strokePending = circ * pctPending;
  const strokeInProgress = circ * pctInProgress;
  const strokeCompleted = circ * pctCompleted;

  const offsetCompleted = 0;
  const offsetInProgress = strokeCompleted;
  const offsetPending = strokeCompleted + strokeInProgress;

  const categoryCounts: Record<string, number> = {};
  stats.userTasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in" id="collaborator-dashboard">
      {/* FILTER PANEL FOR INDIVIDUAL VS GRUPAL */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Mi Rendimiento
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Visualiza tus estadísticas de cumplimiento personal
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-xs shrink-0"
            style={{ backgroundColor: currentUserObj?.color }}
          >
            {getInitials(currentUserObj?.name)}
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{currentUserObj?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DONUT CHART: ESTADO DE TAREAS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Tareas por Estado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribución proporcional del progreso de tus tareas asignadas
            </p>
          </div>

          {stats.totalT === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <Clock className="w-12 h-12 mb-2 stroke-current opacity-60" />
              <p className="text-sm font-bold">Sin tareas activas</p>
              <p className="text-[10px] text-slate-400">No tienes tareas asignadas en tu portal de doble vía.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 flex-1 py-4">
              {/* SVG Donut */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="transparent"
                    stroke="rgba(226, 232, 240, 0.4)"
                    strokeWidth="12"
                  />
                  {strokeCompleted > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={`${strokeCompleted} ${circ}`}
                      strokeDashoffset={-offsetCompleted}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  )}
                  {strokeInProgress > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="12"
                      strokeDasharray={`${strokeInProgress} ${circ}`}
                      strokeDashoffset={-offsetInProgress}
                      strokeLinecap={strokeCompleted === 0 ? 'round' : 'butt'}
                      className="transition-all duration-500 ease-out"
                    />
                  )}
                  {strokePending > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#f59e0b"
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
                    {stats.pct}%
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
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Completadas</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-150">
                      {stats.compT} <span className="text-[11px] font-normal text-slate-400">({Math.round(pctCompleted * 100)}%)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">En Progreso</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-150">
                      {stats.progT} <span className="text-[11px] font-normal text-slate-400">({Math.round(pctInProgress * 100)}%)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pendientes</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-150">
                      {stats.pendT} <span className="text-[11px] font-normal text-slate-400">({Math.round(pctPending * 100)}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* METRICS LEVEL 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-1">
              Prioridades y Enfoque de Tarea
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Distribución de tus prioridades en el plan asignado
            </p>
          </div>

          {stats.totalT === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <AlertTriangle className="w-12 h-12 mb-2 stroke-current opacity-60" />
              <p className="text-sm font-bold">Sin datos de prioridad</p>
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-red-600 dark:text-red-400 font-bold">Alta</span>
                  <span className="text-slate-700 dark:text-slate-300">{stats.userTasks.filter(t => t.priority === 'Alta').length} de {stats.totalT}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stats.userTasks.filter(t => t.priority === 'Alta').length / stats.totalT) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Media</span>
                  <span className="text-slate-700 dark:text-slate-300">{stats.userTasks.filter(t => t.priority === 'Media').length} de {stats.totalT}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stats.userTasks.filter(t => t.priority === 'Media').length / stats.totalT) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Baja</span>
                  <span className="text-slate-700 dark:text-slate-300">{stats.userTasks.filter(t => t.priority === 'Baja').length} de {stats.totalT}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stats.userTasks.filter(t => t.priority === 'Baja').length / stats.totalT) * 100}%` }}
                  />
                </div>
              </div>

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

      {/* AI SMART REPORT WIDGET */}
      <SmartReportWidget
        currentUser={currentUserObj}
        stats={{
          total: stats.totalT,
          completed: stats.compT,
          inProgress: stats.progT,
          pending: stats.pendT,
          successRate: stats.pct,
          highPriority: stats.highT
        }}
      />

      {/* BUZÓN DE CONSEJERÍA PASTORAL */}
      <PastoralInbox
        currentUserId={currentUserObj?.id || ''}
        users={users}
      />
    </div>
  );
}
