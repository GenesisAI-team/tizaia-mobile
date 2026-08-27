import type {
  Annotation,
  AnnotationListItem,
  Assignment,
  AssignmentSubmission,
  AttendanceBoard,
  AttendanceRecord,
  Mail,
  MailRecipientRef,
  SchoolBootstrap,
  SchoolClass,
  SchoolDay,
  Student,
  TaskBoard,
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

/** Fixture mínimo de bootstrap (#76): solo contexto global. */
export function createBootstrapFixture(): SchoolBootstrap {
  return {
    teacher: { id: 'teacher-1', name: 'Laura Martínez', email: 'l@t.es' },
    activeClassId: ACTIVE_CLASS_ID,
    classes: [
      {
        id: ACTIVE_CLASS_ID,
        groupName: '1.º BACHILLER D',
        subject: 'Tecnología',
      },
      { id: OTHER_CLASS_ID, groupName: '2 ESO G', subject: 'Tecnología' },
    ],
  };
}

/** Fixture completo previo (#76) ahora solo para selector legacy; expone todo el centro. */
export function createWholeSchoolBootstrap(): SchoolBootstrap & {
  schoolDays: SchoolDay[];
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  annotations: Annotation[];
  mails: Mail[];
} {
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

export function createAttendanceBoardFixture(
  overrides?: Partial<AttendanceBoard>,
): AttendanceBoard {
  const bootstrap = createWholeSchoolBootstrap();
  return {
    students: bootstrap.students.filter((s) => s.classId === ACTIVE_CLASS_ID),
    schoolDays: [...SCHOOL_DAYS],
    attendance: bootstrap.attendance.filter((r) =>
      bootstrap.students.some(
        (s) => s.id === r.studentId && s.classId === ACTIVE_CLASS_ID,
      ),
    ),
    ...overrides,
  };
}

export function createTaskBoardFixture(
  overrides?: Partial<TaskBoard>,
): TaskBoard {
  const bootstrap = createWholeSchoolBootstrap();
  const assignments = bootstrap.assignments.filter(
    (a) => a.classId === ACTIVE_CLASS_ID,
  );
  const assignmentIds = new Set(assignments.map((a) => a.id));
  return {
    students: bootstrap.students.filter((s) => s.classId === ACTIVE_CLASS_ID),
    assignments,
    submissions: bootstrap.submissions.filter((s) =>
      assignmentIds.has(s.assignmentId),
    ),
    ...overrides,
  };
}

export function createAnnotationListFixture(): AnnotationListItem[] {
  return [
    {
      id: 'ann-1',
      studentId: 's-1',
      studentName: 'Ana García',
      studentInitials: 'AG',
      type: 'positive',
      description: 'Buena participación',
      managed: false,
      createdAt: new Date('2026-08-19T10:00:00'),
    },
    {
      id: 'ann-2',
      studentId: 's-2',
      studentName: 'Bruno Díaz',
      studentInitials: 'BD',
      type: 'contrary',
      description: 'Retraso',
      managed: true,
      createdAt: new Date('2026-08-18T10:00:00'),
    },
  ];
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
  const bootstrap = createBootstrapFixture();
  const whole = createWholeSchoolBootstrap();
  const stub: SchoolRepository = {
    getBootstrap: jest.fn(async () => createBootstrapFixture()),
    getMe: jest.fn(async () => ({
      teacher: bootstrap.teacher,
      activeClass: bootstrap.classes[0]!,
    })),
    getClasses: jest.fn(async () => bootstrap.classes),
    getStudents: jest.fn(async (classId: string) =>
      whole.students.filter((student) => student.classId === classId),
    ),
    getStudentProgress: jest.fn(async (studentId: string) => ({
      student: whole.students.find((student) => student.id === studentId)!,
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
    getAttendanceBoard: jest.fn(async (classId: string) => {
      const board = createAttendanceBoardFixture();
      if (classId === ACTIVE_CLASS_ID) return board;
      return { students: [], schoolDays: [...SCHOOL_DAYS], attendance: [] };
    }),
    getTaskBoard: jest.fn(async (classId: string) => {
      const board = createTaskBoardFixture();
      if (classId === ACTIVE_CLASS_ID) return board;
      return { students: [], assignments: [], submissions: [] };
    }),
    getAnnotations: jest.fn(async () => createAnnotationListFixture()),
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
