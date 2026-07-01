import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, UserCheck, ShieldAlert, Check, Pencil, X } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onAddUser: (name: string, color: string) => void;
  onUpdateUser: (id: string, name: string, color: string) => void;
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

export function UserManager({ users, onAddUser, onUpdateUser, currentUser, onSetCurrentUser }: UserManagerProps) {
  const [newUserName, setNewUserName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setErrorMsg('Por favor introduce un nombre válido.');
      return;
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, newUserName.trim(), selectedColor);
      setEditingUser(null);
    } else {
      onAddUser(newUserName.trim(), selectedColor);
    }

    setNewUserName('');
    setSelectedColor(PALETTE_COLORS[0]);
    setErrorMsg('');
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setSelectedColor(user.color);
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewUserName('');
    setSelectedColor(PALETTE_COLORS[0]);
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
            Información del usuario administrador actualmente autenticado en el sistema.
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
              Super Administrador
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
            {editingUser ? 'Editar Colaborador' : 'Registrar Nuevo Usuario'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {editingUser
              ? 'Modifica el nombre y el color de avatar de este colaborador.'
              : 'Añade colaboradores a la mesa de trabajo para asignarles tareas conjuntas.'}
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
                placeholder="Ej. CDI-128"
                onChange={(e) => setNewUserName(e.target.value)}
                maxLength={40}
              />
            </div>

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

            <div className="flex gap-2">
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
                <span>{editingUser ? 'Guardar Cambios' : 'Añadir Colaborador'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. COLLABORATORS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
            Colaboradores de la Mesa ({users.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Lista completa de colaboradores registrados con clave de acceso.
          </p>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {users.map((item) => {
              const isSelected = item.id === currentUser.id;
              const defaultPass = item.password || (item.role === 'admin' ? 'admin' : '123');

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
                      <span className="text-[9px] text-slate-400 font-medium">
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
                      title="Editar colaborador"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {item.role === 'admin' && (
                      <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        🛡️ Admin
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
