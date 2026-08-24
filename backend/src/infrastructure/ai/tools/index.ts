import type { ToolSet } from 'ai';

import type { SchoolService } from '../../../application/schoolService.js';
import { createAnnotationTools } from './annotationTools.js';
import { createAssignmentTools } from './assignmentTools.js';
import { createAttendanceTools } from './attendanceTools.js';
import { createClassTools } from './classTools.js';
import { createMailTools } from './mailTools.js';
import { createSignalTools } from './signalTools.js';
import { createStudentTools } from './studentTools.js';
import type { SchoolToolContext } from './shared.js';

export type { SchoolToolContext } from './shared.js';

/**
 * Catálogo completo de tools de lectura del asistente (AI-001). Cada tool
 * consulta los servicios de aplicación compartidos con la API REST; ninguna
 * importa seeds ni llama por HTTP a la propia API.
 */
export function createSchoolTools(context: SchoolToolContext): ToolSet {
  return {
    ...createClassTools(context),
    ...createStudentTools(context),
    ...createAttendanceTools(context),
    ...createAssignmentTools(context),
    ...createAnnotationTools(context),
    ...createMailTools(context),
    ...createSignalTools(context),
  };
}

/** Tipo auxiliar para pruebas: nombres del catálogo esperado. */
export const SCHOOL_TOOL_NAMES: readonly string[] = [
  'getDashboardSummary',
  'listClasses',
  'getClassSummary',
  'findStudents',
  'getStudentProfile',
  'getStudentProgress',
  'getClassAttendance',
  'listClassAbsences',
  'getStudentAttendanceSummary',
  'listAssignments',
  'getAssignmentSubmissions',
  'listMissingSubmissions',
  'getStudentTaskSummary',
  'searchAnnotations',
  'getStudentAnnotationSummary',
  'listUnmanagedAnnotations',
  'listRecentMails',
  'countUnreadMails',
  'searchMails',
  'getStudentRiskSignals',
] as const;

// Referencia de tipo para mantener el contrato con el servicio escolar.
export type SchoolToolsDependency = SchoolService;
