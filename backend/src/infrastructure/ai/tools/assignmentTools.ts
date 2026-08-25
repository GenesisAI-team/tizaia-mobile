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
 * Tools de tareas y entregas (AI-001): lecturas sobre `SchoolService`; los
 * recuentos y listados deterministas se calculan en el backend.
 */
export function createAssignmentTools(context: SchoolToolContext): ToolSet {
  const { service } = context;
  return {
    listAssignments: tool({
      description:
        'Lista tareas del centro o de una clase concreta, con fecha de entrega.',
      inputSchema: z.object({
        classId: z.string().min(1).optional().describe('Clase concreta'),
        limit: limitSchema(),
      }),
      execute: async ({ classId, limit }) =>
        runTool(async () => {
          const assignments = await service.listAssignments(classId);
          const capped = capList(assignments, resolveLimit(limit));
          return {
            count: assignments.length,
            assignments: capped.map((assignment) => ({
              id: assignment.id,
              title: assignment.title,
              dueDate: assignment.dueDate,
              classId: assignment.classId,
            })),
          };
        }),
    }),

    getAssignmentSubmissions: tool({
      description:
        'Estado de entregas de una tarea: recuentos por estado y alumnos en cada estado (entregada, no entregada, pendiente).',
      inputSchema: z.object({
        assignmentId: z.string().min(1).describe('Identificador de la tarea'),
        limit: limitSchema(),
      }),
      execute: async ({ assignmentId, limit }) =>
        runTool(async () => {
          // Valida la existencia de la tarea antes de listar.
          const submissions =
            await service.getAssignmentSubmissions(assignmentId);
          const students = await service.listStudents();
          const nameById = new Map(
            students.map((student) => [
              student.id,
              `${student.firstName} ${student.lastName}`,
            ]),
          );
          const groupByStatus = (
            status: 'submitted' | 'notSubmitted' | 'pending',
          ): Array<{ id: string; fullName: string }> =>
            capList(
              submissions
                .filter((submission) => submission.status === status)
                .flatMap((submission) => {
                  const fullName = nameById.get(submission.studentId);
                  return fullName === undefined
                    ? []
                    : [{ id: submission.studentId, fullName }];
                }),
              resolveLimit(limit, 50),
            );
          return {
            assignmentId,
            counts: {
              submitted: submissions.filter((s) => s.status === 'submitted')
                .length,
              notSubmitted: submissions.filter(
                (s) => s.status === 'notSubmitted',
              ).length,
              pending: submissions.filter((s) => s.status === 'pending').length,
            },
            submitted: groupByStatus('submitted'),
            notSubmitted: groupByStatus('notSubmitted'),
            pending: groupByStatus('pending'),
          };
        }),
    }),

    listMissingSubmissions: tool({
      description:
        'Alumnos que NO entregaron una tarea concreta (estado «no entregada»), con nombres.',
      inputSchema: z.object({
        assignmentId: z.string().min(1).describe('Identificador de la tarea'),
        limit: limitSchema(),
      }),
      execute: async ({ assignmentId, limit }) =>
        runTool(async () => {
          const submissions =
            await service.getAssignmentSubmissions(assignmentId);
          const students = await service.listStudents();
          const nameById = new Map(
            students.map((student) => [
              student.id,
              `${student.firstName} ${student.lastName}`,
            ]),
          );
          const missing = capList(
            submissions
              .filter((submission) => submission.status === 'notSubmitted')
              .flatMap((submission) => {
                const fullName = nameById.get(submission.studentId);
                return fullName === undefined
                  ? []
                  : [{ id: submission.studentId, fullName }];
              }),
            resolveLimit(limit, 50),
          );
          return {
            assignmentId,
            count: missing.length,
            missingStudents: missing,
          };
        }),
    }),

    getStudentTaskSummary: tool({
      description:
        'Resumen de tareas de un alumno: totales por estado y títulos de sus tareas no entregadas o pendientes.',
      inputSchema: z.object({
        studentId: z.string().min(1).describe('Identificador del alumno'),
      }),
      execute: async ({ studentId }) =>
        runTool(async () => {
          const [progress, detail] = await Promise.all([
            service.getStudentProgress(studentId),
            service.getStudentDetail(studentId),
          ]);
          const shape = progress as {
            student: { id: string; firstName: string; lastName: string };
            tasks: {
              total: number;
              submitted: number;
              notSubmitted: number;
              pending: number;
            };
          };
          const profile = detail.student as {
            id: string;
            classId: string;
          };
          const classId = profile.classId;
          const assignments = await service.listAssignments(classId);
          const openByStatus: Record<
            'notSubmitted' | 'pending',
            Array<{ assignmentId: string; title: string; dueDate: string }>
          > = { notSubmitted: [], pending: [] };
          for (const assignment of assignments) {
            const submissions = await service.getAssignmentSubmissions(
              assignment.id,
            );
            const own = submissions.find(
              (submission) => submission.studentId === studentId,
            );
            if (
              own !== undefined &&
              (own.status === 'notSubmitted' || own.status === 'pending')
            ) {
              openByStatus[own.status].push({
                assignmentId: assignment.id,
                title: assignment.title,
                dueDate: assignment.dueDate,
              });
            }
          }
          return {
            studentId: shape.student.id,
            fullName: `${shape.student.firstName} ${shape.student.lastName}`,
            totals: shape.tasks,
            notSubmitted: capList(openByStatus.notSubmitted, 10),
            pending: capList(openByStatus.pending, 10),
          };
        }),
    }),
  };
}
