import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Clock, 
  Plus, 
  Lock, 
  Unlock,
  Shield, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  X, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Info,
  UserCheck,
  Eye,
  Settings,
  HelpCircle,
  Pencil,
  Trash2
} from 'lucide-react';

interface InternalChatProps {
  currentUser: User;
  users: User[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'usr-admin',
    senderName: 'Facilitador',
    senderRole: 'admin',
    senderColor: '#4f46e5',
    text: '¡Bienvenidos al Chat General de Directores! Este canal es exclusivo para la comunicación estratégica entre los CDI y la administración.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    receiverId: 'chat-general'
  },
  {
    id: 'msg-2',
    senderId: 'usr-1-pastor',
    senderName: 'CDI-128 (Pastor)',
    senderRole: 'pastor',
    senderColor: '#ec4899',
    text: 'Estimados directores, recuerden que cada centro CDI tiene su propio "Chat de Equipo" totalmente privado para coordinar directamente con sus colaboradores.',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    receiverId: 'chat-general'
  },
  {
    id: 'msg-3',
    senderId: 'usr-1',
    senderName: 'CDI-128 (Director)',
    senderRole: 'supervisor',
    senderColor: '#ec4899',
    text: 'Excelente. Así mantendremos las directrices de cada centro con total privacidad y organización.',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    receiverId: 'chat-general'
  },
  // CDI-128 Team Chat messages
  {
    id: 'msg-team-1',
    senderId: 'usr-1',
    senderName: 'CDI-128 (Director)',
    senderRole: 'supervisor',
    senderColor: '#ec4899',
    text: '¡Hola equipo CDI-128! Este es nuestro Chat de Equipo exclusivo. Aquí coordinaremos las metas y actividades diarias de manera segura.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    receiverId: 'team-usr-1'
  },
  {
    id: 'msg-team-2',
    senderId: 'usr-1-colab-1',
    senderName: 'CDI-128 (Asist Adm)',
    senderRole: 'user',
    senderColor: '#ec4899',
    text: '¡Buen día Director! Ya tengo listos los reportes para revisar hoy en la tarde.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    receiverId: 'team-usr-1'
  },
  {
    id: 'msg-team-3',
    senderId: 'usr-1-colab-2',
    senderName: 'CDI-128 (Asist Pat)',
    senderRole: 'user',
    senderColor: '#ec4899',
    text: 'Recibido, yo me encargo de actualizar la agenda de eventos.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    receiverId: 'team-usr-1'
  }
];

