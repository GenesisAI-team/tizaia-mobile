import {
  toAnnotation,
  toAnnotationListItem,
  toAttendanceBoard,
  toAttendanceRecord,
  toMail,
  toMe,
  toSchoolBootstrap,
  toStudentProgress,
  toTaskBoard,
} from './mappers';

describe('mappers (DTO → dominio)', () => {
  it('toMail parsea fechas ISO y admite remitente nulo (mail enviado)', () => {
    const mail = toMail({
      id: 'mail-30',
      folder: 'sent',
      senderStudentId: null,
      senderLabel: 'Laura Martínez',
      subject: 'Salida al museo',
      body: 'Confirmad asistencia.',
      preview: 'Confirmad asistencia.',
      receivedAt: '2026-08-21T10:00:00.000Z',
      isRead: true,
      recipients: [
        { kind: 'group', id: 'group-class-1', label: '1.º BACHILLER D' },
      ],
    });

    expect(mail.receivedAt).toBeInstanceOf(Date);
    expect(mail.senderStudentId).toBeNull();
    expect(mail.folder).toBe('sent');
    expect(mail.recipients[0]).toEqual({
      kind: 'group',
      id: 'group-class-1',
      label: '1.º BACHILLER D',
    });
  });

  it('toAnnotation convierte createdAt a Date y conserva managed', () => {
    const annotation = toAnnotation({
      id: 'annotation-9',
      studentId: 'student-3',
      type: 'positive',
      description: 'Ayudó a un compañero.',
      managed: true,
      createdAt: '2026-08-19T09:30:00.000Z',
    });

    expect(annotation.createdAt).toBeInstanceOf(Date);
    expect(annotation.managed).toBe(true);
    expect(annotation.type).toBe('positive');
  });

  it('rechaza literales de unión desconocidos en lugar de propagarlos', () => {
    expect(() =>
      toAnnotation({
        id: 'a',
        studentId: 's',
        type: 'expulsado',
        description: '',
        managed: false,
        createdAt: '2026-08-19T09:30:00.000Z',
      }),
    ).toThrow(/Tipo de anotación desconocido/);

    expect(() =>
      toAttendanceRecord({
        id: 'r',
        studentId: 's',
        date: '2026-08-21',
        status: 'expulsado',
      } as Parameters<typeof toAttendanceRecord>[0]),
    ).toThrow(/Estado de asistencia desconocido/);
  });

  it('toMe exige clase activa en la respuesta', () => {
    expect(() => toMe({ teacher: { id: 't', name: 'L', email: 'e' } })).toThrow(
      /clase activa/,
    );
  });

  it('toSchoolBootstrap mapea el contexto mínimo sin overfetch', () => {
    const bootstrap = toSchoolBootstrap({
      teacher: { id: 'teacher-1', name: 'Laura', email: 'l@tizaia.es' },
      activeClassId: 'class-1',
      classes: [
        { id: 'class-1', groupName: '1.º BACHILLER D', subject: 'Tecno' },
      ],
    });

    expect(bootstrap.teacher.name).toBe('Laura');
    expect(bootstrap.activeClassId).toBe('class-1');
    expect(bootstrap.classes[0]!.groupName).toBe('1.º BACHILLER D');
    expect(
      (bootstrap as unknown as { students: unknown }).students,
    ).toBeUndefined();
  });

  it('toAttendanceBoard y toTaskBoard mapean agregados por clase sin mezclar', () => {
    const board = toAttendanceBoard({
      students: [
        {
          id: 'student-1',
          classId: 'class-1',
          firstName: 'Ada',
          lastName: 'López',
          birthDate: '2009-01-01',
          schoolEmail: 'ada@edu.es',
          description: null,
        },
      ],
      schoolDays: [
        { date: '2026-08-21', label: 'Vie', secondaryLabel: '21/08' },
      ],
      attendance: [
        {
          id: 'att-1',
          studentId: 'student-1',
          date: '2026-08-21',
          status: 'present',
        },
      ],
    });
    expect(board.students[0]!.firstName).toBe('Ada');
    expect(board.attendance[0]!.status).toBe('present');

    const taskBoard = toTaskBoard({
      students: [
        {
          id: 'student-1',
          classId: 'class-1',
          firstName: 'Ada',
          lastName: 'López',
          birthDate: '2009-01-01',
          schoolEmail: 'ada@edu.es',
          description: null,
        },
      ],
      assignments: [
        {
          id: 'asg-1',
          classId: 'class-1',
          title: 'Práctica 1',
          dueDate: '2026-08-21',
        },
      ],
      submissions: [
        {
          id: 'sub-1',
          assignmentId: 'asg-1',
          studentId: 'student-1',
          status: 'submitted',
        },
      ],
    });
    expect(taskBoard.assignments[0]!.title).toBe('Práctica 1');
    expect(taskBoard.submissions[0]!.status).toBe('submitted');
  });

  it('toAnnotationListItem enriquece con studentName/initials', () => {
    const item = toAnnotationListItem({
      id: 'ann-1',
      studentId: 'student-1',
      type: 'positive',
      description: 'Buena',
      managed: false,
      createdAt: '2026-08-19T10:00:00.000Z',
      studentName: 'Ada López',
      studentInitials: 'AL',
    });
    expect(item.studentName).toBe('Ada López');
    expect(item.studentInitials).toBe('AL');
    expect(item.createdAt).toBeInstanceOf(Date);
  });

  it('toStudentProgress traslada los agregados de seguimiento', () => {
    const progress = toStudentProgress({
      student: {
        id: 'student-1',
        classId: 'class-1',
        firstName: 'Ada',
        lastName: 'López',
        birthDate: '2009-01-01',
        schoolEmail: 'ada@edu.es',
        description: null,
      },
      class: { id: 'class-1', groupName: '1.º BACHILLER D', subject: 'Tecno' },
      attendance: {
        totalDays: 10,
        present: 8,
        absent: 1,
        late: 1,
        attendanceRate: 90,
      },
      annotations: { positive: 2, contrary: 0, aggravating: 0, unmanaged: 1 },
      tasks: { total: 5, submitted: 4, notSubmitted: 0, pending: 1 },
    });

    expect(progress.attendance.attendanceRate).toBe(90);
    expect(progress.annotations.positive).toBe(2);
    expect(progress.tasks.pending).toBe(1);
  });
});
