import { colors } from '../../../shared/theme';
import type { MockTask, TaskDeliveryVisualState } from './tasksMockData';

/**
 * Helpers puramente presentacionales de la matriz de Tareas (HU-007, #19).
 * Sin lógica de negocio: layout, ordenación visual y sincronización de scroll.
 */

/** Número de tareas visibles inicialmente (resto por scroll horizontal). */
export const VISIBLE_TASK_COLUMN_COUNT = 3;

/** Ancho de la columna fija con el avatar del alumno. */
export const MATRIX_AVATAR_COLUMN_WIDTH = 64;

/** Padding horizontal a cada lado de la matriz. */
export const MATRIX_SCREEN_PADDING = 16;

/**
 * Ancho de cada columna de tarea para que quepan exactamente
 * `VISIBLE_TASK_COLUMN_COUNT` columnas junto a la columna fija de avatar.
 */
export function getTaskColumnWidth(windowWidth: number): number {
  const available =
    windowWidth - MATRIX_AVATAR_COLUMN_WIDTH - MATRIX_SCREEN_PADDING * 2;
  return Math.floor(available / VISIBLE_TASK_COLUMN_COUNT);
}

/** Ordena de más reciente a más antigua por fecha de entrega. */
export function sortTasksByRecency(tasks: MockTask[]): MockTask[] {
  return [...tasks].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
}

/** Formato corto dd/MM para la cabecera de la matriz. */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

/** Color visual del estado de entrega (sin ciclo de estados en esta fase). */
export function getDeliveryStateColor(state: TaskDeliveryVisualState): string {
  return state === 'delivered' ? colors.success : colors.danger;
}

type ScrollTarget = {
  scrollTo(options: { x: number; animated: boolean }): void;
};

/**
 * Sincroniza los ScrollView horizontales de la matriz (cabecera + filas) para
 * que nombres de tareas y botones se desplacen juntos. La bandera `syncing`
 * corta la reentrada: los scrollTo programáticos también emiten onScroll.
 */
export function createHorizontalScrollSync(): {
  register: (key: string) => (target: ScrollTarget | null) => void;
  syncFrom: (sourceKey: string, offsetX: number) => void;
} {
  const targets = new Map<string, ScrollTarget | null>();
  let syncing = false;
  return {
    register: (key) => (target) => {
      if (target) {
        targets.set(key, target);
      } else {
        targets.delete(key);
      }
    },
    syncFrom: (sourceKey, offsetX) => {
      if (syncing) return;
      syncing = true;
      targets.forEach((target, key) => {
        if (key !== sourceKey) {
          target?.scrollTo({ x: offsetX, animated: false });
        }
      });
      syncing = false;
    },
  };
}
