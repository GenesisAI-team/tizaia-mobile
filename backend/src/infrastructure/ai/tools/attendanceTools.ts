import { tool } from 'ai';
import { z } from 'zod';

import type { ToolSet } from 'ai';
import { resolveFlexibleDate, type FlexibleDate } from './dateReference.js';
import { runTool, type SchoolToolContext } from './shared.js';

/** Esquema compartido de referencia de fecha (relativa o ISO). */
const flexibleDateSchema = z
  .union([z.enum(['hoy', 'ayer']), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
  .optional()
  .describe(
    'Fecha del día lectivo: ISO `YYYY-MM-DD`, «hoy» o «ayer» (se resuelven en Europe/Madrid)',
  );

/**
 * Tools de asistencia (AI-001): consultas de solo lectura; los cálculos y
 * filtros deterministas (absentes por día) se ejecutan aquí, no en el modelo.
 */
export function createAttendanceTools(context: SchoolToolContext): ToolSet {
  const { service, now } = context;
  return {
    getClassAttendance: tool({
      description:
        'Asistencia agregada de una clase entre dos fechas (por defecto todo el registro): presentes, ausentes, retrasos y sin registrar por día. Cuando el docente dice "mi clase" o no especifica otra clase, usa el activeClassId del contexto.',
      inputSchema: z.object({
        classId: z.string().min(1).describe('Identificador de la clase'),
        from: flexibleDateSchema,
        to: flexibleDateSchema,
      }),
      execute: async ({ classId, from, to }) =>
        runTool(async () => {
          const fromDate =
            from === undefined
              ? undefined
              : resolveFlexibleDate(from as FlexibleDate, now);
          const toDate =
            to === undefined
              ? undefined
              : resolveFlexibleDate(to as FlexibleDate, now);
          const [records, students] = await Promise.all([
            service.listClassAttendance(classId, fromDate, toDate),
            service.listStudents(classId),
          ]);
          const byDate = new Map<
            string,
            { present: number; absent: number; late: number }
          >();
          for (const record of records) {
            const bucket = byDate.get(record.date) ?? {
              present: 0,
              absent: 0,
              late: 0,
            };
            if (record.status === 'present') bucket.present += 1;
            else if (record.status === 'absent') bucket.absent += 1;
            else bucket.late += 1;
            byDate.set(record.date, bucket);
          }
          const days = [...byDate.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, counts]) => ({
              date,
              ...counts,
              unrecorded:
                students.length -
                (counts.present + counts.absent + counts.late),
            }));
          return {
            classId,
            totalStudents: students.length,
            totalRecords: records.length,
            days,
          };
        }),
    }),

    listClassAbsences: tool({
      description:
        'Alumnos ausentes de una clase en una fecha concreta («hoy», «ayer» o ISO). Devuelve la lista con nombres y el recuento. Cuando el docente dice "mi clase" o no especifica otra clase, usa el activeClassId del contexto.',
      inputSchema: z.object({
        classId: z.string().min(1).describe('Identificador de la clase'),
        date: flexibleDateSchema,
      }),
      execute: async ({ classId, date }) =>
        runTool(async () => {
          const resolvedDate = resolveFlexibleDate(date, now);
          const schoolClass = await service.getClass(classId);
          const students = await service.listStudents(classId);
          const nameById = new Map(
            students.map((student) => [
              student.id,
              `${student.firstName} ${student.lastName}`,
            ]),
          );
          const records = await service.listClassAttendance(
            classId,
            resolvedDate,
            resolvedDate,
          );
          const absentStudents = records
            .filter((record) => record.status === 'absent')
            .flatMap((record) => {
              const fullName = nameById.get(record.studentId);
              return fullName === undefined
                ? []
                : [{ id: record.studentId, fullName }];
            });
          return {
            class: { id: schoolClass.id, name: schoolClass.groupName },
            date: resolvedDate,
            totalStudents: students.length,
            absentStudents,
            count: absentStudents.length,
          };
        }),
    }),

    getStudentAttendanceSummary: tool({
      description:
        'Resumen de asistencia de un alumno: días registrados y recuentos de presente/ausente/retraso.',
      inputSchema: z.object({
        studentId: z.string().min(1).describe('Identificador del alumno'),
      }),
      execute: async ({ studentId }) =>
        runTool(async () => {
          const detail = await service.getStudentDetail(studentId);
          const profile = detail.student as {
            id: string;
            firstName: string;
            lastName: string;
          };
          const records = await service.getStudentAttendance(studentId);
          const countByStatus = (
            status: 'present' | 'absent' | 'late',
          ): number =>
            records.filter((record) => record.status === status).length;
          return {
            studentId: profile.id,
            fullName: `${profile.firstName} ${profile.lastName}`,
            totalDays: records.length,
            present: countByStatus('present'),
            absent: countByStatus('absent'),
            late: countByStatus('late'),
          };
        }),
    }),
  };
}
