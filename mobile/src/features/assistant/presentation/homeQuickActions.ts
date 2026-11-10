import type { RootDrawerParamList } from '../../../navigation/types';

/**
 * Accesos rápidos de la bienvenida de Home (MOB-HOME-001, issue #109).
 * Rutas fijas ya registradas en el Drawer (RootDrawerParamList): pulsar una
 * tarjeta navega y no toca el asistente ni crea conversación.
 */
export type QuickActionRoute = keyof Pick<
  RootDrawerParamList,
  'Attendance' | 'Students' | 'Tasks' | 'Mail' | 'Annotations'
>;

export type QuickAction = {
  route: QuickActionRoute;
  label: string;
  icon: string;
  accessibilityLabel: string;
};

export type QuickActionSet = readonly QuickAction[];

const REVISAR_ASISTENCIA: QuickAction = {
  route: 'Attendance',
  label: 'Revisar asistencia',
  icon: '✓',
  accessibilityLabel: 'Abrir el módulo de Asistencia',
};

const CONSULTAR_ALUMNOS: QuickAction = {
  route: 'Students',
  label: 'Consultar alumnos',
  icon: 'A',
  accessibilityLabel: 'Abrir el módulo de Alumnos',
};

const VER_TAREAS: QuickAction = {
  route: 'Tasks',
  label: 'Ver tareas',
  icon: '◆',
  accessibilityLabel: 'Abrir el módulo de Tareas',
};

const ABRIR_ANOTACIONES: QuickAction = {
  route: 'Annotations',
  label: 'Abrir anotaciones',
  icon: '✎',
  accessibilityLabel: 'Abrir el módulo de Anotaciones',
};

const LEER_CORREO: QuickAction = {
  route: 'Mail',
  label: 'Leer correo',
  icon: '✉',
  accessibilityLabel: 'Abrir el módulo de Mails',
};

/** Conjuntos locales estáticos: 3-4 acciones, sin datos ni llamadas de red. */
export const QUICK_ACTION_SETS: readonly QuickActionSet[] = [
  [REVISAR_ASISTENCIA, VER_TAREAS, CONSULTAR_ALUMNOS],
  [ABRIR_ANOTACIONES, LEER_CORREO, REVISAR_ASISTENCIA],
  [CONSULTAR_ALUMNOS, VER_TAREAS, ABRIR_ANOTACIONES],
  [LEER_CORREO, REVISAR_ASISTENCIA, CONSULTAR_ALUMNOS, VER_TAREAS],
];

/**
 * Elige un conjunto al azar al entrar en Home; se fija una vez por visita
 * (el llamador lo guarda en estado) para que re-renderizar no reordene.
 */
export function selectQuickActionSet(): QuickActionSet {
  const index = Math.floor(Math.random() * QUICK_ACTION_SETS.length);
  return QUICK_ACTION_SETS[index]!;
}
