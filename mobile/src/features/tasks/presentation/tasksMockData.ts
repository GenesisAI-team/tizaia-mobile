/**
 * Datos mock locales para el diseño visual de Tareas (HU-007, issue #19).
 * Sin Supabase ni persistencia: la integración real llega con RF-TASK-001..006.
 */

/** Estado visual de una entrega; sin ciclo real en esta fase. */
export type TaskDeliveryVisualState = 'delivered' | 'notDelivered';

export type MockTask = {
  id: string;
  title: string;
  /** Fecha de entrega ISO (YYYY-MM-DD). */
  dueDate: string;
};

export type MockTaskStudent = {
  id: string;
  name: string;
  /** Estado visual por tarea, indexado por id de tarea. */
  deliveries: Record<string, TaskDeliveryVisualState>;
};

/** Cinco tareas recientes (desordenadas a propósito: la pantalla ordena). */
export const MOCK_TASKS: MockTask[] = [
  { id: 'task-2', title: 'Ficha de lectura', dueDate: '2026-08-03' },
  { id: 'task-5', title: 'Examen tema 4', dueDate: '2026-08-10' },
  { id: 'task-1', title: 'Redacción', dueDate: '2026-07-28' },
  { id: 'task-4', title: 'Problemas 5.1-5.4', dueDate: '2026-08-07' },
  { id: 'task-3', title: 'Dibujo acuarela', dueDate: '2026-08-05' },
];

/** Alumnos mock; suficientes para exigir scroll vertical. */
export const MOCK_TASK_STUDENTS: MockTaskStudent[] = [
  {
    id: 'student-1',
    name: 'Lucía Gómez',
    deliveries: {
      'task-1': 'delivered',
      'task-2': 'delivered',
      'task-3': 'notDelivered',
      'task-4': 'delivered',
      'task-5': 'delivered',
    },
  },
  {
    id: 'student-2',
    name: 'Marco Pérez',
    deliveries: {
      'task-1': 'notDelivered',
      'task-2': 'delivered',
      'task-3': 'delivered',
      'task-4': 'delivered',
      'task-5': 'notDelivered',
    },
  },
  {
    id: 'student-3',
    name: 'Ana Torres',
    deliveries: {
      'task-1': 'delivered',
      'task-2': 'notDelivered',
      'task-3': 'delivered',
      'task-4': 'delivered',
      'task-5': 'delivered',
    },
  },
  {
    id: 'student-4',
    name: 'Pablo Ruiz',
    deliveries: {
      'task-1': 'delivered',
      'task-2': 'delivered',
      'task-3': 'delivered',
      'task-4': 'notDelivered',
      'task-5': 'delivered',
    },
  },
  {
    id: 'student-5',
    name: 'Sara Molina',
    deliveries: {
      'task-1': 'notDelivered',
      'task-2': 'notDelivered',
      'task-3': 'delivered',
      'task-4': 'delivered',
      'task-5': 'delivered',
    },
  },
  {
    id: 'student-6',
    name: 'Diego Serrano',
    deliveries: {
      'task-1': 'delivered',
      'task-2': 'delivered',
      'task-3': 'delivered',
      'task-4': 'delivered',
      'task-5': 'notDelivered',
    },
  },
  {
    id: 'student-7',
    name: 'Nora Castillo',
    deliveries: {
      'task-1': 'delivered',
      'task-2': 'notDelivered',
      'task-3': 'notDelivered',
      'task-4': 'delivered',
      'task-5': 'delivered',
    },
  },
  {
    id: 'student-8',
    name: 'Hugo Vidal',
    deliveries: {
      'task-1': 'delivered',
      'task-2': 'delivered',
      'task-3': 'delivered',
      'task-4': 'delivered',
      'task-5': 'delivered',
    },
  },
];
