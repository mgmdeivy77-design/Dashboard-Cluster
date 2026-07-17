import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, UserCheck, ShieldAlert, Check, Pencil, X, Trash2 } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onAddUser: (name: string, color: string, role?: 'admin' | 'user' | 'supervisor' | 'pastor', supervisorId?: string, password?: string) => void;
  onUpdateUser: (id: string, name: string, color: string, role?: 'admin' | 'user' | 'supervisor' | 'pastor', supervisorId?: string, password?: string) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
  onSetCurrentUser: (user: User) => void;
}

const PALETTE_COLORS = [
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#059669', // Dark Emerald
  '#ea580c', // Orange
];

export function UserManager({ users, onAddUser, onUpdateUser, onDeleteUser, currentUser, onSetCurrentUser }: UserManagerProps) {
  const [newUserName, setNewUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0]);
  const [selectedRole, setSelectedRole] = useState<'user' | 'supervisor' | 'admin' | 'pastor'>('user');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setErrorMsg('Por favor introduce un nombre válido.');
      return;
    }
    if (!userPassword.trim()) {
      setErrorMsg('Por favor introduce una clave de seguridad.');
      return;
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, newUserName.trim(), selectedColor, selectedRole, selectedSupervisorId || undefined, userPassword.trim());
      setEditingUser(null);
    } else {
      onAddUser(newUserName.trim(), selectedColor, selectedRole, selectedSupervisorId || undefined, userPassword.trim());
    }

    setNewUserName('');
    setUserPassword('');
    setSelectedColor(PALETTE_COLORS[0]);
    setSelectedRole('user');
    setSelectedSupervisorId('');
    setErrorMsg('');
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setUserPassword(user.password || '123');
    setSelectedColor(user.color);
    setSelectedRole(user.role || 'user');
    setSelectedSupervisorId(user.supervisorId || '');
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewUserName('');
    setUserPassword('');
    setSelectedColor(PALETTE_COLORS[0]);
    setSelectedRole('user');
    setSelectedSupervisorId('');
    setErrorMsg('');
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. STATE INDICATOR / PERFIL SESION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
            Identidad de Sesión
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Información del usuario facilitador actualmente autenticado en el sistema.
          </p>

          <div className="flex flex-col items-center py-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md relative"
              style={{ backgroundColor: currentUser.color }}
            >
              {getInitials(currentUser.name)}
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-150 mt-3">
              {currentUser.name}
            </h4>
            <span className="text-xs text-slate-400 font-semibold mt-0.5">
              {currentUser.role === 'admin' ? 'Super Facilitador' : currentUser.role === 'pastor' ? 'Pastor Gerente' : currentUser.role === 'supervisor' ? 'Supervisor / Director' : 'Colaborador Autorizado'}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center leading-relaxed mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          Usted tiene permisos de administración total para crear y editar colaboradores, y asignar tareas individuales o en masa.
        </div>
      </div>

      {/* 2. USER REGISTER / EDIT FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
            {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {editingUser
              ? 'Modifica el nombre, rol y supervisor de este usuario.'
              : 'Añade directores o colaboradores a la mesa de trabajo.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nombre Completo
              </label>
              <input
                type="text"
                value={newUserName}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Ej. CDI-128 (Director) o CDI-128 (Asist Adm)"
                onChange={(e) => setNewUserName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Clave de Seguridad / Contraseña
              </label>
              <input
                type="text"
                value={userPassword}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Ej. miClave123"
                onChange={(e) => setUserPassword(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Rol del Usuario
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  const role = e.target.value as 'user' | 'supervisor' | 'admin' | 'pastor';
                  setSelectedRole(role);
                  if (role !== 'user' && role !== 'supervisor') setSelectedSupervisorId('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-850 dark:text-slate-100 font-bold"
              >
                <option value="user">👤 Colaborador (CDI Colab)</option>
                <option value="supervisor">🕵️ Supervisor / Director (CDI Director)</option>
                <option value="pastor">⛪ Pastor Gerente (CDI Pastor)</option>
                <option value="admin">🛡️ Super Facilitador</option>
              </select>
            </div>

            {selectedRole === 'user' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Director / Supervisor Asociado
                </label>
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-850 dark:text-slate-100 font-bold"
                >
                  <option value="">-- Sin director asignado --</option>
                  {users
                    .filter((u) => u.role === 'supervisor')
                    .map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        🕵️ {sup.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {selectedRole === 'supervisor' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pastor / Gerente Asociado
                </label>
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-850 dark:text-slate-100 font-bold"
                >
                  <option value="">-- Sin pastor asignado --</option>
                  {users
                    .filter((u) => u.role === 'pastor')
                    .map((pastor) => (
                      <option key={pastor.id} value={pastor.id}>
                        ⛪ {pastor.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Color de Avatar corporativo
              </label>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {PALETTE_COLORS.map((color) => {
                  const isCur = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
                      title={color}
                    >
                      {isCur && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingUser && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-xl text-xs font-bold transition-transform hover:-translate-y-0.5 shadow-sm cursor-pointer ${
                  editingUser
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
                }`}
              >
                {editingUser ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{editingUser ? 'Guardar Cambios' : 'Añadir Usuario'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. COLLABORATORS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
            Mesa de Usuarios ({users.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Lista completa de directores y colaboradores registrados.
          </p>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {users.map((item) => {
              const isSelected = item.id === currentUser.id;
              const defaultPass = item.password || (item.role === 'admin' ? 'admin' : item.role === 'supervisor' ? 'supervisor' : '123');
              const supervisorName = item.supervisorId ? users.find(u => u.id === item.supervisorId)?.name : null;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all group ${
                    isSelected
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900 ring-1 ring-blue-500/20'
                      : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {getInitials(item.name)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {item.name}
                      </span>
                      {supervisorName && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                          Supervisado por: <span className="font-semibold text-slate-600 dark:text-slate-350">{supervisorName}</span>
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                        Clave: <code className="bg-slate-200/60 dark:bg-slate-800/80 px-1 rounded font-bold">{defaultPass}</code>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(item);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Editar usuario"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {item.id !== currentUser.id && item.id !== 'usr-admin' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Está seguro de que desea eliminar permanentemente al usuario "${item.name}"? Esta acción no se puede deshacer.`)) {
                            onDeleteUser(item.id);
                          }
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.role === 'admin' && (
                      <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        🛡️ Facilitador
                      </span>
                    )}

                    {item.role === 'pastor' && (
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        ⛪ Pastor Gerente
                      </span>
                    )}

                    {item.role === 'supervisor' && (
                      <span className="text-[9px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        🕵️ Director
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
