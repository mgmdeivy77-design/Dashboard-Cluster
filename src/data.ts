import { User, Task, Event } from './types';

const BASE_CDIS = [
  { id: 'usr-1', num: '128', color: '#ec4899' },
  { id: 'usr-2', num: '130', color: '#3b82f6' },
  { id: 'usr-3', num: '135', color: '#10b981' },
  { id: 'usr-4', num: '201', color: '#f59e0b' },
  { id: 'usr-5', num: '291', color: '#8b5cf6' },
  { id: 'usr-6', num: '305', color: '#a855f7' },
  { id: 'usr-7', num: '387', color: '#f43f5e' },
  { id: 'usr-8', num: '453', color: '#06b6d4' },
  { id: 'usr-9', num: '495', color: '#059669' },
  { id: 'usr-10', num: '529', color: '#ea580c' },
  { id: 'usr-11', num: '721', color: '#3b82f6' },
  { id: 'usr-12', num: '845', color: '#10b981' },
  { id: 'usr-13', num: '863', color: '#8b5cf6' },
  { id: 'usr-14', num: '864', color: '#f59e0b' },
  { id: 'usr-15', num: '909', color: '#ec4899' },
  { id: 'usr-16', num: '910', color: '#06b6d4' },
];

export const INITIAL_USERS: User[] = [
  { id: 'usr-admin', name: 'Facilitador', color: '#4f46e5', role: 'admin', password: 'admin' },
  ...BASE_CDIS.flatMap(cdi => [
    { 
      id: `${cdi.id}-pastor`, 
      name: `CDI-${cdi.num} (Pastor)`, 
      color: cdi.color, 
      role: 'pastor' as const, 
      password: '123' 
    },
    { 
      id: cdi.id, 
      name: `CDI-${cdi.num} (Director)`, 
      color: cdi.color, 
      role: 'supervisor' as const, 
      supervisorId: `${cdi.id}-pastor`, 
      password: '123' 
    },
    { 
      id: `${cdi.id}-colab-1`, 
      name: `CDI-${cdi.num} (Asist Adm)`, 
      color: cdi.color, 
      role: 'user' as const, 
      supervisorId: cdi.id, 
      password: '123' 
    },
    { 
      id: `${cdi.id}-colab-2`, 
      name: `CDI-${cdi.num} (Asist Pat)`, 
      color: cdi.color, 
      role: 'user' as const, 
      supervisorId: cdi.id, 
      password: '123' 
    },
    { 
      id: `${cdi.id}-colab-3`, 
      name: `CDI-${cdi.num} (Tutora Lid)`, 
      color: cdi.color, 
      role: 'user' as const, 
      supervisorId: cdi.id, 
      password: '123' 
    }
  ])
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Planificación de Sprint #4',
    date: '2026-06-22',
    time: '10:00',
    description: 'Definición del backlog del próximo sprint de dos semanas, compromisos del equipo y asignación inicial de deudas técnicas.',
    participantIds: ['usr-1', 'usr-2', 'usr-3', 'usr-4'],
    creatorId: 'usr-1',
    createdAt: '2026-06-15T09:00:00.000Z',
  },
  {
    id: 'evt-2',
    title: 'Revisión Técnica de Arquitectura',
    date: '2026-06-24',
    time: '14:30',
    description: 'Presentación y discusión sobre la estructura de datos propuesta, optimización de solicitudes SQL y mitigación de latencias.',
    participantIds: ['usr-2', 'usr-3'],
    creatorId: 'usr-2',
    createdAt: '2026-06-16T12:00:00.000Z',
  },
  {
    id: 'evt-3',
    title: 'Reunión de Demostración de Avances',
    date: '2026-06-29',
    time: '16:00',
    description: 'Demostración en vivo de las funcionalidades completadas para recopilar retroalimentación de las áreas involucradas.',
    participantIds: ['usr-1', 'usr-2', 'usr-3', 'usr-4'],
    creatorId: 'usr-1',
    createdAt: '2026-06-18T08:00:00.000Z',
  },
  {
    id: 'evt-4',
    title: 'Sesión Creativa y Lluvia de Ideas',
    date: '2026-06-18',
    time: '11:00',
    description: 'Reunión para explorar propuestas de diseño visual de la marca, paletas cromáticas secundarias y transiciones dinámicas.',
    participantIds: ['usr-1', 'usr-4'],
    creatorId: 'usr-1',
    createdAt: '2026-06-14T14:00:00.000Z',
  },
  {
    id: 'evt-5',
    title: 'Daily Standup Almuerzo Informativo',
    date: '2026-06-20',
    time: '12:30',
    description: 'Sincronización diaria rápida para resolver impedimentos del equipo de trabajo y planificar el fin de semana de guardias.',
    participantIds: ['usr-1', 'usr-2', 'usr-3', 'usr-4'],
    creatorId: 'usr-3',
    createdAt: '2026-06-19T08:30:00.000Z',
  },
];
