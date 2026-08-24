import { tool } from 'ai';
import { z } from 'zod';

import type { ToolSet } from 'ai';
import { runTool, type SchoolToolContext } from './shared.js';

/**
 * Tools de inicio y clases (AI-001): lecturas sobre `SchoolService`, el mismo
 * servicio que consume la API REST. Salidas pequeñas y estructuradas.
 */
export function createClassTools(context: SchoolToolContext): ToolSet {
  const { service } = context;
  return {
    getDashboardSummary: tool({
      description:
        'Resumen del panel del docente: clase activa, alumnado total y estado de hoy (asistencia del día de referencia, tareas y anotaciones sin gestionar).',
      inputSchema: z.object({}),
      execute: async () =>
        runTool(async () => {
          const me = await service.me();
          const activeClass = me.activeClass;
          if (activeClass === undefined) {
            return { error: 'No hay clase activa configurada' };
          }
          const summary = await service.getClassSummary(activeClass.id);
          return {
            teacher: { name: (me.teacher as { name?: string }).name ?? '' },
            activeClass: {
              id: activeClass.id,
              groupName: activeClass.groupName,
            },
            ...summary,
          };
        }),
    }),

    listClasses: tool({
      description:
        'Lista todas las clases del centro con su grupo y asignatura.',
      inputSchema: z.object({}),
      execute: async () =>
        runTool(async () => {
          const classes = await service.listClasses();
          return {
            count: classes.length,
            classes: classes.map((schoolClass) => ({
              id: schoolClass.id,
              groupName: schoolClass.groupName,
              subject: schoolClass.subject,
            })),
          };
        }),
    }),

    getClassSummary: tool({
      description:
        'Resumen de una clase concreta por `classId`: número de alumnos, asistencia del día de referencia, tareas totales y anotaciones sin gestionar.',
      inputSchema: z.object({
        classId: z.string().min(1).describe('Identificador de la clase'),
      }),
      execute: async ({ classId }) =>
        runTool(async () => {
          const summary = await service.getClassSummary(classId);
          return summary;
        }),
    }),
  };
}
