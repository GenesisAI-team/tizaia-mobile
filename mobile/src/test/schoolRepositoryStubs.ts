import type {
  Annotation,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Mail,
  MailRecipientRef,
  SchoolBootstrap,
  SchoolClass,
  SchoolDay,
  Student,
} from '../domain/school/models';
import type { SchoolRepository } from '../domain/school/schoolRepository';

/**
 * Fixture de centro completo (dos clases) que reproduce el contrato de
 * `/v1/bootstrap`: el agregado incluye alumnos/asistencia/tareas/entregas de
 * TODAS las clases, no solo la activa. Los tests de pantalla lo usan para
 * garantizar que ninguna matriz mezcla datos entre clases.
 */

export const ACTIVE_CLASS_ID = 'class-1';
export const OTHER_CLASS_ID = 'class-2';

export const SCHOOL_DAYS: SchoolDay[] = [
  { date: '2026-08-18', label: 'Mar', secondaryLabel: '18/08' },
  { date: '2026-08-19', label: 'Mié', secondaryLabel: '19/08' },
];

export function createWholeSchoolBootstrap(): SchoolBootstrap {
  const classes: SchoolClass[] = [
    {
      id: ACTIVE_CLASS_ID,
      groupName: '1.º BACHILLER D',
      subject: 'Tecnología',
    },
    { id: OTHER_CLASS_ID, groupName: '2 ESO G', subject: 'Tecnología' },
  ];
  const students: Student[] = [
    {
      id: 's-1',
      classId: ACTIVE_CLASS_ID,
      firstName: 'Ana',
      lastName: 'García',
      description: null,
    },
    {
      id: 's-2',
      classId: ACTIVE_CLASS_ID,
      firstName: 'Bruno',
      lastName: 'Díaz',
      description: null,
    },
    {
      id: 's-3',
      classId: OTHER_CLASS_ID,
      firstName: 'Carla',
      lastName: 'Ruiz',
      description: null,
    },
  ];
  const attendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      studentId: 's-1',
      date: '2026-08-19',
      status: 'present',
    },
    {
      id: 'att-2',
      studentId: 's-2',
      date: '2026-08-19',
      status: 'late',
    },
    {
      id: 'att-other',
      studentId: 's-3',
      date: '2026-08-19',
      status: 'absent',
    },
  ];
  const assignments: Assignment[] = [
    {
      id: 'as-1',
      classId: ACTIVE_CLASS_ID,
      title: 'Práctica 1',
      dueDate: '2026-08-19',
    },
    {
      id: 'as-other',
      classId: OTHER_CLASS_ID,
      title: 'Tarea de otra clase',
      dueDate: '2026-08-19',
    },
  ];
  const submissions: AssignmentSubmission[] = [
    {
      id: 'sub-1',
      assignmentId: 'as-1',
      studentId: 's-1',
      status: 'submitted',
    },
    {
      id: 'sub-other',
      assignmentId: 'as-other',
      studentId: 's-3',
      status: 'pending',
    },
  ];

  return {
    teacher: { id: 'teacher-1', name: 'Laura Martínez', email: 'l@t.es' },
    activeClassId: ACTIVE_CLASS_ID,
    classes,
    schoolDays: SCHOOL_DAYS,
    students,
    attendance,
    assignments,
    submissions,
    annotations: [] as Annotation[],
    mails: [] as Mail[],
  };
}

/** Destinatarios disponibles para el selector de Nuevo Mail. */
export const AVAILABLE_RECIPIENTS: MailRecipientRef[] = [
  { kind: 'family', id: 'family-s-1', label: 'Familia de Ana' },
  { kind: 'family', id: 'family-s-2', label: 'Familia de Bruno' },
  { kind: 'group', id: `group-${ACTIVE_CLASS_ID}`, label: '1.º BACHILLER D' },
  { kind: 'group', id: `group-${OTHER_CLASS_ID}`, label: '2 ESO G' },
];

/**
 * Stub completo del puerto `SchoolRepository`: consultas servidas desde el
 * fixture de centro completo y escrituras resueltas con objetos mínimos.
 * Cada test sobreescribe solo lo que necesita observar.
 */
export function createSchoolRepositoryStub(
  overrides: Partial<SchoolRepository> = {},
): jest.Mocked<SchoolRepository> {
  const bootstrap = createWholeSchoolBootstrap();
  const stub: SchoolRepository = {
    getBootstrap: jest.fn(async () => createWholeSchoolBootstrap()),
    getMe: jest.fn(async () => ({
      teacher: bootstrap.teacher,
      activeClass: bootstrap.classes[0]!,
    })),
    getClasses: jest.fn(async () => bootstrap.classes),
    getStudents: jest.fn(async (classId: string) =>
      bootstrap.students.filter((student) => student.classId === classId),
    ),
    getStudentProgress: jest.fn(async (studentId: string) => ({
      student: bootstrap.students.find((student) => student.id === studentId)!,
      class: bootstrap.classes[0]!,
      attendance: {
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendanceRate: 0,
      },
      annotations: {
        positive: 0,
        contrary: 0,
        aggravating: 0,
        unmanaged: 0,
      },
      tasks: { total: 0, submitted: 0, notSubmitted: 0, pending: 0 },
    })),
    getAnnotations: jest.fn(async () => []),
    getMails: jest.fn(async () => []),
    searchRecipients: jest.fn(async () => AVAILABLE_RECIPIENTS),
    setAttendanceStatus: jest.fn(async (input): Promise<AttendanceRecord> => ({
      id: `att-new-${input.studentId}`,
      ...input,
    })),
    setSubmissionStatus: jest.fn(
      async (input): Promise<AssignmentSubmission> => ({
        id: `sub-new-${input.studentId}`,
        assignmentId: input.assignmentId,
        studentId: input.studentId,
        status: input.status,
      }),
    ),
    createAnnotation: jest.fn(async () => {
      throw new Error('createAnnotation no implementado en el stub');
    }),
    setAnnotationManaged: jest.fn(async () => {
      throw new Error('setAnnotationManaged no implementado en el stub');
    }),
    updateStudentName: jest.fn(async () => {
      throw new Error('updateStudentName no implementado en el stub');
    }),
    deleteStudentCascade: jest.fn(async () => undefined),
    setMailRead: jest.fn(async () => {
      throw new Error('setMailRead no implementado en el stub');
    }),
    sendMail: jest.fn(async (input): Promise<Mail> => ({
      id: 'mail-new',
      folder: 'sent',
      senderStudentId: null,
      senderLabel: bootstrap.teacher.name,
      subject: input.subject,
      body: input.body,
      preview: input.body.slice(0, 60),
      receivedAt: new Date('2026-08-19T10:00:00'),
      isRead: true,
      recipients: [],
    })),
  };
  return Object.assign(stub, overrides) as jest.Mocked<SchoolRepository>;
}
