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
  Lock
} from 'lucide-react';

// Custom types
import { User, Task, Event, AppNotification, TaskStatus, Priority } from './types';

// Mock initial data
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_EVENTS } from './data';

// Custom Components
import { TaskCard } from './components/TaskCard';
import { StatisticsCharts } from './components/StatisticsCharts';
import { EventCalendar } from './components/EventCalendar';
import { TaskModal } from './components/TaskModal';
import { EventModal } from './components/EventModal';
import { UserManager } from './components/UserManager';

export default function App() {
  // --- STATE PERSISTENCE CLIENT-SIDE
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('compas_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If the saved list has old names (e.g., Ana Gómez), doesn't have CDI-128, or is missing the administrator, reset to INITIAL_USERS
        const hasOldNames = parsed.some((u: any) => u.name === 'Ana Gómez' || u.name === 'Carlos Ruíz');
        const hasNewNames = parsed.some((u: any) => u.name.startsWith('CDI-'));
        const hasAdmin = parsed.some((u: any) => u.role === 'admin' || u.id === 'usr-admin');
        if (hasOldNames || !hasNewNames || !hasAdmin) {
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
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tareas' | 'eventos' | 'usuarios'>('dashboard');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // --- TARES VIEWS AND FILTERS
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
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
    localStorage.setItem('compas_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('compas_current_user_id', currentUserId);
  }, [currentUserId]);

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

  // --- DATE CONSTANTS FOR OVERDUE & DYNAMIC ASSESSMENTS
  const todayStr = new Date().toISOString().split('T')[0];

  // --- SECURE / VALUE-BASED CORRESPONDING DATA SCOPES
  const visibleTasks = tasks.filter((task) => {
    if (currentUser.role === 'admin') return true;
    
    // Regular users see tasks they are assigned to, or created, or that are mass assignments
    const isAssignee = task.assigneeId === currentUser.id || task.assigneeIds?.includes(currentUser.id);
    const isCreator = task.creatorId === currentUser.id;
    const isMass = task.isMassAssignment;
    
    return isAssignee || isCreator || isMass;
  });

  const visibleEvents = events.filter((evt) => {
    if (currentUser.role === 'admin') return true;
    
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

  // --- SECURITY LOGIN HANDLERS
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLog = users.find((u) => u.id === loginUserId);
    if (!userToLog) {
      setLoginError('Usuario no encontrado.');
      return;
    }
    // Compare password
    const correctPassword = userToLog.password || (userToLog.role === 'admin' ? 'admin' : '123');
    if (loginPassword === correctPassword) {
      setCurrentUserId(loginUserId);
      setIsLoggedIn(true);
      setLoginPassword('');
      setLoginError('');
      triggerNotification(`¡Sesión iniciada correctamente como ${userToLog.name}!`);
    } else {
      setLoginError('Clave de seguridad incorrecta.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    triggerNotification('Sesión cerrada correctamente.', 'info');
  };

  // --- CRUD OPERATORS FOR USERS
  const handleAddUser = (name: string, color: string) => {
    const id = `usr-${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = { id, name, color };
    setUsers((prev) => [...prev, newUser]);
    triggerNotification(`¡Colaborador "${name}" registrado con éxito!`);
  };

  const handleUpdateUser = (id: string, name: string, color: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, name, color } : u))
    );
    triggerNotification(`Perfil de "${name}" actualizado.`);
  };

  // --- CRUD OPERATORS FOR TASKS
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit mode
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? { ...t, ...taskData } as Task
            : t
        )
      );
      triggerNotification('Tarea modificada satisfactoriamente.');
    } else {
      // Create mode
      const newTask: Task = {
        ...taskData,
        id: `tsk-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      } as Task;
      setTasks((prev) => [newTask, ...prev]);
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
    triggerNotification(`La tarea "${taskToDelete.title?.substring(0, 20)}..." fue eliminada.`, 'warning');
    setTaskToDelete(null);
  };

  const handleTaskStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    triggerNotification('Estado de tarea actualizado.');
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
      triggerNotification('Evento reprogramado satisfactoriamente.');
    } else {
      // Create mode
      const newEvent: Event = {
        ...eventData,
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
      triggerNotification('¡Nuevo evento agendado exitosamente!', 'success');
    }
  };

  const handleDeleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    triggerNotification(`Evento "${target?.title?.substring(0, 20)}..." cancelado.`, 'warning');
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

          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center border-b border-slate-100 dark:border-slate-800 pb-3">
              Ingreso Seguro de Colaboradores
            </h2>

            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Select User */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seleccione su Usuario
              </label>
              <select
                value={loginUserId}
                onChange={(e) => setLoginUserId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-sm text-slate-750 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 font-bold"
              >
                {users.map((usr) => (
                  <option key={usr.id} value={usr.id}>
                    {usr.name} {usr.role === 'admin' ? '🛡️ (Administrador)' : '👤 (Colaborador)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clave de Seguridad
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Escriba su contraseña secreta..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 font-medium"
                />
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

          {/* Test Credentials Table */}
          <div className="bg-slate-50 dark:bg-slate-955/35 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-[11px]">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1.5">
              🗝️ Credenciales de Acceso de Prueba:
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-550 dark:text-slate-450">
              <div>
                <span className="font-bold">Administrador:</span>
              </div>
              <div>
                <span>clave: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded font-bold">admin</code></span>
              </div>
              <div>
                <span className="font-bold">Colaboradores (CDI-*):</span>
              </div>
              <div>
                <span>clave: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded font-bold">123</code></span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
          Dashboard Cluster Local • Datos Protegidos
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
                  {currentUser.role === 'admin' ? 'Administrador' : 'Colaborador'}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-2xl gap-1.5 overflow-x-auto shadow-xs">
          {[
            { id: 'dashboard', label: 'Estadísticas / Métrica', icon: LayoutDashboard },
            { id: 'tareas', label: 'Gestión de Tareas', icon: CheckSquare },
            { id: 'eventos', label: 'Agenda / Calendario', icon: CalendarIcon },
            ...(currentUser.role === 'admin' ? [{ id: 'usuarios', label: 'Colaboradores', icon: Users }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
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
                onClick={() => { setActiveTab('tareas'); setFilterStatus('all'); }}
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
                onClick={() => { setActiveTab('tareas'); setFilterStatus('Completada'); }}
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
                onClick={() => { setActiveTab('tareas'); setFilterStatus('Pendiente'); }}
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
                onClick={() => { setActiveTab('tareas'); setFilterStatus('all'); }}
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

                            {/* Done button */}
                            <button
                              onClick={() => handleTaskStatusChange(task.id, 'Completada')}
                              className="px-2.5 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-xs shadow-emerald-500/10"
                            >
                              Completar
                            </button>
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

          </div>
        )}

        {/* ==================== TASKS TAB ==================== */}
        {activeTab === 'tareas' && (
          <div className="space-y-6">
            
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

                  {/* Assignee - Only visible to admin */}
                  {currentUser.role === 'admin' && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsable</span>
                      <select
                        value={filterAssignee}
                        onChange={(e) => setFilterAssignee(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 dark:text-slate-350 focus:outline-hidden"
                      >
                        <option value="all">Cualquiera</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            👤 {u.name}
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
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Columnas Kanban
                  </button>
                  <button
                    onClick={() => setTaskViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      taskViewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Vista Lista
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
                    viewMode="list"
                    onEdit={(t) => {
                      setEditTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
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
                          viewMode="kanban"
                          onEdit={(t) => {
                            setEditTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleTaskStatusChange}
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
                          viewMode="kanban"
                          onEdit={(t) => {
                            setEditTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleTaskStatusChange}
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
                          viewMode="kanban"
                          onEdit={(t) => {
                            setEditTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleTaskStatusChange}
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

        {/* ==================== USERS TAB ==================== */}
        {activeTab === 'usuarios' && (
          <UserManager
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            currentUser={currentUser}
            onSetCurrentUser={(usr) => {
              setCurrentUserId(usr.id);
              triggerNotification(`Perfil cambiado a "${usr.name}".`);
            }}
          />
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
