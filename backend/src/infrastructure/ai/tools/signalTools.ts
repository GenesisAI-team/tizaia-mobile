import { tool } from 'ai';
import { z } from 'zod';

import type { ToolSet } from 'ai';
import { capList, runTool, type SchoolToolContext } from './shared.js';

/**
 * Tool de señales descriptivas (AI-001): devuelve ÚNICAMENTE hechos
 * observables del alumno (faltas, tareas sin entregar/pendientes,
 * anotaciones) SIN umbrales normativos ni alertas formales: la decisión
 * normativa sigue abierta (Q-001), así que esta tool no emite juicios.
 */
export function createSignalTools(context: SchoolToolContext): ToolSet {
  const { service } = context;
  return {
    getStudentRiskSignals: tool({
      description:
        'Hechos observables de un alumno: recuentos de asistencia, tareas no entregadas o pendientes y anotaciones. No aplica umbrales ni genera alertas.',
      inputSchema: z.object({
        studentId: z.string().min(1).describe('Identificador del alumno'),
      }),
      execute: async ({ studentId }) =>
        runTool(async () => {
          const [progress, detail] = await Promise.all([
            service.getStudentProgress(studentId),
            service.getStudentDetail(studentId),
          ]);
          const student = detail.student as {
            id: string;
            firstName: string;
            lastName: string;
            classId: string;
          };
          const shape = progress as {
            attendance: {
              totalDays: number;
              present: number;
              absent: number;
              late: number;
              attendanceRate: number;
            };
            annotations: {
              positive: number;
              contrary: number;
              aggravating: number;
              unmanaged: number;
            };
            tasks: {
              total: number;
              submitted: number;
              notSubmitted: number;
              pending: number;
            };
          };
          const classId = student.classId;
          const assignments = await service.listAssignments(classId);
          const openTitles: Array<{
            assignmentId: string;
            title: string;
            status: 'notSubmitted' | 'pending';
          }> = [];
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
              openTitles.push({
                assignmentId: assignment.id,
                title: assignment.title,
                status: own.status,
              });
            }
          }
          return {
            student: {
              id: student.id,
              fullName: `${student.firstName} ${student.lastName}`,
            },
            attendanceFacts: shape.attendance,
            taskFacts: {
              ...shape.tasks,
              openTasks: capList(openTitles, 10),
            },
            annotationFacts: shape.annotations,
            note: 'Hechos observables; sin umbrales normativos mientras Q-001 siga abierta',
          };
        }),
    }),
  };
}
