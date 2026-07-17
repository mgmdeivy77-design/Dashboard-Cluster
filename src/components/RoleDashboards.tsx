import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart3, Clock, CheckCircle2, AlertTriangle, Search, 
  ArrowUpRight, Heart, Sparkles, Send, Shield, Activity, Award, X,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { User, Task } from '../types';
import { PastoralInbox } from './PastoralInbox';

// ==================== CO-LAB STATS RESOLUTION ====================
interface CollabStats {
  totalT: number;
  compT: number;
  progT: number;
  pendT: number;
  pct: number;
  highT: number;
  userTasks: Task[];
}

interface CommonProps {
  users: User[];
  tasks: Task[];
  currentUserId: string;
  supervisedUsers: User[];
  getCollabStats: (userId: string) => CollabStats;
  selectedCollabId: string;
  setSelectedCollabId: (id: string) => void;
  getInitials: (name: string) => string;
}

// ==================== CDI DETAIL MODAL FOR FACILITATOR ====================
interface CdiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cdiNum: string;
  pastor: User;
  members: User[];
  getCollabStats: (userId: string) => CollabStats;
  setSelectedCollabId: (id: string) => void;
  getInitials: (name: string) => string;
}

export function CdiDetailModal({
  isOpen,
  onClose,
  cdiNum,
  pastor,
  members,
  getCollabStats,
  setSelectedCollabId,
  getInitials
}: CdiDetailModalProps) {
  if (!isOpen) return null;

  // Sort members to have Pastor first, Director (supervisor) second, and Assistants (user) third
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'pastor') return -1;
    if (b.role === 'pastor') return 1;
    if (a.role === 'supervisor') return -1;
    if (b.role === 'supervisor') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50/55 dark:bg-slate-950/20">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>Desglose de Desempeño: CDI-{cdiNum}</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">
              Representado por {pastor?.name || 'Pastor'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Desempeño detallado de cada integrante del equipo CDI-{cdiNum} (Pastor, Director y sus 3 colaboradores locales). Haz clic en <strong className="text-indigo-650 dark:text-indigo-400">"Inspeccionar Tareas"</strong> para cerrar esta ventana y visualizar el listado de tareas específicas del colaborador en el panel inferior.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedMembers.map(member => {
              const stats = getCollabStats(member.id);
              let badgeStyle = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-100 dark:border-red-900/30';
              let label = 'Prioritario';
              if (stats.pct >= 80) {
                badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
                label = 'Excelente';
              } else if (stats.pct >= 50) {
                badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
                label = 'Bajo Control';
              }

              return (
                <div 
                  key={member.id}
                  className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: member.color || '#6366f1' }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{member.name}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5">
                            {member.role === 'pastor' ? '⛪ Pastor Gerente' : member.role === 'supervisor' ? '💼 Director CDI' : '👤 Asistente de CDI'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-extrabold uppercase ${badgeStyle}`}>
                        {label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          <span>Consistencia Individual</span>
                          <span>{stats.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-150 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              stats.pct >= 80 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stats.pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Summary stats */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold">
                        <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-150 dark:border-slate-800">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Completas</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{stats.compT}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-150 dark:border-slate-800">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Activas</span>
                          <span className="text-blue-600 dark:text-blue-400">{stats.progT + stats.pendT}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-150 dark:border-slate-800">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Atrasadas</span>
                          <span className={stats.highT > 0 ? 'text-red-500 font-black' : 'text-slate-500'}>{stats.highT}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedCollabId(member.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl text-[10.5px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Inspeccionar Tareas</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 1. FACILITADOR (ADMIN) DASHBOARD ====================
export function AdminDashboard({
  users,
  tasks,
  currentUserId,
  supervisedUsers,
  getCollabStats,
  selectedCollabId,
  setSelectedCollabId,
  getInitials
}: CommonProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCdi, setSelectedCdi] = useState<{ cdiNum: string; pastor: User; members: User[] } | null>(null);

  // Group users by CDI number
  const cdiGroups: Record<string, { cdiNum: string; pastor: User; members: User[] }> = {};
  
  users.forEach(u => {
    if (u.role === 'admin') return;
    const match = u.name.match(/CDI-(\d+)/);
    if (match) {
      const cdiNum = match[1];
      if (!cdiGroups[cdiNum]) {
        cdiGroups[cdiNum] = { cdiNum, pastor: null as any, members: [] };
      }
      cdiGroups[cdiNum].members.push(u);
      if (u.role === 'pastor') {
        cdiGroups[cdiNum].pastor = u;
      }
    }
  });

  const cdiList = Object.values(cdiGroups).sort((a, b) => a.cdiNum.localeCompare(b.cdiNum));

  // Filter CDIs dynamically based on search
  const filteredCdis = cdiList.filter(cdi => {
    const term = searchQuery.toLowerCase();
    if (!term) return true;
    return (
      cdi.cdiNum.includes(term) ||
      cdi.pastor?.name.toLowerCase().includes(term) ||
      cdi.members.some(m => m.name.toLowerCase().includes(term))
    );
  });

  // Calculate aggregated CDI stats based on the overall performance of the team
  const getCdiStats = (cdiMembers: User[]) => {
    const memberIds = cdiMembers.map(m => m.id);
    const cdiTasks = tasks.filter(t => memberIds.includes(t.assigneeId) || t.assigneeIds?.some(id => memberIds.includes(id)));
    const totalT = cdiTasks.length;
    const compT = cdiTasks.filter(t => t.status === 'Completada').length;
    const progT = cdiTasks.filter(t => t.status === 'En Progreso').length;
    const pendT = cdiTasks.filter(t => t.status === 'Pendiente').length;
    const pct = totalT > 0 ? Math.round((compT / totalT) * 100) : 0;
    const highT = cdiTasks.filter(t => t.priority === 'Alta' && t.status !== 'Completada').length;
    return { totalT, compT, progT, pendT, pct, highT };
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin-governance-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
            <span>Matriz de Gobernanza Nacional de Desempeño</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
            Control de consistencia y tasa de cumplimiento acumulado por centro CDI. Haz clic en un CDI para ver el desempeño individual de su Pastor, Director y Asistentes.
          </p>
        </div>

        {/* Search CDI Bar */}
        <div className="relative max-w-xs w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar CDI, Pastor o Integrante..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of CDIs represented by the Pastor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCdis.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-2 stroke-1 opacity-50" />
            <p className="text-xs font-bold">No se encontraron centros CDI bajo ese criterio</p>
          </div>
        ) : (
          filteredCdis.map(cdi => {
            const stats = getCdiStats(cdi.members);
            const isSelected = selectedCdi?.cdiNum === cdi.cdiNum;

            // Determine compliance quality color
            let badgeStyle = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-100 dark:border-red-900/30';
            let label = 'Prioritario';
            if (stats.pct >= 80) {
              badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
              label = 'Excelente';
            } else if (stats.pct >= 50) {
              badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
              label = 'Bajo Control';
            }

            return (
              <div 
                key={cdi.cdiNum}
                onClick={() => setSelectedCdi(cdi)}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4.5 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 ${
                  isSelected 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/15' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cdi.pastor?.color || '#6366f1' }}
                    >
                      {getInitials(cdi.pastor?.name || `CDI-${cdi.cdiNum}`)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">CDI-{cdi.cdiNum}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5">
                        ⛪ {cdi.pastor?.name.replace(`CDI-${cdi.cdiNum} `, '') || 'Pastor Representante'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-extrabold uppercase ${badgeStyle}`}>
                    {label}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <span>Rendimiento Global del Equipo</span>
                      <span>{stats.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.pct >= 80 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary of task statuses */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
                    <div className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-0.5">Completas</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{stats.compT}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-0.5">Activas</span>
                      <span className="text-blue-600 dark:text-blue-400">{stats.progT + stats.pendT}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-0.5">Críticas</span>
                      <span className={stats.highT > 0 ? 'text-red-500 animate-pulse' : 'text-slate-500'}>
                        {stats.highT}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RENDER DYNAMIC CDI DETAIL MODAL */}
      {selectedCdi && (
        <CdiDetailModal
          isOpen={!!selectedCdi}
          onClose={() => setSelectedCdi(null)}
          cdiNum={selectedCdi.cdiNum}
          pastor={selectedCdi.pastor}
          members={selectedCdi.members}
          getCollabStats={getCollabStats}
          setSelectedCollabId={setSelectedCollabId}
          getInitials={getInitials}
        />
      )}
    </div>
  );
}

// ==================== 2. PASTOR DASHBOARD ====================
export function PastorDashboard({
  users,
  tasks,
  currentUserId,
  supervisedUsers,
  getCollabStats,
  selectedCollabId,
  setSelectedCollabId,
  getInitials
}: CommonProps) {
  const [targetMessageUser, setTargetMessageUser] = useState(supervisedUsers[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  const [pastoralMessages, setPastoralMessages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('compas_pastoral_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAllPastoral, setShowAllPastoral] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('compas_pastoral_messages');
        if (saved) {
          setPastoralMessages(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('compas_pastoral_messages_updated', handleUpdate);
    return () => window.removeEventListener('compas_pastoral_messages_updated', handleUpdate);
  }, []);

  // Group collaborators dynamically for Semáforo Pastoral
  const excellent = [];
  const monitoring = [];
  const critical = [];

  for (const user of supervisedUsers) {
    const stats = getCollabStats(user.id);
    if (stats.pct >= 80) {
      excellent.push({ user, stats });
    } else if (stats.pct >= 50) {
      monitoring.push({ user, stats });
    } else {
      critical.push({ user, stats });
    }
  }

  const handleSendMessage = () => {
    if (!messageText.trim() || !targetMessageUser) return;
    const recipient = users.find(u => u.id === targetMessageUser);
    if (!recipient) return;

    const pastorUser = users.find(u => u.id === currentUserId);
    const pastorColor = pastorUser?.color || '#ec4899';

    // 1. Save actual pastoral message to dedicated local storage
    try {
      const msgSaved = localStorage.getItem('compas_pastoral_messages');
      const msgs = msgSaved ? JSON.parse(msgSaved) : [];
      const newMsg = {
        id: `pastoral-msg-${Date.now()}`,
        senderId: currentUserId,
        senderName: pastorUser?.name || 'Pastor CDI',
        senderColor: pastorColor,
        receiverId: recipient.id,
        text: messageText,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      const updatedMsgs = [newMsg, ...msgs];
      localStorage.setItem('compas_pastoral_messages', JSON.stringify(updatedMsgs));
      setPastoralMessages(updatedMsgs);
      
      // Dispatch custom window event so other components know storage changed
      window.dispatchEvent(new Event('compas_pastoral_messages_updated'));
    } catch (e) {
      console.error('Error saving pastoral message:', e);
    }

    // 2. Log message into compas_activities for local synchronization
    try {
      const saved = localStorage.getItem('compas_activities');
      const acts = saved ? JSON.parse(saved) : [];
      const newAct = {
        id: `act-pastoral-${Date.now()}`,
        userId: currentUserId,
        userName: pastorUser?.name || 'Pastor CDI',
        userColor: pastorColor,
        action: 'despachó aliento pastoral de salud ministerial para',
        targetType: 'user',
        targetName: recipient.name,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('compas_activities', JSON.stringify([newAct, ...acts]));
      
      // Dispatch event to refresh activities list in real-time if open
      window.dispatchEvent(new Event('compas_activities_updated'));
    } catch (e) {
      console.error(e);
    }

    setFeedbackSent(recipient.name);
    setMessageText('');
    setTimeout(() => {
      setFeedbackSent(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="pastor-care-dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SEMÁFORO DE SALUD MINISTERIAL */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
              <span>Semáforo Pastoral de Salud & Acompañamiento</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Clasificación predictiva de colaboradores según su tasa de consistencia. Úsalo para priorizar tu consejería.
            </p>
          </div>

          <div className="space-y-3">
            {/* 1. CRITICAL */}
            <div className="bg-rose-50/40 dark:bg-red-950/10 border border-rose-100 dark:border-red-900/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h4 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider">Acompañamiento Prioritario ({critical.length})</h4>
              </div>
              {critical.length === 0 ? (
                <p className="text-[10.5px] text-slate-400 font-medium italic pl-4">¡Gloria a Dios! Ningún colaborador en alerta crítica.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  {critical.map(({ user, stats }) => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedCollabId(user.id)}
                      className={`flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs cursor-pointer ${
                        selectedCollabId === user.id ? 'border-red-500 ring-1 ring-red-400' : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                      <span className="font-black text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-lg border border-red-100 dark:border-red-900/30">{stats.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. MONITORING */}
            <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Apoyo Sugerido / En Observación ({monitoring.length})</h4>
              </div>
              {monitoring.length === 0 ? (
                <p className="text-[10.5px] text-slate-400 font-medium italic pl-4">No hay colaboradores en estado intermedio.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  {monitoring.map(({ user, stats }) => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedCollabId(user.id)}
                      className={`flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs cursor-pointer ${
                        selectedCollabId === user.id ? 'border-amber-500 ring-1 ring-amber-400' : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                      <span className="font-black text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900/30">{stats.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. EXCELLENT */}
            <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Consistencia Excelente ({excellent.length})</h4>
              </div>
              {excellent.length === 0 ? (
                <p className="text-[10.5px] text-slate-400 font-medium italic pl-4">Sin colaboradores reportando rendimiento sobresaliente.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  {excellent.map(({ user, stats }) => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedCollabId(user.id)}
                      className={`flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs cursor-pointer ${
                        selectedCollabId === user.id ? 'border-emerald-500 ring-1 ring-emerald-400' : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                      <span className="font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">{stats.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BUZÓN DE ALIENTO PASTORAL */}
        <div className="bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Buzón de Consejería</h4>
            </div>
            <h3 className="text-sm font-black text-slate-850 dark:text-white mb-2">Enviar Aliento o Instrucción</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
              Elige un colaborador con baja eficiencia para despachar palabras de soporte emocional, consejo ministerial o instrucciones directas.
            </p>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Destinatario</label>
                <select
                  value={targetMessageUser}
                  onChange={(e) => setTargetMessageUser(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  {supervisedUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({getCollabStats(u.id).pct}% Eficiencia)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Mensaje Ministerial</label>
                <textarea
                  value={messageText}
                  placeholder="Escribe palabras de aliento o pautas de balance de vida/ministerio..."
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-350 focus:outline-hidden resize-none h-24 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                messageText.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
              }`}
            >
              <span>Enviar Aliento Pastoral</span>
              <Send className="w-3.5 h-3.5" />
            </button>

            {feedbackSent && (
              <p className="text-[10px] text-center text-emerald-600 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 p-2 border border-emerald-100/50 dark:border-emerald-900/20 rounded-lg mt-3">
                ✨ ¡Aliento pastoral enviado exitosamente a <strong>{feedbackSent}</strong>!
              </p>
            )}
          </div>
        </div>

      </div>

      {/* HISTORIAL DE MENSAJES ENVIADOS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>⛪ Bitácora de Aliento Pastoral & Consejería</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Mensajes de soporte ministerial, emocional y directrices pastorales enviados.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
            {pastoralMessages.length} Enviados
          </span>
        </div>

        {pastoralMessages.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-750 mb-2 stroke-1" />
            <p className="text-xs font-semibold">No se han registrado envíos</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Escribe un mensaje de consejería pastoral arriba para iniciar el acompañamiento espiritual.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* MENSAJE MÁS RECIENTE DIRECTO */}
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-500 block mb-2.5">
                📣 Último Mensaje Enviado (Más Reciente)
              </span>
              {(() => {
                const msg = pastoralMessages[0];
                const recipient = users.find(u => u.id === msg.receiverId);
                const date = new Date(msg.timestamp);
                const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const formattedDate = date.toLocaleDateString([], { day: 'numeric', month: 'short' });

                return (
                  <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/10 dark:bg-indigo-950/5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Para: {recipient?.name || 'Colaborador'}
                        </span>
                        <span className="px-1.5 py-0.5 bg-indigo-100/60 dark:bg-indigo-900/40 rounded text-[9px] text-indigo-700 dark:text-indigo-300 font-extrabold uppercase">
                          {recipient?.role === 'supervisor' ? 'Director' : 'Asistente'}
                        </span>
                        {msg.isRead ? (
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Leído
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded text-[9px] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> No leído
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-750 dark:text-slate-250 bg-white dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/50 whitespace-pre-line leading-relaxed font-medium italic shadow-2xs">
                        "{msg.text}"
                      </p>
                      {msg.replyText && (
                        <div className="mt-2.5 pl-3 border-l-2 border-indigo-400 space-y-1">
                          <p className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider flex items-center gap-1">
                            <span>💬 Respuesta del colaborador:</span>
                          </p>
                          <p className="text-xs text-slate-650 dark:text-slate-300 font-semibold bg-indigo-50/30 dark:bg-indigo-950/15 p-2 rounded-lg border border-indigo-100/10 dark:border-indigo-900/10">
                            {msg.replyText}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 text-[10px] text-slate-400 font-semibold uppercase tracking-wider self-end sm:self-start">
                      <span>{formattedDate} • {formattedTime}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* BOTÓN HISTORIAL / EXPANDIR */}
            {pastoralMessages.length > 1 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAllPastoral(!showAllPastoral)}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850/60 dark:hover:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Historial de envíos anteriores ({pastoralMessages.length - 1} mensajes)
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold">
                    {showAllPastoral ? (
                      <>
                        Ocultar <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Ver todos <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>

                {/* MENSAJES ANTERIORES COLAPSABLES */}
                {showAllPastoral && (
                  <div className="mt-3.5 space-y-3.5 max-h-[350px] overflow-y-auto pr-1 border-l-2 border-slate-100 dark:border-slate-850 pl-3 animate-fade-in">
                    {pastoralMessages.slice(1).map((msg) => {
                      const recipient = users.find(u => u.id === msg.receiverId);
                      const date = new Date(msg.timestamp);
                      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const formattedDate = date.toLocaleDateString([], { day: 'numeric', month: 'short' });

                      return (
                        <div 
                          key={msg.id}
                          className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/60 bg-slate-50/20 dark:bg-slate-950/10 hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center flex-wrap gap-2 text-[11px]">
                              <span className="font-bold text-slate-750 dark:text-slate-300">
                                Para: {recipient?.name || 'Colaborador'}
                              </span>
                              <span className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[8.5px] text-slate-500 font-extrabold uppercase">
                                {recipient?.role === 'supervisor' ? 'Director' : 'Asistente'}
                              </span>
                              {msg.isRead ? (
                                <span className="px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded text-[8.5px] font-extrabold">
                                  Leído
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded text-[8.5px] font-extrabold animate-pulse">
                                  No leído
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-900/30 whitespace-pre-line italic leading-relaxed">
                              "{msg.text}"
                            </p>
                            {msg.replyText && (
                              <div className="pl-2.5 border-l border-indigo-300 space-y-0.5">
                                <span className="text-[9.5px] font-extrabold uppercase text-indigo-400 block">Respuesta:</span>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {msg.replyText}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0 text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider self-end sm:self-start">
                            <span>{formattedDate} • {formattedTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// ==================== 3. DIRECTOR DASHBOARD ====================
export function DirectorDashboard({
  users,
  tasks,
  currentUserId,
  supervisedUsers,
  getCollabStats,
  selectedCollabId,
  setSelectedCollabId,
  getInitials
}: CommonProps) {
  
  // Detect Bottlenecks (Collaborators with more than 3 incomplete tasks)
  const bottlenecks = supervisedUsers
    .map(u => ({ user: u, stats: getCollabStats(u.id) }))
    .filter(item => item.stats.totalT - item.stats.compT > 3);

  return (
    <div className="space-y-6 animate-fade-in" id="director-tactical-dashboard">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
          <span>Matriz Táctica y Control de Operaciones Locales</span>
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Dashboard interactivo para asignar, agilizar y resolver cuellos de botella de tu equipo de colaboradoras y autogestionar tus prioridades de trabajo.
        </p>
      </div>

      {/* Bento Grid: Local Collaborators & Director Cards (Supports up to 4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {supervisedUsers.map(user => {
          const stats = getCollabStats(user.id);
          const isSelected = selectedCollabId === user.id;
          const isMe = user.id === currentUserId;

          return (
            <div
              key={user.id}
              onClick={() => setSelectedCollabId(user.id)}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4.5 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px] ${
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-500/15' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750'
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: user.color || '#3b82f6' }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {isMe ? `${user.name} (Tú)` : user.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                      {isMe ? '💼 Director CDI' : '👤 Asistente de CDI'}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-slate-850 dark:text-white">{stats.pct}%</span>
                  <span className="text-[9.5px] uppercase font-bold text-slate-400">Eficiencia</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[11px] font-extrabold">
                <span className="text-slate-400">
                  {stats.compT} de {stats.totalT} Completas
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[9.5px] uppercase ${
                  stats.highT > 0 
                    ? 'bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400 animate-pulse' 
                    : 'bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400'
                }`}>
                  {stats.highT > 0 ? `⚠️ ${stats.highT} Alertas` : 'Estable'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CUELLOS DE BOTELLA / CONGESTIÓN TÁCTICA */}
      {bottlenecks.length > 0 && (
        <div className="bg-red-50/30 dark:bg-red-950/5 border border-red-200/50 dark:border-red-900/30 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-red-800 dark:text-red-350 uppercase tracking-wider">Embudo de Bloqueos / Congestión Detectada</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Las siguientes colaboradoras acumulan más de 3 tareas sin completar. Sugerimos redistribuir tareas o brindar soporte directo:
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {bottlenecks.map(item => (
                <span 
                  key={item.user.id} 
                  onClick={() => setSelectedCollabId(item.user.id)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-xl text-[11px] font-bold text-red-700 dark:text-red-350 cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors flex items-center gap-1.5"
                >
                  <strong>{item.user.name}</strong> ({item.stats.totalT - item.stats.compT} pendientes)
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BUZÓN DE CONSEJERÍA PASTORAL */}
      <div className="mt-6">
        <PastoralInbox currentUserId={currentUserId} users={users} />
      </div>
    </div>
  );
}