export function InternalChat({ currentUser, users }: InternalChatProps) {
  // Resolve team parameters
  const getTeamSupervisorId = (u: User): string | null => {
    if (u.role === 'admin' || u.role === 'pastor') {
      return null;
    }
    if (u.role === 'supervisor') {
      return u.id;
    }
    return u.supervisorId || null;
  };

  const teamSupervisorId = getTeamSupervisorId(currentUser);

  // States
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('compas_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  // Responsive mobile view state: 'list' (shows channels) or 'chat' (shows conversation)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Message modifications state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Default active thread: Chat General for Directors/Admins, Chat Equipo for Collaborators
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    if (currentUser.role === 'supervisor' || currentUser.role === 'admin') {
      return 'chat-general';
    } else {
      return teamSupervisorId ? `team-${teamSupervisorId}` : 'select-contact';
    }
  });

  // Admin/Supervisor General team supervision state
  const [adminSelectedTeamSupervisorId, setAdminSelectedTeamSupervisorId] = useState<string>('usr-1');

  const [newMessage, setNewMessage] = useState('');
  const [searchContactQuery, setSearchContactQuery] = useState('');
  const [showNewChatPanel, setShowNewChatPanel] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Message action handlers
  const handleDeleteMessage = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const msgTime = new Date(msg.timestamp).getTime();
    const now = new Date().getTime();
    if (msg.senderId !== currentUser.id) return;
    if ((now - msgTime) >= 60 * 1000) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const handleSaveEditMessage = (msgId: string) => {
    if (!editingText.trim()) return;
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const msgTime = new Date(msg.timestamp).getTime();
    const now = new Date().getTime();
    if (msg.senderId !== currentUser.id) return;
    if ((now - msgTime) >= 60 * 1000) {
      setEditingMessageId(null);
      setEditingText('');
      return;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, text: editingText.trim(), edited: true } : m
      )
    );
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleClearChat = () => {
    if (window.confirm('¿Está seguro de que desea limpiar toda la conversación de esta sala? Esta acción no se puede deshacer.')) {
      setMessages((prev) => {
        if (activeThreadId === 'chat-general') {
          return prev.filter((m) => m.receiverId !== 'chat-general' && m.receiverId !== 'general');
        }
        if (activeThreadId.startsWith('team-')) {
          return prev.filter((m) => m.receiverId !== activeThreadId);
        }
        // 1-to-1 Private
        return prev.filter((m) => getMessageThreadId(m) !== activeThreadId);
      });
    }
  };

  // Save messages to LocalStorage
  useEffect(() => {
    localStorage.setItem('compas_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on thread switch or new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeThreadId, adminSelectedTeamSupervisorId]);

  // Helper: compute threadId for any message
  const getMessageThreadId = (msg: ChatMessage): string => {
    if (msg.receiverId === 'chat-general' || msg.receiverId === 'general') {
      return 'chat-general';
    }
    if (msg.receiverId && msg.receiverId.startsWith('team-')) {
      return msg.receiverId;
    }
    if (msg.receiverId) {
      return [msg.senderId, msg.receiverId].sort().join(',');
    }
    if (msg.receiverIds && msg.receiverIds.length === 1) {
      return [msg.senderId, msg.receiverIds[0]].sort().join(',');
    }
    const participants = new Set<string>();
    participants.add(msg.senderId);
    if (msg.receiverIds) {
      msg.receiverIds.forEach(id => participants.add(id));
    }
    return Array.from(participants).sort().join(',');
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

  const getRoleLabel = (role?: 'admin' | 'supervisor' | 'user' | 'pastor', userId?: string) => {
    if (role === 'admin') return '🛡️ Facilitador';
    if (role === 'pastor') return '⛪ Pastor Gerente';
    if (role === 'supervisor') return '🔑 Director CDI';
    return '👤 Colaborador';
  };

  // Resolve users inside the team
  const getMyTeamMembers = (): User[] => {
    const supervisorId = teamSupervisorId;
    if (!supervisorId) return [];
    return users.filter(u => u.id === supervisorId || u.supervisorId === supervisorId);
  };

  const teamMembers = getMyTeamMembers();

  // Allowed contacts for 1-to-1 chats based on security levels:
  // - Directors: Can chat with other Directors, their own 3 collaborators, and Admins.
  // - Collaborators: Can chat with their own Director, their peer collaborators, and Admins. (No access to other CDI teams or other Directors)
  // - Admins/Supervisor General: Can chat with anyone.
  const getAllowedContacts = (): User[] => {
    if (currentUser.role === 'admin' || currentUser.role === 'pastor') {
      return users.filter(u => u.id !== currentUser.id);
    }
    if (currentUser.role === 'supervisor') {
      // Directors can talk with admins, pastors, other supervisors, and their direct team
      return users.filter(u => 
        u.id !== currentUser.id && 
        (u.role === 'admin' || u.role === 'pastor' || u.role === 'supervisor' || u.supervisorId === currentUser.id)
      );
    }
    // Collaborators can talk with admins, pastors, their supervisor, and team peers
    return users.filter(u => 
      u.id !== currentUser.id && 
      (u.role === 'admin' || u.role === 'pastor' || u.id === currentUser.supervisorId || (u.supervisorId && u.supervisorId === currentUser.supervisorId))
    );
  };

  const allowedContacts = getAllowedContacts();

  // Find active 1-to-1 chats
  const getActivePrivateChats = () => {
    const activeThreadsMap = new Map<string, { contact: User; lastMessage?: ChatMessage }>();

    messages.forEach(msg => {
      const threadId = getMessageThreadId(msg);
      if (threadId !== 'chat-general' && !threadId.startsWith('team-')) {
        const participants = threadId.split(',');
        if (participants.includes(currentUser.id)) {
          const otherId = participants.find(id => id !== currentUser.id);
          if (otherId) {
            const contact = users.find(u => u.id === otherId);
            if (contact) {
              const currentData = activeThreadsMap.get(threadId);
              if (!currentData || new Date(msg.timestamp) > new Date(currentData.lastMessage?.timestamp || 0)) {
                activeThreadsMap.set(threadId, { contact, lastMessage: msg });
              }
            }
          }
        }
      }
    });

    return Array.from(activeThreadsMap.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
  };

  const activePrivateChats = getActivePrivateChats();

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let receiverId: string | undefined = undefined;
    let receiverIds: string[] | undefined = undefined;

    if (activeThreadId === 'chat-general') {
      receiverId = 'chat-general';
    } else if (activeThreadId.startsWith('team-')) {
      receiverId = activeThreadId; // e.g. team-usr-1
    } else {
      // 1-to-1 Private Chat
      const participants = activeThreadId.split(',');
      const otherId = participants.find(id => id !== currentUser.id);
      receiverId = otherId;
      receiverIds = [otherId || ''];
    }

    const msg: ChatMessage = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role || 'user',
      senderColor: currentUser.color || '#4f46e5',
      receiverId,
      receiverIds,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  // Filter messages for active channel
  const getFilteredMessages = (): ChatMessage[] => {
    if (activeThreadId === 'chat-general') {
      return messages.filter(m => m.receiverId === 'chat-general' || m.receiverId === 'general');
    }
    if (activeThreadId.startsWith('team-')) {
      return messages.filter(m => m.receiverId === activeThreadId);
    }
    // 1-to-1 Private
    return messages.filter(m => getMessageThreadId(m) === activeThreadId);
  };

  const currentChatMessages = getFilteredMessages();

  // Resolve current active thread metadata
  const getActiveThreadMetadata = () => {
    if (activeThreadId === 'chat-general') {
      return {
        name: '📢 Chat General (Directores CDI)',
        description: 'Exclusivo para la comunicación de CDI Directores y la Administración.',
        isPrivate: true,
        icon: Users,
        badge: 'CDI - Directores',
        allowedNotice: 'Solo Directores y Facilitadores pueden leer o enviar mensajes en esta sala.'
      };
    }
    if (activeThreadId.startsWith('team-')) {
      const supervisorId = activeThreadId.replace('team-', '');
      const supervisorUser = users.find(u => u.id === supervisorId);
      const centerName = supervisorUser ? supervisorUser.name.split(' ')[0] : 'CDI';
      const isMyOwnTeam = supervisorId === teamSupervisorId;

      return {
        name: `👥 Chat Equipo - ${centerName}`,
        description: `Exclusivo para el Director de ${centerName} y sus colaboradores asignados.`,
        isPrivate: true,
        icon: Shield,
        badge: isMyOwnTeam ? 'Mi Equipo' : 'Supervisión',
        allowedNotice: 'Privado y hermético. Ningún otro centro tiene acceso a este canal.'
      };
    }

    // 1-to-1 chat
    const participants = activeThreadId.split(',');
    const otherId = participants.find(id => id !== currentUser.id);
    const otherUser = users.find(u => u.id === otherId);

    return {
      name: `🔒 Privado: ${otherUser?.name || 'Contacto'}`,
      description: `Mensajes cifrados de doble vía con ${otherUser?.name || 'usuario'}.`,
      isPrivate: true,
      icon: Lock,
      badge: 'Doble Vía',
      allowedNotice: 'Este chat es estrictamente confidencial. Solo tú y este destinatario pueden ver la conversación.'
    };
  };

  const activeThreadMeta = getActiveThreadMetadata();

  // Search filtered contacts
  const filteredContacts = allowedContacts.filter(c => 
    c.name.toLowerCase().includes(searchContactQuery.toLowerCase())
  );

  // Group contacts for neat organization
  const getGroupedContacts = () => {
    const admins = filteredContacts.filter(c => c.role === 'admin');
    const pastors = filteredContacts.filter(c => c.role === 'pastor');
    const directors = filteredContacts.filter(c => c.role === 'supervisor');
    const collaborators = filteredContacts.filter(c => c.role === 'user');
    return { admins, pastors, directors, collaborators };
  };

  const groupedContacts = getGroupedContacts();

  // Is general chat allowed for currentUser?
  const isGeneralChatAllowed = currentUser.role === 'supervisor' || currentUser.role === 'admin' || currentUser.role === 'pastor';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-4 min-h-[500px] md:min-h-[620px] h-[75vh] max-h-[800px] animate-fade-in">
      
      {/* ==================== SIDEBAR ==================== */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50/50 dark:bg-slate-950/20 md:col-span-1 h-full overflow-hidden`}>
        
        {/* Header de Salas */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-blue-500" />
                <span>Salas de Chat</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Adaptación y Privacidad CDI</p>
            </div>
            <button
              onClick={() => setShowNewChatPanel(true)}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
              title="Iniciar nuevo chat privado"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listado de Canales y Chats */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* SECCIÓN 1: CANALES PREDETERMINADOS */}
          <div className="space-y-1">
            <span className="px-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              📌 Canales del Portal
            </span>

            {/* Chat General (Solo Directores y Facilitadores) */}
            {isGeneralChatAllowed ? (
              <button
                onClick={() => {
                  setActiveThreadId('chat-general');
                  setShowNewChatPanel(false);
                  setMobileView('chat');
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  activeThreadId === 'chat-general' && !showNewChatPanel
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                  activeThreadId === 'chat-general' && !showNewChatPanel
                    ? 'bg-white/20' 
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                }`}>
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold truncate">📢 Chat General</p>
                    <span className="text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded-md font-bold">
                      Directores
                    </span>
                  </div>
                  <p className={`text-[9px] truncate ${activeThreadId === 'chat-general' && !showNewChatPanel ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                    CDI Directores y Administración
                  </p>
                </div>
              </button>
            ) : (
              <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Chat General exclusivo de Directores</span>
              </div>
            )}

            {/* Chat Equipo (Adaptable) */}
            {teamSupervisorId ? (
              <button
                onClick={() => {
                  setActiveThreadId(`team-${teamSupervisorId}`);
                  setShowNewChatPanel(false);
                  setMobileView('chat');
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer mt-1 ${
                  activeThreadId === `team-${teamSupervisorId}` && !showNewChatPanel
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                  activeThreadId === `team-${teamSupervisorId}` && !showNewChatPanel
                    ? 'bg-white/20' 
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold truncate">👥 Chat Equipo</p>
                    <span className="text-[8px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1 py-0.2 rounded-md font-bold">
                      Exclusivo
                    </span>
                  </div>
                  <p className={`text-[9px] truncate ${activeThreadId === `team-${teamSupervisorId}` && !showNewChatPanel ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                    Director y 3 colaboradores
                  </p>
                </div>
              </button>
            ) : null}
          </div>

          {/* SECCIÓN 2: SUPERVISIÓN DE EQUIPOS (Solo para Admin y Supervisor General) */}
          {(currentUser.role === 'admin' || currentUser.role === 'pastor') && (
            <div className="space-y-1.5 pt-2.5 border-t border-slate-200/55 dark:border-slate-800/40">
              <span className="px-2 text-[9px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1.5 flex items-center gap-1">
                <Eye className="w-3 h-3 text-teal-500" />
                <span>Supervisión de Equipos CDI</span>
              </span>

              <div className="px-2 pb-1.5">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mb-1">
                  Seleccionar Centro CDI:
                </label>
                <select
                  value={adminSelectedTeamSupervisorId}
                  onChange={(e) => {
                    const dirId = e.target.value;
                    setAdminSelectedTeamSupervisorId(dirId);
                    setActiveThreadId(`team-${dirId}`);
                    setShowNewChatPanel(false);
                  }}
                  className="w-full text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg p-1 text-slate-700 dark:text-slate-200 focus:outline-hidden"
                >
                  {users
                    .filter(u => u.role === 'supervisor')
                    .filter(u => {
                      if (currentUser.role === 'pastor') {
                        const getCdiNum = (n: string) => n.match(/CDI-(\d+)/)?.[1] || '';
                        return getCdiNum(u.name) === getCdiNum(currentUser.name);
                      }
                      return true;
                    })
                    .map(dir => (
                      <option key={dir.id} value={dir.id}>
                        {dir.name.replace(' (Director)', '')}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setActiveThreadId(`team-${adminSelectedTeamSupervisorId}`);
                  setShowNewChatPanel(false);
                  setMobileView('chat');
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                  activeThreadId === `team-${adminSelectedTeamSupervisorId}` && !showNewChatPanel
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  activeThreadId === `team-${adminSelectedTeamSupervisorId}` && !showNewChatPanel ? 'bg-white/20' : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold truncate">Ver Chat Equipo seleccionado</p>
                </div>
              </button>
            </div>
          )}

          {/* SECCIÓN 3: CHATS PARTICULARES ACTIVOS */}
          <div className="space-y-1 pt-2.5 border-t border-slate-200/55 dark:border-slate-800/40">
            <span className="px-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              💬 Chats Particulares (Confidencial)
            </span>

            {activePrivateChats.length > 0 ? (
              activePrivateChats.map(chat => {
                const isSelected = activeThreadId === chat.id && !showNewChatPanel;
                return (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveThreadId(chat.id);
                      setShowNewChatPanel(false);
                      setMobileView('chat');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 shadow-inner"
                      style={{ backgroundColor: chat.contact.color }}
                    >
                      {getInitials(chat.contact.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold truncate">{chat.contact.name}</p>
                      </div>
                      <p className={`text-[9px] truncate ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                        {chat.lastMessage ? chat.lastMessage.text : 'Conversación de doble vía'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-3 text-center rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] text-slate-400 italic">No hay chats particulares activos</p>
                <button
                  onClick={() => setShowNewChatPanel(true)}
                  className="text-[9px] text-blue-500 font-extrabold mt-1 hover:underline cursor-pointer"
                >
                  + Iniciar un chat privado
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Info del usuario actual */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 border border-slate-200 dark:border-slate-800 shadow-sm"
              style={{ backgroundColor: currentUser.color }}
            >
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-850 dark:text-slate-100 truncate">{currentUser.name}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {getRoleLabel(currentUser.role, currentUser.id)}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== MAIN CHAT WINDOW ==================== */}
      <div className={`${mobileView === 'chat' || showNewChatPanel ? 'flex' : 'hidden'} md:flex md:col-span-3 flex-col bg-white dark:bg-slate-900 h-full overflow-hidden justify-between`}>
        
        {showNewChatPanel ? (
          
          /* PANEL: INICIAR CHAT PRIVADO EXCLUSIVO (Componer) */
          <div className="flex-1 flex flex-col h-full overflow-hidden p-6 bg-slate-50/10 dark:bg-slate-950/5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-blue-500" />
                  <span>Componer Conversación Privada o Exclusiva</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Selecciona un contacto para iniciar un canal blindado de doble vía. Ningún otro usuario podrá ver tus mensajes.
                </p>
              </div>
              <button
                onClick={() => setShowNewChatPanel(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Búsqueda de Contacto */}
            <div className="my-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar contacto en tu círculo permitido..."
                  value={searchContactQuery}
                  onChange={(e) => setSearchContactQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-850 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Lista de Contactos por Categoría */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* Facilitadores / Supervisores Generales */}
              {groupedContacts.admins.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    🛡️ Dirección y Administración
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedContacts.admins.map(admin => (
                      <button
                        key={admin.id}
                        onClick={() => {
                          const threadId = [currentUser.id, admin.id].sort().join(',');
                          setActiveThreadId(threadId);
                          setShowNewChatPanel(false);
                          setSearchContactQuery('');
                        }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-850/50 text-left transition-all cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: admin.color }}
                        >
                          {getInitials(admin.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{admin.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{getRoleLabel(admin.role, admin.id)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pastores Gerentes */}
              {groupedContacts.pastors.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    ⛪ Pastores Gerentes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedContacts.pastors.map(pastor => (
                      <button
                        key={pastor.id}
                        onClick={() => {
                          const threadId = [currentUser.id, pastor.id].sort().join(',');
                          setActiveThreadId(threadId);
                          setShowNewChatPanel(false);
                          setSearchContactQuery('');
                        }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-450 hover:bg-slate-50 dark:hover:bg-slate-850/50 text-left transition-all cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: pastor.color }}
                        >
                          {getInitials(pastor.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{pastor.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{getRoleLabel(pastor.role, pastor.id)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Directores de otros CDI */}
              {groupedContacts.directors.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    🔑 Directores de Centros CDI
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedContacts.directors.map(dir => (
                      <button
                        key={dir.id}
                        onClick={() => {
                          const threadId = [currentUser.id, dir.id].sort().join(',');
                          setActiveThreadId(threadId);
                          setShowNewChatPanel(false);
                          setSearchContactQuery('');
                        }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-850/50 text-left transition-all cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: dir.color }}
                        >
                          {getInitials(dir.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{dir.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{getRoleLabel(dir.role, dir.id)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colaboradores de mi equipo */}
              {groupedContacts.collaborators.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Colaboradores Permitidos</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedContacts.collaborators.map(colab => (
                      <button
                        key={colab.id}
                        onClick={() => {
                          const threadId = [currentUser.id, colab.id].sort().join(',');
                          setActiveThreadId(threadId);
                          setShowNewChatPanel(false);
                          setSearchContactQuery('');
                        }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850/50 text-left transition-all cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: colab.color }}
                        >
                          {getInitials(colab.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{colab.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">Colaborador Asignado</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredContacts.length === 0 && (
                <div className="text-center py-10">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold">No se encontraron contactos en tu círculo</p>
                  <p className="text-[10px] text-slate-400 mt-1">Por razones de privacidad y exclusividad, solo puedes contactar a personas autorizadas en tu centro o jerarquía.</p>
                </div>
              )}
            </div>

            {/* Privacy notice box */}
            <div className="mt-4 p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex gap-3 text-xs text-blue-800 dark:text-blue-300 font-medium shrink-0">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="font-extrabold">🔒 Control de Privacidad de Doble Vía</p>
                <p className="text-[10px] mt-0.5 opacity-90 leading-relaxed">
                  Para proteger la información corporativa, los colaboradores solo pueden enviar mensajes a su Director o Facilitadores correspondientes. Un colaborador no puede chatear con colaboradores de otros centros CDI.
                </p>
              </div>
            </div>
          </div>
        ) : (
          
          /* VISTA NORMAL DE CONVERSACIÓN SELECCIONADA */
          <>
            {/* Header de la conversación */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-950/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-350 shrink-0 cursor-pointer"
                  title="Volver a la lista de salas"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  activeThreadId === 'chat-general'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : activeThreadId.startsWith('team-')
                    ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {React.createElement(activeThreadMeta.icon, { className: 'w-5 h-5' })}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">{activeThreadMeta.name}</span>
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0">
                      {activeThreadMeta.badge}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[180px] sm:max-w-[450px]">
                    {activeThreadMeta.description}
                  </p>
                </div>
              </div>

              {/* Security & Action controls */}
              <div className="flex items-center gap-2 shrink-0">
                {currentUser.role === 'admin' && currentChatMessages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="px-2.5 py-1.5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/60 text-red-650 dark:text-red-400 rounded-xl text-[10px] font-bold cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all uppercase tracking-wider"
                    title="Limpiar toda la conversación"
                  >
                    Limpiar Chat
                  </button>
                )}

                <div className="hidden sm:flex text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800/85 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-750 items-center gap-1.5 shrink-0">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span className="font-extrabold uppercase text-[8px] tracking-wider text-emerald-600 dark:text-emerald-400">Exclusivo</span>
                </div>
              </div>
            </div>

            {/* Bubble list stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/20 dark:bg-slate-950/5 min-h-[350px]">
              
              {/* Context Header Card on privacy rules */}
              <div className="p-3 bg-slate-100/55 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Política de Privacidad y Acceso de esta sala:</p>
                  <p className="mt-0.5 text-[9.5px] opacity-90 leading-relaxed">
                    {activeThreadMeta.allowedNotice}
                  </p>
                </div>
              </div>

              {currentChatMessages.length > 0 ? (
                currentChatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const formattedTime = new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 max-w-[85%] group ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5 shadow-sm"
                          style={{ backgroundColor: msg.senderColor }}
                          title={`${msg.senderName} (${getRoleLabel(msg.senderRole, msg.senderId)})`}
                        >
                          {getInitials(msg.senderName)}
                        </div>
                      )}

                      {/* Msg bubble body */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Name label */}
                        {!isMe && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold ml-1 mb-0.5 flex items-center gap-1">
                            {msg.senderName}
                            <span className="text-[8px] bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 rounded-sm font-bold">
                              {msg.senderRole === 'admin' ? 'Facilitador' : msg.senderRole === 'supervisor' ? 'Director' : 'Colab'}
                            </span>
                          </span>
                        )}

                        {editingMessageId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px] sm:min-w-[300px] p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-150 font-medium"
                              rows={2}
                              maxLength={1000}
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditingText('');
                                }}
                                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditMessage(msg.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-wrap break-words shadow-xs ${
                              isMe
                                ? activeThreadId === 'chat-general'
                                  ? 'bg-blue-600 text-white rounded-tr-none'
                                  : activeThreadId.startsWith('team-')
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : 'bg-slate-850 dark:bg-slate-700 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-850 text-slate-850 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/80 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                            {msg.edited && (
                              <span className="block text-[8px] opacity-65 text-right mt-1.5 italic font-bold">
                                (modificado)
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className={`text-[9px] text-slate-400 dark:text-slate-500 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                            {formattedTime}
                          </span>

                           {/* Options to Edit or Delete (Only visible to the sender if less than 1 minute has passed since message was created) */}
                          {(() => {
                            if (!isMe || editingMessageId === msg.id) return null;
                            const msgTime = new Date(msg.timestamp).getTime();
                            const now = new Date().getTime();
                            const isUnderOneMinute = (now - msgTime) < 60 * 1000;
                            if (!isUnderOneMinute) return null;
                            return (
                              <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex items-center gap-1.5 ml-2 bg-slate-100/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-md border border-slate-200/30 dark:border-slate-700/40">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingText(msg.text);
                                  }}
                                  className="text-[10px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-0.5 cursor-pointer"
                                  title="Editar mensaje"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                  <span className="hidden xs:inline">Editar</span>
                                </button>
                                <span className="text-slate-300 dark:text-slate-700 text-[9px]">|</span>
                                <button
                                  onClick={() => {
                                    if (window.confirm('¿Está seguro de que desea eliminar este mensaje de forma permanente?')) {
                                      handleDeleteMessage(msg.id);
                                    }
                                  }}
                                  className="text-[10px] text-red-500 hover:text-red-650 font-bold flex items-center gap-0.5 cursor-pointer"
                                  title="Eliminar mensaje"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  <span className="hidden xs:inline">Borrar</span>
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400/80 py-20">
                  <Lock className="w-12 h-12 text-slate-300 dark:text-slate-700 stroke-1 mb-2.5" />
                  <p className="text-xs font-bold">No hay mensajes en esta conversación</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Escribe el primer mensaje para coordinar de manera segura y privada.</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form Input area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  activeThreadId === 'chat-general' 
                    ? 'Escribe un mensaje en el Chat General (solo Directores/Admin)...' 
                    : activeThreadId.startsWith('team-')
                    ? 'Escribe un mensaje en el Chat de Equipo...'
                    : 'Escribe un mensaje privado y confidencial...'
                }
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-medium"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`p-2 rounded-xl transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center text-white ${
                  activeThreadId === 'chat-general' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : activeThreadId.startsWith('team-')
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-slate-850 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650'
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
