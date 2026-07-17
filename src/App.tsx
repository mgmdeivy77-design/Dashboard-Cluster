import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Users, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Info,
  LogOut,
  Lock,
  Key,
  Sparkles,
  Settings,
  MessageSquare,
  ArrowLeft,
  Check,
  UserPlus,
  UserCheck,
  Eye,
  EyeOff,
  Heart,
  Shield
} from 'lucide-react';

// Custom types
import { User, Task, Event, AppNotification, TaskStatus, Priority, Activity, getAssignmentType, Comment, ChatMessage } from './types';

// Mock initial data
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_EVENTS } from './data';

// Custom Components
import { TaskCard } from './components/TaskCard';
import { StatisticsCharts } from './components/StatisticsCharts';
import { EventCalendar } from './components/EventCalendar';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { EventModal } from './components/EventModal';
import { UserManager } from './components/UserManager';
import { AIAssistant } from './components/AIAssistant';
import { InternalChat } from './components/InternalChat';

export default function App() {
  // --- STATE PERSISTENCE CLIENT-SIDE
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('compas_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If the saved list has old names (e.g., Ana Gómez), doesn't have CDI-128 (Director), or is missing the administrator, reset to INITIAL_USERS
        const hasOldNames = parsed.some((u: any) => u.name === 'Ana Gómez' || u.name === 'Carlos Ruíz');
        const hasNewNames = parsed.some((u: any) => u.name.startsWith('CDI-'));
        const hasDirectors = parsed.some((u: any) => u.name.includes('(Director)'));
        const hasAdmin = parsed.some((u: any) => u.role === 'admin' || u.id === 'usr-admin');
        const hasSupervisor = parsed.some((u: any) => u.role === 'supervisor');
        if (hasOldNames || !hasNewNames || !hasDirectors || !hasAdmin || !hasSupervisor) {
          localStorage.removeItem('compas_users');
          localStorage.removeItem('compas_current_user_id');
          localStorage.removeItem('compas_tasks');
          localStorage.removeItem('compas_events');
          return INITIAL_USERS;
        }
        return parsed;
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('compas_tasks');
    if (!localStorage.getItem('compas_users')) {
      return INITIAL_TASKS;
    }
    if (saved) {
      try {
        const parsed: Task[] = JSON.parse(saved);
        const sampleIds = ['tsk-1', 'tsk-2', 'tsk-3', 'tsk-4', 'tsk-5', 'tsk-6', 'tsk-7', 'tsk-8', 'tsk-9'];
        return parsed.filter((t) => !sampleIds.includes(t.id));
      } catch (e) {
        return INITIAL_TASKS;
      }
    }
    return INITIAL_TASKS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('compas_events');
    if (!localStorage.getItem('compas_users')) {
      return INITIAL_EVENTS;
    }
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('compas_current_user_id');
    if (!localStorage.getItem('compas_users')) {
      return INITIAL_USERS[0]?.id || '';
    }
    return saved || (INITIAL_USERS[0]?.id || '');
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('compas_dark_mode');
    return saved === 'true';
  });

  // --- GENERAL APP FLOW STATES
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tareas' | 'eventos' | 'control' | 'asistente' | 'chat'>('dashboard');
  const [tabHistory, setTabHistory] = useState<('dashboard' | 'tareas' | 'eventos' | 'control' | 'asistente' | 'chat')[]>(['dashboard']);

  const navigateToTab = (newTab: 'dashboard' | 'tareas' | 'eventos' | 'control' | 'asistente' | 'chat') => {
    if (activeTab === newTab) return;
    setTabHistory((prev) => [...prev, newTab]);
    setActiveTab(newTab);
  };

  const navigateBack = () => {
    if (tabHistory.length <= 1) return;
    const newHistory = [...tabHistory];
    newHistory.pop(); // remove current tab
    const prevTab = newHistory[newHistory.length - 1] || 'dashboard';
    setTabHistory(newHistory);
    setActiveTab(prevTab);
  };

  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('compas_activities');
    return saved ? JSON.parse(saved) : [];
  });
  
  // --- TARES VIEWS AND FILTERS
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list' | 'matrix'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // --- MODALS STATES
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [initialTaskDate, setInitialTaskDate] = useState<string | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | undefined>(undefined);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | undefined>(undefined);
  const [defaultEventDate, setDefaultEventDate] = useState<string | undefined>(undefined);

  // --- ACCESS PROTECTION STATES
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('compas_is_logged_in') === 'true';
  });
  const [loginUserId, setLoginUserId] = useState<string>('usr-admin');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Dual Authenticate/Register Screen States
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginUserName, setLoginUserName] = useState<string>(() => {
    return localStorage.getItem('compas_last_username') || '';
  });
  const [registerCdiCode, setRegisterCdiCode] = useState<string>('');
  const [registerRoleTemplate, setRegisterRoleTemplate] = useState<string>('(Asist Adm)');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string>('');
  const [hasRegistered, setHasRegistered] = useState<boolean>(() => {
    return localStorage.getItem('compas_has_registered') === 'true';
  });
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);

  // Hidden file input ref for JSON imports
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DYNAMICALLY RESOLVE ACTIVE USER
  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  // --- SAVE LATEST APP STATE TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('compas_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('compas_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('compas_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    const handleActivitiesUpdated = () => {
      const saved = localStorage.getItem('compas_activities');
      if (saved) {
        setActivities(JSON.parse(saved));
      }
    };
    window.addEventListener('compas_activities_updated', handleActivitiesUpdated);
    return () => {
      window.removeEventListener('compas_activities_updated', handleActivitiesUpdated);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('compas_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('compas_current_user_id', currentUserId);
    // Security redirect for assistants and other roles on unauthorized tabs
    const isAssistant = currentUser.role === 'user';
    const allowedTabs = isAssistant 
      ? ['dashboard', 'tareas', 'chat'] 
      : ['dashboard', 'tareas', 'eventos', 'chat', 'asistente', 'control'];

    if (!allowedTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUserId, currentUser, activeTab]);

  useEffect(() => {
    localStorage.setItem('compas_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('compas_dark_mode', String(isDarkMode));
    // Apply standard Tailwind HTML classes
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- TOAST NOTIFICATIONS HELPER
  const triggerNotification = (text: string, type: AppNotification['type'] = 'success') => {
    const id = `notif-${Math.random().toString(36).substr(2, 9)}`;
    const newNotif: AppNotification = { id, text, type, timestamp: Date.now() };
    setNotifications((prev) => [newNotif, ...prev]);

    // Cleanup after 3.5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  const logActivity = (action: string, targetType: Activity['targetType'], targetName: string) => {
    const newActivity: Activity = {
      id: `act-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color || '#3b82f6',
      action,
      targetType,
      targetName,
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
  };

  // --- DATE CONSTANTS FOR OVERDUE & DYNAMIC ASSESSMENTS
  const todayStr = new Date().toISOString().split('T')[0];

  // --- SECURE / VALUE-BASED CORRESPONDING DATA SCOPES
  const visibleTasks = tasks.filter((task) => {
    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') return true;
    
    // Find creator of the task
    const creatorObj = users.find((u) => u.id === task.creatorId);
    const isCreatedByAdminOrSupervisor = creatorObj?.role === 'admin' || creatorObj?.role === 'supervisor';

    // If the task was created by another collaborator, it's completely hidden
    if (task.creatorId !== currentUser.id && !isCreatedByAdminOrSupervisor) {
      return false;
    }

    // Regular users see tasks they are assigned to, tasks they created, or group tasks (grupales)
    const isAssignee = task.assigneeId === currentUser.id || task.assigneeIds?.includes(currentUser.id);
    const isCreator = task.creatorId === currentUser.id;
    const isGroup = task.isGroupTask || task.isMassAssignment;
    
    return isCreator || isAssignee || isGroup;
  });

  const visibleEvents = events.filter((evt) => {
    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') return true;
    
    // Find creator of the event
    const creatorObj = users.find((u) => u.id === evt.creatorId);
    const isCreatedByAdminOrSupervisor = creatorObj?.role === 'admin' || creatorObj?.role === 'supervisor';

    // If the event was created by another collaborator, it's completely hidden
    if (evt.creatorId !== currentUser.id && !isCreatedByAdminOrSupervisor) {
      return false;
    }

    // Regular users see events they are involved in or created
    const isCreator = evt.creatorId === currentUser.id;
    const isParticipant = evt.participantIds?.includes(currentUser.id);
    
    return isCreator || isParticipant;
  });

  // --- DATA CALCULATIONS FOR DASHBOARD SUMMARY CARDS
  const totalTasks = visibleTasks.length;
  const completedTasks = visibleTasks.filter((t) => t.status === 'Completada').length;
  const pendingTasks = visibleTasks.filter((t) => t.status === 'Pendiente').length;
  const inProgressTasks = visibleTasks.filter((t) => t.status === 'En Progreso').length;
  const overdueTasks = visibleTasks.filter((t) => t.status !== 'Completada' && t.dueDate < todayStr).length;

  // Urgent pending tasks alerts (for dashboard): Overdue OR due within next 3 days
  const getDaysDiff = (date1Str: string, date2Str: string) => {
    const d1 = new Date(date1Str);
    const d2 = new Date(date2Str);
    const diffTime = d1.getTime() - d2.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const urgentTasks = visibleTasks
    .filter((task) => {
      if (task.status === 'Completada') return false;
      const daysLeft = getDaysDiff(task.dueDate, todayStr);
      return daysLeft <= 3; // overdue (negative/0) or due in 3 days
    })
    .sort((a, b) => b.priority === 'Alta' ? 1 : a.priority === 'Alta' ? -1 : a.dueDate.localeCompare(b.dueDate));

  // Upcoming events (look ahead 7 days)
  const upcomingEvents = visibleEvents
    .filter((evt) => {
      const daysDiff = getDaysDiff(evt.date, todayStr);
      return daysDiff >= 0 && daysDiff <= 7; // today up to next 7 days
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Extract unique categories for filter options
  const existingCategories = Array.from(new Set(visibleTasks.map((t) => t.category).filter(Boolean)));

  // --- TASKS FILTERS COMPUTING
  const filteredTasks = visibleTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee || task.assigneeIds?.includes(filterAssignee);
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesCategory;
  });

  // --- SECURITY LOGIN & REGISTRATION HANDLERS
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUserName.trim()) {
      setLoginError('Por favor, digite su nombre de usuario.');
      return;
    }
    const userToLog = users.find(
      (u) => u.name.toLowerCase().trim() === loginUserName.toLowerCase().trim()
    );
    if (!userToLog) {
      setLoginError('Usuario no encontrado. Registre su cuenta oficial en la pestaña superior si es nuevo.');
      return;
    }
    // Compare password
    const correctPassword = userToLog.password || (userToLog.role === 'admin' ? 'admin' : userToLog.role === 'supervisor' ? 'supervisor' : '123');
    if (loginPassword === correctPassword) {
      localStorage.setItem('compas_last_username', userToLog.name);
      setCurrentUserId(userToLog.id);
      setIsLoggedIn(true);
      setLoginPassword('');
      setLoginError('');
      triggerNotification(`¡Sesión iniciada correctamente como ${userToLog.name}!`);
    } else {
      setLoginError('Clave de seguridad incorrecta.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegisterSuccessMsg('');

    if (!registerCdiCode.trim()) {
      setLoginError('Por favor, introduzca el código de CDI (Ej. 128).');
      return;
    }
    if (!registerPassword.trim()) {
      setLoginError('Por favor, establezca su clave de seguridad.');
      return;
    }

    const officialName = `CDI-${registerCdiCode.trim()} ${registerRoleTemplate}`;
    let role: 'admin' | 'user' | 'supervisor' | 'pastor' = 'user';
    if (registerRoleTemplate.includes('(Pastor)')) {
      role = 'pastor';
    } else if (registerRoleTemplate.includes('(Director)')) {
      role = 'supervisor';
    }

    // Auto-generate or pick color
    const cdiColors: Record<string, string> = {
      '128': '#ec4899',
      '130': '#3b82f6',
      '135': '#10b981',
      '201': '#f59e0b',
      '291': '#8b5cf6',
    };
    const color = cdiColors[registerCdiCode.trim()] || '#4f46e5';

    // Find supervisor ID
    let supervisorId = '';
    if (role === 'user') {
      const directorUser = users.find(u => u.name.toLowerCase().includes(`cdi-${registerCdiCode.trim()}`) && u.name.toLowerCase().includes('(director)'));
      if (directorUser) {
        supervisorId = directorUser.id;
      }
    } else if (role === 'supervisor') {
      const pastorUser = users.find(u => u.name.toLowerCase().includes(`cdi-${registerCdiCode.trim()}`) && u.name.toLowerCase().includes('(pastor)'));
      if (pastorUser) {
        supervisorId = pastorUser.id;
      }
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: officialName,
          password: registerPassword.trim(),
          role,
          color,
          supervisorId
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsers((prev) => [...prev.filter(u => u.id !== newUser.id), newUser]);
        localStorage.setItem('compas_users', JSON.stringify([...users.filter(u => u.id !== newUser.id), newUser]));
        
        localStorage.setItem('compas_has_registered', 'true');
        localStorage.setItem('compas_last_username', officialName);
        setHasRegistered(true);

        setRegisterSuccessMsg(`¡Usuario oficial "${officialName}" creado con éxito!`);
        setLoginUserName(officialName);
        setRegisterPassword('');
        setRegisterCdiCode('');
        
        // Auto switch tab to login after 3 seconds
        setTimeout(() => {
          setAuthTab('login');
          setRegisterSuccessMsg('');
        }, 3000);
      } else {
        const errData = await res.json();
        setLoginError(errData.error || 'Error al registrar el usuario oficial.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Error de comunicación con el servidor.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    triggerNotification('Sesión cerrada correctamente.', 'info');
  };

  // --- CRUD OPERATORS FOR USERS WITH EXPRESS SYNC
  const loadUsersFromServer = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        localStorage.setItem('compas_users', JSON.stringify(data));
      }
    } catch (e) {
      console.error("Error loading users from server:", e);
    }
  };

  useEffect(() => {
    loadUsersFromServer();
  }, []);

  const handleAddUser = async (name: string, color: string, role?: 'admin' | 'user' | 'supervisor' | 'pastor', supervisorId?: string, password?: string) => {
    const formattedPassword = password ? password.trim() : '123';
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, role, supervisorId, password: formattedPassword }),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers((prev) => {
          const updated = [...prev.filter(u => u.id !== newUser.id), newUser];
          localStorage.setItem('compas_users', JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`¡Usuario "${name}" registrado con éxito!`);
      } else {
        const errData = await res.json();
        triggerNotification(errData.error || 'Error al registrar usuario.', 'warning');
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Error de conexión al servidor.', 'warning');
    }
  };

  const handleUpdateUser = async (id: string, name: string, color: string, role?: 'admin' | 'user' | 'supervisor' | 'pastor', supervisorId?: string, password?: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, role, supervisorId, password }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers((prev) => {
          const updated = prev.map((u) => (u.id === id ? updatedUser : u));
          localStorage.setItem('compas_users', JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`Perfil de "${name || 'usuario'}" actualizado.`);
      } else {
        const errData = await res.json();
        triggerNotification(errData.error || 'Error al actualizar usuario.', 'warning');
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Error de conexión al servidor.', 'warning');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers((prev) => {
          const updated = prev.filter((u) => u.id !== id);
          localStorage.setItem('compas_users', JSON.stringify(updated));
          return updated;
        });
        triggerNotification('Usuario eliminado con éxito.', 'success');
      } else {
        triggerNotification('Error al eliminar usuario.', 'warning');
      }
    } catch (e) {
      console.error(e);
      triggerNotification('Error de conexión al servidor.', 'warning');
    }
  };

  const handleUpdatePassword = async (userId: string, newPass: string) => {
    if (!newPass.trim()) {
      triggerNotification('Por favor, escribe una contraseña válida.', 'warning');
      return;
    }
    await handleUpdateUser(userId, undefined as any, undefined as any, undefined as any, undefined as any, newPass.trim());
    
    const targetUser = users.find((u) => u.id === userId);
    
    // Log activity
    const newActivity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      action: `actualizó la clave de`,
      targetType: 'user',
      targetName: targetUser?.name || 'Usuario',
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
    
    triggerNotification(`Clave de "${targetUser?.name || 'usuario'}" cambiada con éxito.`, 'success');
  };

  // --- CRUD OPERATORS FOR TASKS
  const getNextDueDate = (currentDateStr: string, frequency: 'ninguna' | 'diaria' | 'semanal' | 'mensual'): string => {
    try {
      const parts = currentDateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      if (frequency === 'diaria') {
        date.setDate(date.getDate() + 1);
      } else if (frequency === 'semanal') {
        date.setDate(date.getDate() + 7);
      } else if (frequency === 'mensual') {
        date.setMonth(date.getMonth() + 1);
      }
      
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch (err) {
      return currentDateStr;
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit mode
      const existing = tasks.find(t => t.id === taskData.id);
      
      if (taskData.status === 'Completada' && taskData.recurrence && taskData.recurrence !== 'ninguna' && existing && existing.status !== 'Completada') {
        // Create historical completed copy
        const historicalTask: Task = {
          ...taskData,
          id: `tsk-hist-${Math.random().toString(36).substr(2, 9)}`,
          title: `${taskData.title} (Historial completado)`,
          status: 'Completada',
          recurrence: 'ninguna',
          createdAt: existing.createdAt,
        } as Task;

        // Shift next recurrence
        const nextDate = getNextDueDate(taskData.dueDate, taskData.recurrence);
        const updatedSubtasks = taskData.subtasks?.map(s => ({ ...s, completed: false })) || [];

        setTasks((prev) => [
          historicalTask,
          ...prev.map((t) =>
            t.id === taskData.id
              ? {
                  ...t,
                  ...taskData,
                  status: 'Pendiente' as TaskStatus,
                  dueDate: nextDate,
                  subtasks: updatedSubtasks,
                } as Task
              : t
          )
        ]);

        logActivity(`completó y repitió (nueva fecha: ${nextDate})`, 'task', taskData.title || '');
        triggerNotification(`¡Tarea recurrente repetida! Nueva fecha límite: ${nextDate}.`, 'success');
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskData.id
              ? { ...t, ...taskData } as Task
              : t
          )
        );
        logActivity('actualizó', 'task', taskData.title || '');
        triggerNotification('Tarea modificada satisfactoriamente.');
      }
    } else {
      // Create mode
      const newTask: Task = {
        ...taskData,
        id: `tsk-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      } as Task;
      setTasks((prev) => [newTask, ...prev]);
      logActivity('creó', 'task', taskData.title || '');
      triggerNotification('Nueva tarea registrada con éxito.', 'success');
    }
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      setTaskToDelete(target);
    }
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    logActivity('eliminó', 'task', taskToDelete.title);
    triggerNotification(`La tarea "${taskToDelete.title?.substring(0, 20)}..." fue eliminada.`, 'warning');
    setTaskToDelete(null);
  };

  const handleTaskStatusChange = (id: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    let updatedActiveTask: Task | undefined = undefined;

    const isMass = target.isMassAssignment || (target.assigneeIds && target.assigneeIds.length > 1);
    const assignees = target.assigneeIds || (target.assigneeId ? [target.assigneeId] : []);
    const uniqueAssignees = Array.from(new Set(assignees));
    const isUserAssignee = uniqueAssignees.includes(currentUserId);

    if (isMass) {
      if (newStatus === 'Completada') {
        if (isUserAssignee) {
          const currentCompleted = target.completedAssigneeIds || [];
          const newCompleted = currentCompleted.includes(currentUserId)
            ? currentCompleted
            : [...currentCompleted, currentUserId];
          
          const allCompleted = uniqueAssignees.every(uid => newCompleted.includes(uid));

          if (allCompleted) {
            if (target.recurrence && target.recurrence !== 'ninguna') {
              const historicalTask: Task = {
                ...target,
                id: `tsk-hist-${Math.random().toString(36).substr(2, 9)}`,
                title: `${target.title} (Historial completado)`,
                status: 'Completada',
                recurrence: 'ninguna',
                completedAssigneeIds: newCompleted,
              };

              const nextDate = getNextDueDate(target.dueDate, target.recurrence);
              const updatedSubtasks = target.subtasks?.map(s => ({ ...s, completed: false })) || [];

              setTasks((prev) => [
                historicalTask,
                ...prev.map((t) => {
                  if (t.id === id) {
                    const ut = { 
                      ...t, 
                      status: 'Pendiente' as TaskStatus, 
                      dueDate: nextDate, 
                      subtasks: updatedSubtasks,
                      completedAssigneeIds: [],
                    };
                    updatedActiveTask = ut;
                    return ut;
                  }
                  return t;
                })
              ]);

              logActivity(`completó y repitió (nueva fecha: ${nextDate})`, 'task', target.title);
              triggerNotification(`¡Tarea recurrente repetida! Nueva fecha límite: ${nextDate}.`, 'success');
            } else {
              setTasks((prev) =>
                prev.map((t) => {
                  if (t.id === id) {
                    const ut = { ...t, status: 'Completada' as TaskStatus, completedAssigneeIds: newCompleted };
                    updatedActiveTask = ut;
                    return ut;
                  }
                  return t;
                })
              );
              logActivity(`completó todos los responsables de`, 'task', target.title);
              triggerNotification('¡Excelente! Todos los colaboradores han completado la tarea.', 'success');
            }
          } else {
            const currentStatus = target.status === 'Completada' ? 'Pendiente' : target.status;
            setTasks((prev) =>
              prev.map((t) => {
                if (t.id === id) {
                  const ut = { ...t, status: currentStatus, completedAssigneeIds: newCompleted };
                  updatedActiveTask = ut;
                  return ut;
                }
                return t;
              })
            );
            logActivity(`completó su asignación de`, 'task', target.title);
            triggerNotification('Completaste tu parte de la tarea grupal.', 'info');
          }
        } else {
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id === id) {
                const ut = { ...t, status: 'Completada' as TaskStatus, completedAssigneeIds: uniqueAssignees };
                updatedActiveTask = ut;
                return ut;
              }
              return t;
            })
          );
          logActivity(`completó la tarea de grupo`, 'task', target.title);
          triggerNotification('Tarea completada administrativamente.');
        }
      } else {
        if (isUserAssignee) {
          const currentCompleted = target.completedAssigneeIds || [];
          const newCompleted = currentCompleted.filter(uid => uid !== currentUserId);

          setTasks((prev) =>
            prev.map((t) => {
              if (t.id === id) {
                const ut = { ...t, status: newStatus, completedAssigneeIds: newCompleted };
                updatedActiveTask = ut;
                return ut;
              }
              return t;
            })
          );
          logActivity(`marcó como pendiente su parte de`, 'task', target.title);
          triggerNotification('Tu parte de la tarea grupal ahora está pendiente.', 'info');
        } else {
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id === id) {
                const ut = { ...t, status: newStatus };
                updatedActiveTask = ut;
                return ut;
              }
              return t;
            })
          );
          logActivity(`cambió el estado a "${newStatus}" de`, 'task', target.title);
          triggerNotification('Estado de tarea actualizado.');
        }
      }
    } else {
      if (newStatus === 'Completada' && target.recurrence && target.recurrence !== 'ninguna') {
        const historicalTask: Task = {
          ...target,
          id: `tsk-hist-${Math.random().toString(36).substr(2, 9)}`,
          title: `${target.title} (Historial completado)`,
          status: 'Completada',
          recurrence: 'ninguna',
        };

        const nextDate = getNextDueDate(target.dueDate, target.recurrence);
        const updatedSubtasks = target.subtasks?.map(s => ({ ...s, completed: false })) || [];

        setTasks((prev) => [
          historicalTask,
          ...prev.map((t) => {
            if (t.id === id) {
              const ut = { 
                ...t, 
                status: 'Pendiente' as TaskStatus, 
                dueDate: nextDate, 
                subtasks: updatedSubtasks 
              };
              updatedActiveTask = ut;
              return ut;
            }
            return t;
          })
        ]);

        logActivity(`completó y repitió (nueva fecha: ${nextDate})`, 'task', target.title);
        triggerNotification(`¡Tarea recurrente repetida! Nueva fecha límite: ${nextDate}.`, 'success');
      } else {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              const ut = { ...t, status: newStatus };
              updatedActiveTask = ut;
              return ut;
            }
            return t;
          })
        );
        logActivity(`cambió el estado a "${newStatus}" de`, 'task', target.title);
        triggerNotification('Estado de tarea actualizado.');
      }
    }

    // Sync selectedDetailTask modal state if it's currently open
    if (selectedDetailTask && selectedDetailTask.id === id) {
      if (updatedActiveTask) {
        setSelectedDetailTask(updatedActiveTask);
      } else {
        setSelectedDetailTask((prev) => prev ? { ...prev, status: newStatus } : undefined);
      }
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks?.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ) || [];
        
        // Determine automatic task status transition based on subtask completion
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
        let newStatus = t.status;
        if (allCompleted && t.status !== 'Completada') {
          newStatus = 'Completada';
        } else if (!allCompleted && t.status === 'Completada') {
          newStatus = 'En Progreso';
        }

        const updatedTask = { ...t, subtasks: updatedSubtasks, status: newStatus };
        
        if (selectedDetailTask && selectedDetailTask.id === taskId) {
          setSelectedDetailTask(updatedTask);
        }
        
        return updatedTask;
      })
    );
    triggerNotification('Subtarea actualizada.');
  };

  const handleAddComment = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: `cmt-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      userId: currentUserId,
      userName: currentUser.name,
      userRole: currentUser.role || 'user',
      text,
      createdAt: new Date().toISOString()
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: [...(t.comments || []), newComment]
          };
        }
        return t;
      })
    );

    // Sync active modal if open
    setSelectedDetailTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return {
        ...prev,
        comments: [...(prev.comments || []), newComment]
      };
    });

    logActivity('comentó en la tarea', 'task', tasks.find((t) => t.id === taskId)?.title || '');
    triggerNotification('Comentario añadido.');
  };

  const handleUpdateComment = (taskId: string, commentId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: (t.comments || []).map((c) => (c.id === commentId ? { ...c, text } : c))
          };
        }
        return t;
      })
    );

    setSelectedDetailTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return {
        ...prev,
        comments: (prev.comments || []).map((c) => (c.id === commentId ? { ...c, text } : c))
      };
    });

    triggerNotification('Comentario modificado.');
  };

  const handleDeleteComment = (taskId: string, commentId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: (t.comments || []).filter((c) => c.id !== commentId)
          };
        }
        return t;
      })
    );

    setSelectedDetailTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return {
        ...prev,
        comments: (prev.comments || []).filter((c) => c.id !== commentId)
      };
    });

    triggerNotification('Comentario eliminado.', 'warning');
  };

  // --- CRUD OPERATORS FOR EVENTS
  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'createdAt'> & { id?: string }) => {
    if (eventData.id) {
      // Edit mode
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventData.id
            ? { ...e, ...eventData } as Event
            : e
        )
      );
      logActivity('actualizó el evento', 'event', eventData.title || '');
      triggerNotification('Evento reprogramado satisfactoriamente.');
    } else {
      // Create mode
      const newEvent: Event = {
        ...eventData,
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
      logActivity('agendó el evento', 'event', eventData.title || '');
      triggerNotification('¡Nuevo evento agendado exitosamente!', 'success');
    }
  };

  const handleDeleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (target) {
      logActivity('canceló el evento', 'event', target.title);
    }
    triggerNotification(`Evento "${target?.title?.substring(0, 20)}..." cancelado.`, 'warning');
  };

  const handleAddTaskFromAI = (taskData: {
    title: string;
    description: string;
    priority: 'Alta' | 'Media' | 'Baja';
    category: string;
    subtasks: { id: string; title: string; completed: boolean }[];
    dueDate: string;
  }) => {
    const newTask: Task = {
      id: `tsk-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      category: taskData.category,
      status: 'Pendiente',
      dueDate: taskData.dueDate,
      subtasks: taskData.subtasks,
      assigneeId: currentUser.id,
      assigneeIds: [currentUser.id],
      creatorId: currentUser.id,
      recurrence: 'ninguna',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logActivity('creó desde IA', 'task', newTask.title);
  };

  const handleAddEventFromAI = (eventData: {
    title: string;
    description: string;
    date: string;
    category: string;
    color: string;
  }) => {
    const newEvent: Event = {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: '09:00',
      participantIds: [currentUser.id],
      creatorId: currentUser.id,
      recurrence: 'ninguna',
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    logActivity('agendó desde IA', 'event', newEvent.title);
  };

  // --- BACKUP JSON EXPORT/IMPORT MECHANISM
  const handleExportDataAsJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users,
      tasks,
      events,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tableroproductivo_backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerNotification('Copia de respaldo JSON exportada y descargada.', 'info');
  };

  const handleImportDataFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.users && parsed.tasks && parsed.events) {
          // Validate core properties structure
          setUsers(parsed.users);
          setTasks(parsed.tasks);
          setEvents(parsed.events);
          if (parsed.users.length > 0) {
            setCurrentUserId(parsed.users[0].id);
          }
          triggerNotification('¡Copia de seguridad importada con éxito!', 'success');
        } else {
          triggerNotification('Formato de archivo inválido. Faltan colecciones principales.', 'error');
        }
      } catch (err) {
        triggerNotification('Ocurrió un error al parsear el archivo JSON.', 'error');
      }
    };
    fileReader.readAsText(files[0]);
    // Reset file input target
    e.target.value = '';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-200 flex flex-col items-center justify-center p-4">
        {/* Dark Mode toggle on Login Page */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-900 bg-white dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-350 transition-colors cursor-pointer"
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 relative">
          {/* Logo Brand */}
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">
                Dashboard Cluster
              </h1>
              <span className="text-xs text-slate-400 font-bold">
                Sistema Colaborativo de Control
              </span>
            </div>
          </div>

          {/* Dual Tab Switcher */}
          <div className="flex border-b border-slate-150 dark:border-slate-800">
            <button
              onClick={() => {
                setAuthTab('login');
                setLoginError('');
                setRegisterSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-extrabold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                authTab === 'login'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Iniciar Sesión
            </button>
            {!hasRegistered && (
              <button
                onClick={() => {
                  setAuthTab('register');
                  setLoginError('');
                  setRegisterSuccessMsg('');
                }}
                className={`flex-1 pb-3 text-xs font-extrabold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  authTab === 'register'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Crear Cuenta Oficial
              </button>
            )}
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {registerSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-955/30 border border-emerald-250 dark:border-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-semibold animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{registerSuccessMsg}</span>
            </div>
          )}

          {authTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Type Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nombre de Usuario Oficial
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={loginUserName}
                    onChange={(e) => setLoginUserName(e.target.value)}
                    placeholder="Ej: CDI-128 (Asist Adm)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Digite exactamente su nombre con su respectivo prefijo CDI.
                </span>
              </div>

              {/* Password input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Clave de Seguridad
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Escriba su contraseña secreta..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors focus:outline-hidden cursor-pointer flex items-center justify-center"
                    title={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all hover:-translate-y-0.5 shadow-md shadow-indigo-500/15 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ingresar al Sistema</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
                <p className="font-bold mb-1">💡 Registro Formateado Oficial</p>
                <p className="text-[10px] leading-relaxed">
                  Para registrarse, primero digite el número de su CDI y luego seleccione su cargo. El sistema construirá su usuario con la nomenclatura fija requerida.
                </p>
              </div>

              {/* CDI Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Código del CDI
                </label>
                <input
                  type="text"
                  value={registerCdiCode}
                  onChange={(e) => setRegisterCdiCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 128"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-indigo-500"
                  maxLength={5}
                />
              </div>

              {/* Suffix / Template dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cargo / Rol
                </label>
                <select
                  value={registerRoleTemplate}
                  onChange={(e) => setRegisterRoleTemplate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 font-bold"
                >
                  <option value="(Asist Adm)">(Asist Adm) - Asistente Administrativo</option>
                  <option value="(Asist Pat)">(Asist Pat) - Asistente Patrocinio</option>
                  <option value="(Tutora Lid)">(Tutora Lid) - Tutora Líder</option>
                  <option value="(Director)">(Director) - Supervisor Director</option>
                  <option value="(Pastor)">(Pastor) - Pastor Gerente</option>
                </select>
              </div>

              {/* Live Preview of Username */}
              <div className="p-3 bg-slate-50 dark:bg-slate-955/35 border border-slate-250 dark:border-slate-850 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Tu Usuario Oficial Registrado:</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mt-1">
                  CDI-{registerCdiCode || '___'} {registerRoleTemplate}
                </span>
              </div>

              {/* Security Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Establecer Clave Secreta
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Establezca su contraseña secreta..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl pl-10 pr-11 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors focus:outline-hidden cursor-pointer flex items-center justify-center"
                    title={showRegisterPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Crear Cuenta Oficial</span>
              </button>
            </form>
          )}

          {/* ACCESO RÁPIDO PARA DEMOSTRACIÓN */}
          <div className="pt-4.5 border-t border-slate-150 dark:border-slate-800 space-y-3">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block text-center">
              ⚙️ Acceso Rápido de Prueba (Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginUserName('Facilitador');
                  setLoginPassword('admin');
                  setAuthTab('login');
                }}
                className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-[10.5px] font-bold text-indigo-700 dark:text-indigo-400 transition-colors text-left truncate flex flex-col cursor-pointer"
              >
                <span className="font-extrabold text-[8.5px] uppercase text-indigo-500">Facilitador (Admin)</span>
                <span className="truncate">Clave: admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginUserName('CDI-128 (Director)');
                  setLoginPassword('123');
                  setAuthTab('login');
                }}
                className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-[10.5px] font-bold text-slate-700 dark:text-slate-300 transition-colors text-left truncate flex flex-col cursor-pointer"
              >
                <span className="font-extrabold text-[8.5px] uppercase text-slate-500">CDI-128 (Director)</span>
                <span className="truncate">Clave: 123</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginUserName('CDI-128 (Pastor)');
                  setLoginPassword('123');
                  setAuthTab('login');
                }}
                className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-[10.5px] font-bold text-slate-700 dark:text-slate-300 transition-colors text-left truncate flex flex-col cursor-pointer"
              >
                <span className="font-extrabold text-[8.5px] uppercase text-slate-500">CDI-128 (Pastor)</span>
                <span className="truncate">Clave: 123</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginUserName('CDI-128 (Asist Adm)');
                  setLoginPassword('123');
                  setAuthTab('login');
                }}
                className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-[10.5px] font-bold text-slate-700 dark:text-slate-300 transition-colors text-left truncate flex flex-col cursor-pointer"
              >
                <span className="font-extrabold text-[8.5px] uppercase text-slate-500">CDI-128 (Asistente)</span>
                <span className="truncate">Clave: 123</span>
              </button>
            </div>
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 text-center leading-normal">
              Haz clic sobre cualquier perfil para rellenar los datos automáticamente y luego presiona <strong className="text-indigo-650 dark:text-indigo-450 font-extrabold">"Ingresar al Sistema"</strong>.
            </p>
          </div>

        </div>

        <footer className="mt-8 text-center text-[10px] text-slate-400 font-semibold tracking-wider uppercase flex flex-col items-center gap-1.5">
          <span>Dashboard Cluster Local • Datos Protegidos</span>
          <button 
            type="button"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas restaurar todos los datos por defecto? Esto reseteará todos los usuarios, contraseñas y tareas creadas.')) {
                localStorage.removeItem('compas_users');
                localStorage.removeItem('compas_current_user_id');
                localStorage.removeItem('compas_tasks');
                localStorage.removeItem('compas_events');
                localStorage.removeItem('compas_is_logged_in');
                localStorage.removeItem('compas_last_username');
                window.location.reload();
              }
            }}
            className="text-[9px] text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline font-extrabold normal-case cursor-pointer"
          >
            Restaurar Base de Datos por Defecto
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-150 transition-colors duration-200">
      
      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-2xl border shadow-xl animate-fade-in transition-all ${
              notif.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/95 border-emerald-250 text-emerald-800 dark:text-emerald-300'
                : notif.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/95 border-amber-250 text-amber-800 dark:text-amber-300'
                : notif.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/95 border-red-250 text-red-800 dark:text-red-300'
                : 'bg-blue-50 dark:bg-blue-950/95 border-blue-250 text-blue-800 dark:text-blue-300'
            }`}
          >
            {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />}
            {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />}
            {notif.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />}
            {notif.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-500" />}

            <div className="text-xs font-semibold leading-relaxed">
              {notif.text}
            </div>
          </div>
        ))}
      </div>

      {/* PRIMARY HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider block">
                Dashboard Cluster
              </h1>
              <span className="text-[10px] text-slate-400 font-bold block -mt-0.5">
                Dashboard Colaborativo
              </span>
            </div>
          </div>

          {/* Identity & Navigation bar controllers */}
          <div className="flex items-center gap-4">
            
            {/* Active creator info capsule */}
            {/* Active creator info capsule */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white shrink-0"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-250 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider leading-none">
                  {currentUser.role === 'admin' ? 'Facilitador' : currentUser.role === 'supervisor' ? 'Supervisor' : 'Colaborador'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>

            {/* Dark Mode toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-350 transition-colors cursor-pointer"
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Import / Export dropdowns */}
            <div className="flex items-center gap-1.5 border-l border-slate-250 dark:border-slate-800 pl-4">
              <button
                onClick={handleExportDataAsJSON}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer"
                title="Exportar Respaldo JSON"
              >
                <Download className="w-4 h-4" />
              </button>

              <label className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer flex items-center justify-center">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImportDataFromJSON}
                  className="hidden"
                />
              </label>
            </div>

          </div>
        </div>
      </header>

      {/* NAVIGATION TABS RAIL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-2xl gap-1.5 overflow-x-auto shadow-xs">
          {(currentUser.role === 'admin' ? [
            { id: 'dashboard', label: 'Estadísticas / Métrica', icon: LayoutDashboard },
            { id: 'tareas', label: 'Gestión de Tareas', icon: CheckSquare },
            { id: 'eventos', label: 'Agenda / Calendario', icon: CalendarIcon },
            { id: 'chat', label: 'Chat Interno', icon: MessageSquare },
            { id: 'asistente', label: 'Asistente IA (Planes)', icon: Sparkles },
            { id: 'control', label: 'Control de Gestión', icon: Settings },
          ] : currentUser.role === 'pastor' ? [
            { id: 'dashboard', label: 'Estadísticas / Métrica', icon: LayoutDashboard },
            { id: 'tareas', label: 'Gestión de Tareas', icon: CheckSquare },
            { id: 'eventos', label: 'Agenda / Calendario', icon: CalendarIcon },
            { id: 'chat', label: 'Chat Interno', icon: MessageSquare },
            { id: 'asistente', label: 'Asistente IA (Planes)', icon: Sparkles },
          ] : currentUser.role === 'supervisor' ? [
            { id: 'dashboard', label: 'Estadísticas / Métrica', icon: LayoutDashboard },
            { id: 'tareas', label: 'Gestión de Tareas', icon: CheckSquare },
            { id: 'eventos', label: 'Agenda / Calendario', icon: CalendarIcon },
            { id: 'chat', label: 'Chat Interno', icon: MessageSquare },
            { id: 'asistente', label: 'Asistente IA (Planes)', icon: Sparkles },
          ] : [
            { id: 'dashboard', label: 'Estadísticas / Métrica', icon: LayoutDashboard },
            { id: 'tareas', label: 'Gestión de Tareas', icon: CheckSquare },
            { id: 'chat', label: 'Chat Interno', icon: MessageSquare },
          ]).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => navigateToTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'tareas' && overdueTasks > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {tabHistory.length > 1 && (
          <button
            onClick={navigateBack}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-750 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer hover:scale-103 active:scale-97"
            title="Volver a la pestaña anterior"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>
        )}
      </div>

      {/* TAB CONTEXT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        
        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* 1. STATE CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Tareas */}
              <div 
                onClick={() => { navigateToTab('tareas'); setFilterStatus('all'); }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tareas Totales
                  </span>
                  <span className="text-3xl font-extrabold text-slate-850 dark:text-white leading-none">
                    {totalTasks}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Completadas */}
              <div 
                onClick={() => { navigateToTab('tareas'); setFilterStatus('Completada'); }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Completadas
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-600 leading-none">
                    {completedTasks}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Pendientes */}
              <div 
                onClick={() => { navigateToTab('tareas'); setFilterStatus('Pendiente'); }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Pendientes / Progreso
                  </span>
                  <span className="text-3xl font-extrabold text-amber-500 leading-none">
                    {pendingTasks + inProgressTasks}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Vencidas */}
              <div 
                onClick={() => { navigateToTab('tareas'); setFilterStatus('all'); }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-3 group ${
                  overdueTasks > 0 ? 'border-red-300 dark:border-red-900/55 bg-red-50/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tareas Vencidas
                  </span>
                  <span className={`text-3xl font-extrabold leading-none ${overdueTasks > 0 ? 'text-red-500' : 'text-slate-40s0 dark:text-slate-500'}`}>
                    {overdueTasks}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
                  overdueTasks > 0 ? 'bg-red-100 dark:bg-red-950/40 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* 2. STATS COMPILATIONS (Donuts and bar prioritize) */}
            <StatisticsCharts tasks={visibleTasks} users={users} currentUserId={currentUserId} />

            {/* 3. ALERTS & AGENDAS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ALERTS AND OVERDUE BLOCK */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Alertas urgentes de entrega
                    </h3>
                    <p className="text-[11px] text-slate-400 block mt-0.5">
                      Tareas vencidas o por vencer en menos de 3 días
                    </p>
                  </div>
                  <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200/50">
                    {urgentTasks.length} alertas
                  </span>
                </div>

                {urgentTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                    <CheckCircle2 className="w-9 h-9 text-emerald-500/80 mb-2" />
                    <p className="text-xs font-semibold">¡Todo al día por aquí!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No tienes tareas con urgencia pendiente en estas fechas.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                    {urgentTasks.map((task) => {
                      const isOverdue = task.dueDate < todayStr;
                      const taskAssignee = users.find((u) => u.id === task.assigneeId);

                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isOverdue
                              ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                              : 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                                isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {isOverdue ? 'Vencida' : 'Urgente'}
                              </span>
                              <span className="text-[9px] bg-white/80 dark:bg-slate-900 px-1 rounded font-medium border text-slate-550 dark:text-slate-400">
                                {task.category}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                              {task.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 block">
                              Límite: <strong className={isOverdue ? 'text-red-650 dark:text-red-400' : 'text-amber-650 dark:text-amber-400'}>{task.dueDate}</strong>
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            {/* Assignee Avatar */}
                            {taskAssignee && (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
                                style={{ backgroundColor: taskAssignee.color }}
                                title={`Asigned a: ${taskAssignee.name}`}
                              >
                                {taskAssignee.name[0]?.toUpperCase()}
                              </div>
                            )}

                            {/* Assignment type legend/badge */}
                            {(() => {
                              const assignment = getAssignmentType(task);
                              return (
                                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${assignment.bgClass}`}>
                                  {assignment.label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* EVENT MATRIX (NEXT 7 DAYS) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Próximos eventos compartidos
                    </h3>
                    <p className="text-[11px] text-slate-400 block mt-0.5">
                      Reuniones agendadas para los próximos 7 días
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200/50">
                    {upcomingEvents.length} eventos
                  </span>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                    <CalendarIcon className="w-9 h-9 text-slate-350 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold">Sin novedades registradas</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No hay reuniones calendarizadas para la próxima semana.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                    {upcomingEvents.map((evt) => {
                      const relativeDays = getDaysDiff(evt.date, todayStr);
                      let dateText = evt.date;
                      if (relativeDays === 0) dateText = 'Hoy 🎉';
                      else if (relativeDays === 1) dateText = 'Mañana';

                      return (
                        <div
                          key={evt.id}
                          className="bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5 truncate flex-1">
                            <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150 truncate">
                              {evt.title}
                            </h5>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate leading-relaxed">
                              {evt.description || 'Sin descripción adicional.'}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-450 mt-1">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">
                                {dateText} - {evt.time} hs
                              </span>
                              <span>•</span>
                              <span>
                                {evt.participantIds.length} participantes
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              // Switch and select date in calendar
                              setActiveTab('eventos');
                            }}
                            className="p-1 px-2 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-400 cursor-pointer"
                          >
                            Ver en Agenda
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* HISTORIAL DE ACTIVIDADES RECIENTES */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs mt-6">
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Bitácora de Actividades del Sistema
                    </h3>
                    <p className="text-[11px] text-slate-400 block mt-0.5">
                      Registro histórico de acciones realizadas por los colaboradores
                    </p>
                  </div>
                </div>
                {activities.length > 0 && currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActivities([]);
                      triggerNotification('Se ha limpiado la bitácora de actividades.', 'info');
                    }}
                    className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline transition-colors cursor-pointer"
                  >
                    Limpiar Bitácora
                  </button>
                )}
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                  <Info className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold">Bitácora vacía</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Las acciones que realices (crear tareas, cambiar estados, etc.) aparecerán listadas aquí de forma cronológica.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {activities.map((act) => {
                    const date = new Date(act.timestamp);
                    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const formattedDate = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
                    
                    // Style activity tags/colors
                    let actionBadge = 'text-slate-600 bg-slate-100 dark:bg-slate-800';
                    if (act.action.includes('creó')) {
                      actionBadge = 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30';
                    } else if (act.action.includes('eliminó') || act.action.includes('canceló')) {
                      actionBadge = 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30';
                    } else if (act.action.includes('actualizó')) {
                      actionBadge = 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30';
                    } else if (act.action.includes('estado')) {
                      actionBadge = 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30';
                    }

                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* User Avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: act.userColor }}
                          >
                            {act.userName[0]?.toUpperCase()}
                          </div>
                          
                          {/* Activity Description */}
                          <div className="text-xs text-slate-600 dark:text-slate-350 min-w-0">
                            <span className="font-bold text-slate-850 dark:text-slate-200">
                              {act.userName}
                            </span>{' '}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${actionBadge}`}>
                              {act.action}
                            </span>{' '}
                            {act.targetType === 'task' ? 'la tarea' : act.targetType === 'event' ? 'el evento' : 'el usuario'}{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300 italic truncate max-w-[200px] inline-block align-bottom">
                              "{act.targetName}"
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0 text-right">
                          <span className="block font-semibold">{formattedTime}</span>
                          <span className="block text-[9px]">{formattedDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TASKS TAB ==================== */}
        {activeTab === 'tareas' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* ROLE-SPECIFIC PROFESSIONAL TASK DASHBOARD BANNER */}
            <div className={`border rounded-3xl p-6 text-white shadow-lg relative overflow-hidden ${
              currentUser.role === 'admin' 
                ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/20' 
                : currentUser.role === 'pastor'
                ? 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/20'
                : currentUser.role === 'supervisor'
                ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-blue-500/20'
                : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-700/20'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                <div className="space-y-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                    currentUser.role === 'admin'
                      ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300'
                      : currentUser.role === 'pastor'
                      ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                      : currentUser.role === 'supervisor'
                      ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                      : 'bg-violet-500/20 border-violet-400/30 text-violet-300'
                  }`}>
                    {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-indigo-400" />}
                    {currentUser.role === 'pastor' && <Heart className="w-3.5 h-3.5 text-emerald-400" />}
                    {currentUser.role === 'supervisor' && <TrendingUp className="w-3.5 h-3.5 text-blue-400" />}
                    {currentUser.role !== 'admin' && currentUser.role !== 'pastor' && currentUser.role !== 'supervisor' && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                    <span>
                      {currentUser.role === 'admin' ? 'Gobernanza Nacional (Facilitador)' : 
                       currentUser.role === 'pastor' ? 'Salud Ministerial (Pastor Gerente)' : 
                       currentUser.role === 'supervisor' ? 'Control Táctico (Director CDI)' : 
                       'Portal Personal (Colaboradora)'}
                    </span>
                  </span>
                  
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {currentUser.role === 'admin' ? 'Consola de Supervisión y Gobernanza Nacional de Tareas' : 
                     currentUser.role === 'pastor' ? 'Consola de Acompañamiento y Salud de Tareas' : 
                     currentUser.role === 'supervisor' ? 'Consola de Control Táctico y Operaciones Locales' : 
                     'Mi Agenda Profesional de Trabajo de Doble Vía'}
                  </h2>
                  
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {currentUser.role === 'admin' ? 'Monitorea, audita y balancea los flujos de tareas programáticas e institucionales de todos los centros de doble vía a nivel país.' : 
                     currentUser.role === 'pastor' ? 'Acompaña el desarrollo de las tareas, detecta sobrecarga laboral y asegura el balance emocional y ministerial del equipo.' : 
                     currentUser.role === 'supervisor' ? 'Gestiona, delega y optimiza las prioridades de tus 3 colaboradoras locales para asegurar altos estándares de cumplimiento.' : 
                     'Visualiza tus compromisos diarios, reporta tus avances con excelencia y mantén una comunicación fluida con la dirección y pastorado.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center min-w-[90px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completadas</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      {filteredTasks.filter(t => t.status === 'Completada').length}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center min-w-[90px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-extrabold text-amber-400 mt-0.5">
                      {filteredTasks.filter(t => t.status === 'Pendiente' || t.status === 'En Progreso').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH-FILTER BLOCK */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex flex-col gap-4">
                
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    placeholder="Buscar tarea por título o detalles..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-850 dark:text-slate-150 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 p-1 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters grid */}
                <div className={`grid grid-cols-2 ${currentUser.role === 'admin' ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-3.5 text-xs font-semibold`}>
                  
                  {/* Status */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 dark:text-slate-350 focus:outline-hidden"
                    >
                      <option value="all">Todas</option>
                      <option value="Pendiente">⏳ Pendientes</option>
                      <option value="En Progreso">🚀 En Progreso</option>
                      <option value="Completada">✅ Completadas</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prioridad</span>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 dark:text-slate-350 focus:outline-hidden"
                    >
                      <option value="all">Cualquiera</option>
                      <option value="Alta">🔴 Alta</option>
                      <option value="Media">🟡 Media</option>
                      <option value="Baja">🟢 Baja</option>
                    </select>
                  </div>

                  {/* Assignee - Visible to admin and supervisor */}
                  {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsable</span>
                      <select
                        value={filterAssignee}
                        onChange={(e) => setFilterAssignee(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 dark:text-slate-350 focus:outline-hidden"
                      >
                        <option value="all">Cualquiera</option>
                        {users
                          .filter((u) => {
                            if (currentUser.role === 'admin') return true;
                            return u.id === currentUser.id || u.supervisorId === currentUser.id;
                          })
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              👤 {u.name} {u.id === currentUser.id ? '(Yo)' : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Category */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoría</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 dark:text-slate-350 focus:outline-hidden"
                    >
                      <option value="all">Cualquiera</option>
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          🏷️ {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear filter and New task */}
                  <div className="flex items-end gap-1.5">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterPriority('all');
                        setFilterAssignee('all');
                        setFilterCategory('all');
                      }}
                      className="flex-1 py-1.5 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center cursor-pointer transition-colors"
                    >
                      Limpiar todo
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* ACTION ROW & VIEWS CONTROLLER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                  Encontradas: <strong className="text-slate-800 dark:text-slate-200">{filteredTasks.length} tareas</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* View switcher buttons */}
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setTaskViewMode('kanban')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      taskViewMode === 'kanban'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Columnas Kanban
                  </button>
                  <button
                    onClick={() => setTaskViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      taskViewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Vista Lista
                  </button>
                  <button
                    onClick={() => setTaskViewMode('matrix')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      taskViewMode === 'matrix'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Matriz Eisenhower
                  </button>
                </div>

                {/* Add task trigger */}
                <button
                  id="create-task-primary-btn"
                  onClick={() => {
                    setEditTask(undefined);
                    setIsTaskModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 bg-linear-to-b rounded-xl shadow-xs hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Tarea</span>
                </button>
              </div>
            </div>

            {/* MAIN TASKS GRIDS (KANBAN OR LIST) */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center select-none">
                <CheckSquare className="w-14 h-14 mx-auto mb-4 stroke-1 text-slate-300 dark:text-slate-650" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">
                  Ninguna tarea coincide con tus filtros
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto block mt-1.5 leading-relaxed">
                  Prueba cambiando el alcance de tus criterios de búsqueda o registra una nueva tarea con el botón principal.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterAssignee('all');
                    setFilterCategory('all');
                  }}
                  className="mt-4 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                >
                  Reiniciar Filtros
                </button>
              </div>
            ) : taskViewMode === 'list' ? (
              
              /* LIST VIEW INTERFACE */
              <div className="space-y-3.5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    users={users}
                    currentUserId={currentUserId}
                    viewMode="list"
                    onEdit={(t) => {
                      setEditTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleTaskStatusChange}
                    onViewDetails={(t) => {
                      setSelectedDetailTask(t);
                      setIsDetailModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : taskViewMode === 'matrix' ? (
              
              /* EISENHOWER MATRIX INTERFACE */
              <div className="space-y-6 animate-fadeIn">
                {/* Information banner about the Eisenhower Matrix */}
                <div className="bg-indigo-55/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Matriz de Priorización de Eisenhower
                    </h4>
                    <p className="text-[11px] text-indigo-700/90 dark:text-indigo-400 mt-1 leading-relaxed">
                      Este método clasifica tus tareas según su <strong>Urgencia</strong> (fecha límite próxima o vencida en 3 días) e <strong>Importancia</strong> (Prioridad Alta o Media). Te ayuda a tomar mejores decisiones sobre qué hacer de inmediato, qué planificar, qué delegar y qué postergar.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quadrant 1: DO FIRST */}
                  <div className="bg-red-50/10 dark:bg-red-950/5 border border-red-200/40 dark:border-red-900/30 rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-red-200/30 dark:border-red-900/20">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-extrabold text-red-800 dark:text-red-400 uppercase tracking-widest">
                            Q1: Hacer de Inmediato
                          </h4>
                          <span className="text-[10px] text-red-600/70 dark:text-red-400/65 block font-medium">Urgente e Importante (Crítico)</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2.5 py-0.5 rounded-full border border-red-200/40">
                        {filteredTasks.filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return isImportant && isUrgent;
                        }).length}
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-0.5">
                      {filteredTasks
                        .filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return isImportant && isUrgent;
                        })
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            currentUserId={currentUserId}
                            viewMode="list"
                            onEdit={(t) => {
                              setEditTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleTaskStatusChange}
                            onViewDetails={(t) => {
                              setSelectedDetailTask(t);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        ))}
                      {filteredTasks.filter(t => {
                        const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                        const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                        return isImportant && isUrgent;
                      }).length === 0 && (
                        <div className="text-center py-10 border border-slate-200/60 dark:border-slate-800/80 border-dashed rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-semibold">
                          Sin tareas en este cuadrante.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quadrant 2: PLAN/SCHEDULE */}
                  <div className="bg-blue-50/10 dark:bg-blue-950/5 border border-blue-200/40 dark:border-blue-900/30 rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/30 dark:border-blue-900/20">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <div>
                          <h4 className="text-xs font-extrabold text-blue-800 dark:text-blue-400 uppercase tracking-widest">
                            Q2: Programar & Planificar
                          </h4>
                          <span className="text-[10px] text-blue-600/70 dark:text-blue-400/65 block font-medium">No Urgente pero Importante</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200/40">
                        {filteredTasks.filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return isImportant && !isUrgent;
                        }).length}
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-0.5">
                      {filteredTasks
                        .filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return isImportant && !isUrgent;
                        })
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            currentUserId={currentUserId}
                            viewMode="list"
                            onEdit={(t) => {
                              setEditTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleTaskStatusChange}
                            onViewDetails={(t) => {
                              setSelectedDetailTask(t);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        ))}
                      {filteredTasks.filter(t => {
                        const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                        const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                        return isImportant && !isUrgent;
                      }).length === 0 && (
                        <div className="text-center py-10 border border-slate-200/60 dark:border-slate-800/80 border-dashed rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-semibold">
                          Sin tareas en este cuadrante.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quadrant 3: DELEGATE */}
                  <div className="bg-amber-50/10 dark:bg-amber-950/5 border border-amber-200/40 dark:border-amber-900/30 rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/30 dark:border-amber-900/20">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <div>
                          <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-widest">
                            Q3: Delegar / Turnar
                          </h4>
                          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/65 block font-medium">Urgente pero No Importante</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200/40">
                        {filteredTasks.filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return !isImportant && isUrgent;
                        }).length}
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-0.5">
                      {filteredTasks
                        .filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return !isImportant && isUrgent;
                        })
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            currentUserId={currentUserId}
                            viewMode="list"
                            onEdit={(t) => {
                              setEditTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleTaskStatusChange}
                            onViewDetails={(t) => {
                              setSelectedDetailTask(t);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        ))}
                      {filteredTasks.filter(t => {
                        const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                        const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                        return !isImportant && isUrgent;
                      }).length === 0 && (
                        <div className="text-center py-10 border border-slate-200/60 dark:border-slate-800/80 border-dashed rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-semibold">
                          Sin tareas en este cuadrante.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quadrant 4: ELIMINATE / POSTPONE */}
                  <div className="bg-slate-50/40 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-150 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-450" />
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                            Q4: Postergar o Eliminar
                          </h4>
                          <span className="text-[10px] text-slate-500/70 dark:text-slate-450/65 block font-medium">No Urgente y No Importante</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {filteredTasks.filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return !isImportant && !isUrgent;
                        }).length}
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-0.5">
                      {filteredTasks
                        .filter(t => {
                          const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                          const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                          return !isImportant && !isUrgent;
                        })
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            currentUserId={currentUserId}
                            viewMode="list"
                            onEdit={(t) => {
                              setEditTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleTaskStatusChange}
                            onViewDetails={(t) => {
                              setSelectedDetailTask(t);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        ))}
                      {filteredTasks.filter(t => {
                        const isImportant = t.priority === 'Alta' || t.priority === 'Media';
                        const isUrgent = t.dueDate ? getDaysDiff(t.dueDate, todayStr) <= 3 : false;
                        return !isImportant && !isUrgent;
                      }).length === 0 && (
                        <div className="text-center py-10 border border-slate-200/60 dark:border-slate-800/80 border-dashed rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-semibold">
                          Sin tareas en este cuadrante.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              
              /* KANBAN BOARD SYSTEM */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* COLUMN 1: PENDIENTES */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                        Pendientes
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded-full">
                      {filteredTasks.filter((t) => t.status === 'Pendiente').length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-0.5">
                    {filteredTasks
                      .filter((t) => t.status === 'Pendiente')
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          users={users}
                          currentUserId={currentUserId}
                          viewMode="kanban"
                          onEdit={(t) => {
                            setEditTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleTaskStatusChange}
                          onViewDetails={(t) => {
                            setSelectedDetailTask(t);
                            setIsDetailModalOpen(true);
                          }}
                        />
                      ))}
                    {filteredTasks.filter((t) => t.status === 'Pendiente').length === 0 && (
                      <div className="text-center py-10 border border-slate-150 dark:border-slate-850 border-dashed rounded-xl text-slate-400 text-xs">
                        Sin tareas pendientes.
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: EN PROGRESO */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                        En Progreso
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded-full">
                      {filteredTasks.filter((t) => t.status === 'En Progreso').length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-0.5">
                    {filteredTasks
                      .filter((t) => t.status === 'En Progreso')
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          users={users}
                          currentUserId={currentUserId}
                          viewMode="kanban"
                          onEdit={(t) => {
                            setEditTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleTaskStatusChange}
                          onViewDetails={(t) => {
                            setSelectedDetailTask(t);
                            setIsDetailModalOpen(true);
                          }}
                        />
                      ))}
                    {filteredTasks.filter((t) => t.status === 'En Progreso').length === 0 && (
                      <div className="text-center py-10 border border-slate-150 dark:border-slate-850 border-dashed rounded-xl text-slate-400 text-xs">
                        Sin tareas en progreso.
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: COMPLETADAS */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-550" />
                      <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                        Completadas
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded-full">
                      {filteredTasks.filter((t) => t.status === 'Completada').length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-0.5">
                    {filteredTasks
                      .filter((t) => t.status === 'Completada')
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          users={users}
                          currentUserId={currentUserId}
                          viewMode="kanban"
                          onEdit={(t) => {
                            setEditTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleTaskStatusChange}
                          onViewDetails={(t) => {
                            setSelectedDetailTask(t);
                            setIsDetailModalOpen(true);
                          }}
                        />
                      ))}
                    {filteredTasks.filter((t) => t.status === 'Completada').length === 0 && (
                      <div className="text-center py-10 border border-slate-150 dark:border-slate-850 border-dashed rounded-xl text-slate-400 text-xs">
                        Sin tareas terminadas.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================== EVENTS TAB ==================== */}
        {activeTab === 'eventos' && (
          <div className="space-y-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                Agenda de eventos de colaboración compartida.
              </span>
              <button
                onClick={() => {
                  setEditEvent(undefined);
                  setDefaultEventDate(todayStr);
                  setIsEventModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-transform cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Evento</span>
              </button>
            </div>

            <EventCalendar
              events={visibleEvents}
              users={users}
              currentUserId={currentUserId}
              onAddEvent={(dateStr) => {
                setEditEvent(undefined);
                setDefaultEventDate(dateStr);
                setIsEventModalOpen(true);
              }}
              onEditEvent={(evt) => {
                setEditEvent(evt);
                setIsEventModalOpen(true);
              }}
              onDeleteEvent={handleDeleteEvent}
            />

          </div>
        )}

        {/* ==================== CONTROL DE GESTIÓN TAB ==================== */}
        {activeTab === 'control' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-150 dark:border-indigo-900/40">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-base font-extrabold text-slate-850 dark:text-white">
                    Control de Gestión
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Área administrativa exclusiva. Gestione aquí la lista de colaboradores autorizados y supervise las cuentas.
                  </p>
                </div>
              </div>
            </div>

            {/* PASSWORD CONTROL BOARD CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider">
                    Gestión de Claves de Seguridad de Usuarios
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modifique las contraseñas de acceso de todos los usuarios del sistema de forma inmediata.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map((usr) => (
                  <div 
                    key={usr.id} 
                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-100/30 dark:hover:bg-slate-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs" 
                        style={{ backgroundColor: usr.color }}
                      >
                        {usr.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-150 truncate max-w-[120px]">
                            {usr.name}
                          </span>
                          {usr.role === 'admin' ? (
                            <span className="text-[8px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold px-1.5 py-0.5 rounded">Admin</span>
                          ) : usr.role === 'supervisor' ? (
                            <span className="text-[8px] bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-extrabold px-1.5 py-0.5 rounded">Supervisor</span>
                          ) : (
                            <span className="text-[8px] bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded">Colaborador</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Clave: <code className="bg-slate-200/50 dark:bg-slate-850 px-1 py-0.5 rounded font-extrabold text-indigo-600 dark:text-indigo-400">{usr.password || (usr.role === 'admin' ? 'admin' : usr.role === 'supervisor' ? 'supervisor' : '123')}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          value={userPasswords[usr.id] || ''}
                          onChange={(e) => setUserPasswords(prev => ({ ...prev, [usr.id]: e.target.value }))}
                          placeholder="Nueva clave"
                          className="bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-150 focus:outline-hidden focus:border-indigo-500 font-semibold w-24 sm:w-28"
                        />
                      </div>
                      <button
                        onClick={() => {
                          handleUpdatePassword(usr.id, userPasswords[usr.id] || '');
                          setUserPasswords(prev => {
                            const copy = { ...prev };
                            delete copy[usr.id];
                            return copy;
                          });
                        }}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                        title="Guardar nueva clave"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <UserManager
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              currentUser={currentUser}
              onSetCurrentUser={(usr) => {
                setCurrentUserId(usr.id);
                triggerNotification(`Perfil cambiado a "${usr.name}".`);
              }}
            />
          </div>
        )}

        {/* ==================== ASISTENTE TAB ==================== */}
        {activeTab === 'asistente' && (
          <AIAssistant
            onAddTask={handleAddTaskFromAI}
            onAddEvent={handleAddEventFromAI}
            triggerNotification={triggerNotification}
            currentUser={currentUser}
            tasks={tasks}
          />
        )}

        {/* ==================== CHAT TAB ==================== */}
        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <InternalChat
              currentUser={currentUser}
              users={users}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-center text-xs text-slate-400 font-semibold">
        <p>© 2026 Dashboard Cluster Local. Datos persistidos mediante LocalStorage.</p>
        <p className="mt-0.5">Elegante. Eficiente. Colaborativo.</p>
      </footer>

      {/* MODALS CONTROLLER APPARATUS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditTask(undefined);
          setInitialTaskDate(undefined);
        }}
        onSave={handleSaveTask}
        users={users}
        currentUserId={currentUserId}
        editTask={editTask}
        initialSelectedDate={initialTaskDate}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailTask(undefined);
        }}
        task={selectedDetailTask}
        users={users}
        currentUserId={currentUserId}
        onStatusChange={handleTaskStatusChange}
        onToggleSubtask={handleToggleSubtask}
        onEditClick={(t) => {
          setEditTask(t);
          setIsTaskModalOpen(true);
        }}
        onDeleteClick={(id) => {
          const t = tasks.find((item) => item.id === id);
          if (t) {
            setTaskToDelete(t);
          }
        }}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onUpdateComment={handleUpdateComment}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditEvent(undefined);
          setDefaultEventDate(undefined);
        }}
        onSave={handleSaveEvent}
        users={users}
        currentUserId={currentUserId}
        editEvent={editEvent}
        defaultDate={defaultEventDate}
      />

      {/* CONFIRMATION DELETE TASK MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Confirmar eliminación?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la tarea <span className="font-semibold text-slate-800 dark:text-slate-200">"{taskToDelete.title}"</span>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-850 pt-4">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-xl shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer"
              >
                Eliminar Tarea
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
