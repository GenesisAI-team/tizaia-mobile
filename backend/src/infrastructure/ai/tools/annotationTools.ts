import { tool } from 'ai';
import { z } from 'zod';

import type { ToolSet } from 'ai';
import {
  capList,
  limitSchema,
  resolveLimit,
  runTool,
  type SchoolToolContext,
} from './shared.js';

type AnnotationItem = {
  id: string;
  studentId: string;
  type: string;
  description: string;
  managed: boolean;
  createdAt: string;
};

const toItem = (annotation: {
  id: string;
  studentId: string;
  type: string;
  description: string;
  managed: boolean;
  createdAt: Date;
}): AnnotationItem => ({
  id: annotation.id,
  studentId: annotation.studentId,
  type: annotation.type,
  description: annotation.description,
  managed: annotation.managed,
  createdAt: annotation.createdAt.toISOString(),
});

/**
 * Tools de anotaciones (AI-001): búsqueda y resúmenes de solo lectura sobre
 * `SchoolService`; fechas serializadas a ISO para salidas JSON estables.
 */
export function createAnnotationTools(context: SchoolToolContext): ToolSet {
  const { service } = context;

  return {
    searchAnnotations: tool({
      description:
        'Busca anotaciones con filtros opcionales: texto en la descripción, alumno, clase o estado de gestión. Cuando el docente dice "mis anotaciones" o no especifica otra clase, usa el activeClassId del contexto como classId.',
      inputSchema: z.object({
        query: z.string().min(1).optional().describe('Texto en la descripción'),
        studentId: z.string().min(1).optional().describe('Alumno concreto'),
        classId: z.string().min(1).optional().describe('Clase concreta'),
        managed: z.boolean().optional().describe('Estado de gestión'),
        limit: limitSchema(),
      }),
      execute: async ({ query, studentId, classId, managed, limit }) =>
        runTool(async () => {
          const annotations = await service.listAnnotations({
            studentId,
            classId,
            managed,
          });
          const normalizedQuery = query?.trim().toLowerCase();
          const matches = annotations.filter((annotation) =>
            normalizedQuery === undefined
              ? true
              : annotation.description.toLowerCase().includes(normalizedQuery),
          );
          return {
            count: matches.length,
            annotations: capList(matches, resolveLimit(limit)).map(toItem),
          };
        }),
    }),

    getStudentAnnotationSummary: tool({
      description:
        'Resumen de anotaciones de un alumno: totales por tipo (positiva, contraria, agravante) y sin gestionar.',
      inputSchema: z.object({
        studentId: z.string().min(1).describe('Identificador del alumno'),
      }),
      execute: async ({ studentId }) =>
        runTool(async () => {
          const annotations = await service.listAnnotations({ studentId });
          const byType = (
            type: 'positive' | 'contrary' | 'aggravating',
          ): number =>
            annotations.filter((annotation) => annotation.type === type).length;
          return {
            studentId,
            total: annotations.length,
            positive: byType('positive'),
            contrary: byType('contrary'),
            aggravating: byType('aggravating'),
            unmanaged: annotations.filter((annotation) => !annotation.managed)
              .length,
          };
        }),
    }),

    listUnmanagedAnnotations: tool({
      description:
        'Anotaciones aún sin gestionar, opcionalmente de una clase, más recientes primero. Cuando el docente dice "mis anotaciones" o no especifica otra clase, usa el activeClassId del contexto como classId.',
      inputSchema: z.object({
        classId: z.string().min(1).optional().describe('Clase concreta'),
        limit: limitSchema(),
      }),
      execute: async ({ classId, limit }) =>
        runTool(async () => {
          const annotations = await service.listAnnotations({
            classId,
            managed: false,
          });
          return {
            count: annotations.length,
            annotations: capList(annotations, resolveLimit(limit)).map(toItem),
          };
        }),
    }),
  };
}
