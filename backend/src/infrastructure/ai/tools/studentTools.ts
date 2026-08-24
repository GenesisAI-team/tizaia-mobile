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

/**
 * Tools de alumnado (AI-001): búsqueda y perfiles de solo lectura sobre los
 * servicios de aplicación compartidos con la API REST.
 */
export function createStudentTools(context: SchoolToolContext): ToolSet {
  const { service } = context;
  return {
    findStudents: tool({
      description:
        'Busca alumnos por nombre (opcional) en una clase o en todo el centro. Devuelve id, nombre completo y clase.',
      inputSchema: z.object({
        query: z
          .string()
          .min(1)
          .optional()
          .describe('Texto a buscar en el nombre del alumno'),
        classId: z.string().min(1).optional().describe('Clase concreta'),
        limit: limitSchema(),
      }),
      execute: async ({ query, classId, limit }) =>
        runTool(async () => {
          const students = await service.listStudents(classId);
          const classes = await service.listClasses();
          const classNameById = new Map(
            classes.map((schoolClass) => [
              schoolClass.id,
              schoolClass.groupName,
            ]),
          );
          const normalizedQuery = query?.trim().toLowerCase();
          const matches = students.filter((student) => {
            if (normalizedQuery === undefined) return true;
            return `${student.firstName} ${student.lastName}`
              .toLowerCase()
              .includes(normalizedQuery);
          });
          const capped = capList(matches, resolveLimit(limit));
          return {
            count: matches.length,
            students: capped.map((student) => ({
              id: student.id,
              fullName: `${student.firstName} ${student.lastName}`,
              classId: student.classId,
              className: classNameById.get(student.classId) ?? '',
            })),
          };
        }),
    }),

    getStudentProfile: tool({
      description:
        'Perfil de un alumno por `studentId`: datos básicos y contactos familiares.',
      inputSchema: z.object({
        studentId: z.string().min(1).describe('Identificador del alumno'),
      }),
      execute: async ({ studentId }) =>
        runTool(async () => {
          const detail = await service.getStudentDetail(studentId);
          const { student, contacts } = detail as {
            student: {
              id: string;
              classId: string;
              firstName: string;
              lastName: string;
              birthDate: string;
              schoolEmail: string;
              description: string | null;
            };
            contacts: Array<{
              id: string;
              fullName: string;
              relationship: string;
              email: string;
            }>;
          };
          const schoolClass = await service.getClass(student.classId);
          return {
            id: student.id,
            fullName: `${student.firstName} ${student.lastName}`,
            class: { id: schoolClass.id, groupName: schoolClass.groupName },
            birthDate: student.birthDate,
            description: student.description,
            contacts: contacts.map((contact) => ({
              fullName: contact.fullName,
              relationship: contact.relationship,
            })),
          };
        }),
    }),

    getStudentProgress: tool({
      description:
        'Seguimiento agregado de un alumno: asistencia total, anotaciones por tipo y estado de tareas.',
      inputSchema: z.object({
        studentId: z.string().min(1).describe('Identificador del alumno'),
      }),
      execute: async ({ studentId }) =>
        runTool(async () => {
          const progress = await service.getStudentProgress(studentId);
          return progress;
        }),
    }),
  };
}
