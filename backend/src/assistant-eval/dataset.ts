import type { EvalCase, EvalCategory } from './types.js';

/**
 * Batería versionada de evaluación del asistente (issue #103).
 *
 * - 30 prompts legibles, agrupados por categoría.
 * - Incluye los 7 "canary" de #81 (resolución de clase activa) marcados con
 *   `note: 'canary #81'`.
 * - `activeClass` en seed = `class-1` (23 alumnos, Tecnología, ref 2026-08-21).
 * - Para ambigüedad de alumno se usa "Lara" (dos alumnos confirmados en
 *   class-1: student-1 "Lara Iglesias" y student-11 "Lara Rubio").
 * - Los IDs internos (class-1, student-1, assignment-23, annotation-7,
 *   mail-2, conv_...) no deben exponerse/pedirse al docente.
 *
 * Semver de la batería: se incrementa al añadir/quitar/reordenar casos de
 * forma que cambie la puntuación esperada.
 */
export const ASSISTANT_EVAL_DATASET_VERSION = 1;

export const ASSISTANT_EVAL_DATASET: readonly EvalCase[] = [
  // ── Clases y resumen ────────────────────────────────────────────────────────
  {
    id: 'C01-class-count',
    category: 'classes-summary',
    prompt: '¿Cuántos alumnos tengo en mi clase?',
    expectedTools: ['getClassSummary', 'getDashboardSummary'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81',
  },
  {
    id: 'C02-active-subject',
    category: 'classes-summary',
    prompt: '¿De qué asignatura es mi clase activa?',
    expectedTools: ['getClassSummary', 'getDashboardSummary'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81',
  },
  {
    id: 'C03-list-classes',
    category: 'classes-summary',
    prompt: 'Enséñame mis clases',
    expectedTools: ['listClasses'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },
  {
    id: 'C04-explicit-class-summary',
    category: 'explicit-class',
    prompt: '¿Cuántos alumnos tiene la clase 2 ESO G?',
    expectedTools: ['getClassSummary', 'findStudents', 'listClasses'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-2',
    note: 'clase explícita distinta de la activa (class-1)',
  },

  // ── Clase activa implícita (canary #81) ─────────────────────────────────────
  {
    id: 'C05-absences-yesterday',
    category: 'active-class',
    prompt: '¿Quién faltó ayer?',
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81; ayer = día hábil anterior a REFERENCE_DATE (2026-08-21)',
  },
  {
    id: 'C06-absent-count-yesterday',
    category: 'active-class',
    prompt: '¿Cuántos alumnos faltaron ayer?',
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81',
  },
  {
    id: 'C07-attendance-today',
    category: 'active-class',
    prompt: '¿Cómo está la asistencia de mi clase hoy?',
    expectedTools: ['getClassAttendance', 'listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81; "hoy" = REFERENCE_DATE',
  },
  {
    id: 'C08-tasks-in-class',
    category: 'active-class',
    prompt: '¿Qué tareas tengo en mi clase?',
    expectedTools: ['listAssignments', 'listMissingSubmissions'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81',
  },

  // ── Alumnado ────────────────────────────────────────────────────────────────
  {
    id: 'C09-first-five-students',
    category: 'students',
    prompt: 'Enséñame los primeros cinco alumnos de mi clase.',
    expectedTools: ['findStudents'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'canary #81; limit 5',
  },
  {
    id: 'C10-student-count',
    category: 'students',
    prompt: '¿Cuántos alumnos tengo?',
    expectedTools: ['getClassSummary', 'getDashboardSummary'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },
  {
    id: 'C11-student-profile-first',
    category: 'composition',
    prompt: 'Dame el perfil del primer alumno de mi clase.',
    expectedTools: ['findStudents', 'getStudentProfile'],
    requireAllExpectedTools: true,
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'composición: localiza y luego perfil; canary #81',
  },

  // ── Asistencia ──────────────────────────────────────────────────────────────
  {
    id: 'C12-explicit-class-absences',
    category: 'explicit-class',
    prompt: '¿Quién faltó ayer en 2 ESO G?',
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-2',
  },
  {
    id: 'C13-absences-iso-date',
    category: 'attendance',
    prompt: '¿Cuántos ausentes hubo el 2026-08-20 en mi clase?',
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },
  {
    id: 'C14-week-attendance',
    category: 'attendance',
    prompt: '¿Cómo va la asistencia de mi clase esta semana?',
    expectedTools: ['getClassAttendance', 'listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },

  // ── Tareas y entregas ───────────────────────────────────────────────────────
  {
    id: 'C15-missing-submissions',
    category: 'tasks',
    prompt: '¿Qué tareas hay sin entregar en mi clase?',
    expectedTools: ['listMissingSubmissions', 'listAssignments'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },
  {
    id: 'C16-last-submission-detail',
    category: 'composition',
    prompt: '¿Quién no entregó la última tarea?',
    expectedTools: ['listAssignments', 'listMissingSubmissions'],
    requireAllExpectedTools: true,
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'composición: tareas → entregas pendientes',
  },
  {
    id: 'C17-pending-tasks-count',
    category: 'tasks',
    prompt: '¿Cuántas tareas tengo pendientes en mi clase?',
    expectedTools: ['listAssignments', 'listMissingSubmissions'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },

  // ── Anotaciones ─────────────────────────────────────────────────────────────
  {
    id: 'C18-unmanaged-annotations',
    category: 'annotations',
    prompt: '¿Tengo anotaciones sin gestionar en mi clase?',
    expectedTools: ['listUnmanagedAnnotations', 'searchAnnotations'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },
  {
    id: 'C19-annotations-named-student',
    category: 'annotations',
    prompt: '¿Qué anotaciones hay sobre Sofía Díaz?',
    expectedTools: [
      'findStudents',
      'searchAnnotations',
      'getStudentAnnotationSummary',
    ],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },
  {
    id: 'C20-annotation-count-student',
    category: 'annotations',
    prompt: '¿Cuántas anotaciones tiene mi mejor alumno?',
    expectedTools: [
      'findStudents',
      'getStudentAnnotationSummary',
      'getStudentProgress',
    ],
    requireAllExpectedTools: false,
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'composición no exigida; se acepta si resuelve con tools coherentes',
  },

  // ── Correo ──────────────────────────────────────────────────────────────────
  {
    id: 'C21-unread-mail',
    category: 'mail',
    prompt: '¿Tengo correos sin leer?',
    expectedTools: ['countUnreadMails', 'listRecentMails'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },
  {
    id: 'C22-recent-mail',
    category: 'mail',
    prompt: 'Muéstrame los últimos correos.',
    expectedTools: ['listRecentMails'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },
  {
    id: 'C23-search-mail-tasks',
    category: 'mail',
    prompt: '¿Hay correos sobre tareas?',
    expectedTools: ['searchMails'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },

  // ── Señales descriptivas ────────────────────────────────────────────────────
  {
    id: 'C24-risk-signals-named-student',
    category: 'signals',
    prompt: '¿Qué señales de riesgo tiene Vega Fernández?',
    expectedTools: ['findStudents', 'getStudentRiskSignals'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },
  {
    id: 'C25-risk-signals-best-student',
    category: 'composition',
    prompt: '¿Qué señales de riesgo tiene el alumno con peor racha?',
    expectedTools: [
      'findStudents',
      'getStudentRiskSignals',
      'getStudentTaskSummary',
    ],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'composición: localiza y consulta señales',
  },

  // ── Ambigüedad de alumno ────────────────────────────────────────────────────
  {
    id: 'C26-ambiguous-student-lara',
    category: 'student-ambiguity',
    prompt: '¿Cómo va Lara?',
    expectedTools: ['findStudents'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectClarification: true,
    note: 'ambigüedad real: dos Lara en class-1 (Iglesias y Rubio); NO exponer IDs para desambiguar',
  },

  // ── Multi-turno ─────────────────────────────────────────────────────────────
  {
    id: 'C27-multi-turn-absences',
    category: 'multi-turn',
    prompt: '¿Quién faltó hoy?',
    followUps: ['¿Y ayer?'],
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    note: 'reutiliza el mismo conversationId entre turnos',
  },

  // ── Casos complementarios de robustez ───────────────────────────────────────
  {
    id: 'C28-anonymous-class-not-specific',
    category: 'active-class',
    prompt: '¿Quien faltó en mi clase el lunes pasado?',
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },
  {
    id: 'C29-attendance-student-detail',
    category: 'attendance',
    prompt: '¿Qué asistencia tiene Lucas Muñoz en mi clase?',
    expectedTools: [
      'findStudents',
      'getStudentAttendanceSummary',
      'getStudentProfile',
    ],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
  },
  {
    id: 'C30-task-submission-detail-student',
    category: 'tasks',
    prompt: '¿Qué tareas ha entregado María Martínez?',
    expectedTools: [
      'findStudents',
      'getAssignmentSubmissions',
      'getStudentTaskSummary',
    ],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
  },
];

/** Conjunto de categorías presentes en la batería (para el healthcheck). */
export const ASSISTANT_EVAL_CATEGORIES: readonly EvalCategory[] = [
  'classes-summary',
  'active-class',
  'students',
  'attendance',
  'tasks',
  'annotations',
  'mail',
  'signals',
  'explicit-class',
  'student-ambiguity',
  'composition',
  'multi-turn',
];

export function isEvalCategory(value: string): value is EvalCategory {
  return (ASSISTANT_EVAL_CATEGORIES as readonly string[]).includes(value);
}
