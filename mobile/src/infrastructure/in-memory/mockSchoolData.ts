import type {
  Annotation,
  AnnotationType,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  AttendanceStatus,
  Mail,
  SchoolClass,
  SchoolDay,
  Student,
  SubmissionStatus,
} from '../../domain/school/models';
import {
  getDayMonthLabel,
  getRecentSchoolDays,
  getWeekdayLabel,
} from '../../domain/school/schoolDates';

export type MockSchoolData = {
  classes: SchoolClass[];
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  annotations: Annotation[];
  mails: Mail[];
  schoolDays: SchoolDay[];
};

/**
 * Las seis clases que existen hoy en `ClassesScreen` (MOCK_CLASSES): se
 * conservan exactamente el `groupName` y la asignatura.
 */
const CLASSES: readonly SchoolClass[] = [
  { id: 'class-1', groupName: '1.º BACHILLER D', subject: 'Tecnología' },
  { id: 'class-2', groupName: '2 ESO G', subject: 'Tecnología' },
  { id: 'class-3', groupName: '2º ESO C/D', subject: 'Tecnología' },
  { id: 'class-4', groupName: '3 ESO A', subject: 'Matemáticas' },
  { id: 'class-5', groupName: '1 ESO B', subject: 'Tecnología' },
  { id: 'class-6', groupName: '4 ESO C', subject: 'Física' },
];

const FIRST_NAMES: readonly string[] = [
  'Álvaro',
  'Lucía',
  'Pablo',
  'María',
  'Diego',
  'Carmen',
  'Javier',
  'Sofía',
  'Daniel',
  'Paula',
  'Adrián',
  'Marta',
  'Sergio',
  'Elena',
  'Carlos',
  'Laura',
  'Iván',
  'Clara',
  'Rubén',
  'Alba',
  'Hugo',
  'Nora',
  'Marcos',
  'Valeria',
  'Alejandro',
  'Jimena',
  'David',
  'Vega',
  'Mario',
  'Irene',
  'Gonzalo',
  'Aitana',
  'Ángel',
  'Nerea',
  'Lucas',
  'Alicia',
  'Bruno',
  'Candela',
  'Iker',
  'Lara',
];

const LAST_NAMES: readonly string[] = [
  'García',
  'Rodríguez',
  'González',
  'Fernández',
  'López',
  'Martínez',
  'Sánchez',
  'Pérez',
  'Gómez',
  'Martín',
  'Jiménez',
  'Ruiz',
  'Hernández',
  'Díaz',
  'Moreno',
  'Muñoz',
  'Álvarez',
  'Romero',
  'Alonso',
  'Gutiérrez',
  'Navarro',
  'Torres',
  'Domínguez',
  'Vázquez',
  'Ramos',
  'Gil',
  'Ramírez',
  'Serrano',
  'Blanco',
  'Molina',
  'Morales',
  'Ortega',
  'Delgado',
  'Castro',
  'Ortiz',
  'Rubio',
  'Marín',
  'Sanz',
  'Iglesias',
  'Medina',
];

const GENERIC_DESCRIPTIONS: readonly string[] = [
  '{firstName} es un alumno participativo y con buena actitud en clase.',
  'Alumno trabajador que participa habitualmente y entrega sus tareas a tiempo.',
  'Mantiene una evolución positiva, aunque en ocasiones le cuesta mantener la atención.',
  'Destaca por su creatividad en los trabajos en equipo y su interés por la asignatura.',
  'Alumno con buen comportamiento, aunque debería participar algo más en clase.',
  'Le cuesta concentrarse en las últimas horas; suele terminar las actividades con ayuda.',
  'Participativo y constante; ha mejorado notablemente en el último mes.',
  'Alumno tranquilo y respetuoso, aunque necesita aumentar su participación oral.',
  'Buen compañero, colabora en grupo y muestra interés por mejorar sus resultados.',
  'Atento y ordenado, presenta las actividades con buena presentación.',
];

const ABSENCE_DESCRIPTIONS: readonly string[] = [
  'Ha faltado a clase en varias ocasiones; se recomienda reforzar el seguimiento.',
  'Acumula varias ausencias este trimestre y le cuesta seguir el ritmo de la clase.',
  'Su asistencia ha sido irregular; conviene hacer seguimiento de las faltas.',
  'Las ausencias puntuales han afectado a la entrega de algunas tareas.',
];

const SUBJECT_TITLES: Record<string, readonly string[]> = {
  Tecnología: [
    'Circuitos',
    'Práctica',
    'Proyecto',
    'Energía',
    'Diseño CAD',
    'Electricidad',
    'Robótica',
    'Mecanismos',
    'Materiales',
    'Programación',
  ],
  Matemáticas: [
    'Ecuaciones',
    'Polinomios',
    'Funciones',
    'Geometría',
    'Problemas',
    'Estadística',
    'Fracciones',
    'Proporcionalidad',
    'Derivadas',
    'Álgebra',
  ],
  Física: [
    'Cinemática',
    'Dinámica',
    'Energía',
    'Circuitos',
    'Óptica',
    'Ondas',
    'Termodinámica',
    'Laboratorio',
    'Problemas',
    'Electricidad',
  ],
};

const MAIL_SUBJECTS: readonly string[] = [
  'Reunión de tutoría',
  'Material para la próxima clase',
  'Recordatorio de entrega',
  'Excursión de final de curso',
  'Resultados de evaluación',
  'Consulta sobre tareas',
  'Justificante de ausencia',
  'Actividades extraescolares',
  'Entrega de notas',
  'Autorización de salida',
];

const MAIL_PREVIEWS: readonly string[] = [
  'Buenas tardes, le escribo para confirmar la cita de tutoría…',
  'Le adjunto el material para la próxima clase de la asignatura…',
  'Quisiera consultarle si mi hijo ha entregado la última tarea…',
  'Confirmo la asistencia a la excursión prevista para este mes…',
  'Le informo de los resultados de la última evaluación…',
  'Envío el justificante de la ausencia del pasado lunes…',
  'Quedamos atentos a su respuesta sobre las actividades propuestas…',
  'Adjunto la autorización firmada para la salida escolar…',
];

const ANNOTATION_DESCRIPTIONS: Record<AnnotationType, readonly string[]> = {
  contrary: [
    'Ha interrumpido la clase en varias ocasiones.',
    'No ha traído el material necesario.',
    'Comportamiento inadecuado durante la actividad.',
  ],
  aggravating: [
    'Conducta agravante tras una falta anterior.',
    'Reiterado incumplimiento de las normas del aula.',
  ],
  positive: [
    'Buena participación en clase.',
    'Ha ayudado a un compañero durante la actividad.',
    'Excelente trabajo en grupo.',
  ],
};

const ANNOTATION_TYPES: readonly AnnotationType[] = [
  'contrary',
  'aggravating',
  'positive',
];

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (random: () => number, min: number, max: number): number =>
  min + Math.floor(random() * (max - min + 1));

const pick = <T>(random: () => number, values: readonly T[]): T =>
  values[Math.floor(random() * values.length)]!;

const describe = (template: string, firstName: string): string =>
  template.replace('{firstName}', firstName);

const toDateFromIso = (isoDate: string, hour: number, minute: number): Date =>
  new Date(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)) - 1,
    Number(isoDate.slice(8, 10)),
    hour,
    minute,
  );

/**
 * Genera el dataset demo determinista para el MVP. Usa una semilla fija para
 * que los datos sean estables entre lanzamientos y reproduce relaciones por
 * identificador (alumno → clase, asistencia → alumno, etc.).
 */
export function createMockSchoolData(referenceDate: Date): MockSchoolData {
  const random = mulberry32(20260819);

  const schoolDays: SchoolDay[] = getRecentSchoolDays(referenceDate, 10).map(
    (date) => ({
      date,
      label: getWeekdayLabel(date),
      secondaryLabel: getDayMonthLabel(date),
    }),
  );

  const students: Student[] = [];
  const attendance: AttendanceRecord[] = [];
  const assignments: Assignment[] = [];
  const submissions: AssignmentSubmission[] = [];
  const annotations: Annotation[] = [];
  const mails: Mail[] = [];

  let attendanceSeq = 0;
  let assignmentSeq = 0;
  let submissionSeq = 0;
  let annotationSeq = 0;
  let mailSeq = 0;

  for (const schoolClass of CLASSES) {
    const classSize = randInt(random, 20, 30);

    for (let index = 0; index < classSize; index += 1) {
      const studentId = `student-${students.length + 1}`;
      const firstName = pick(random, FIRST_NAMES);
      const lastName = pick(random, LAST_NAMES);

      const tendency = random();
      const absentProbability = 0.02 + tendency * 0.22;
      const lateProbability = 0.06;
      let absences = 0;

      for (const day of schoolDays) {
        const roll = random();
        const status: AttendanceStatus =
          roll < absentProbability
            ? 'absent'
            : roll < absentProbability + lateProbability
              ? 'late'
              : 'present';
        if (status === 'absent') absences += 1;
        attendance.push({
          id: `attendance-${attendanceSeq}`,
          studentId,
          date: day.date,
          status,
        });
        attendanceSeq += 1;
      }

      const description =
        absences >= 3
          ? describe(pick(random, ABSENCE_DESCRIPTIONS), firstName)
          : describe(pick(random, GENERIC_DESCRIPTIONS), firstName);

      students.push({
        id: studentId,
        classId: schoolClass.id,
        firstName,
        lastName,
        description,
      });
    }

    const classStudents = students.filter(
      (student) => student.classId === schoolClass.id,
    );
    const titles = SUBJECT_TITLES[schoolClass.subject] ?? [];

    for (let dayIndex = 0; dayIndex < schoolDays.length; dayIndex += 1) {
      const assignmentId = `assignment-${assignmentSeq}`;
      assignments.push({
        id: assignmentId,
        classId: schoolClass.id,
        title: titles[dayIndex % titles.length] ?? 'Tarea',
        dueDate: schoolDays[dayIndex]?.date ?? '',
      });
      assignmentSeq += 1;

      for (const student of classStudents) {
        const roll = random();
        const status: SubmissionStatus =
          roll < 0.78 ? 'submitted' : roll < 0.91 ? 'notSubmitted' : 'pending';
        submissions.push({
          id: `submission-${submissionSeq}`,
          assignmentId,
          studentId: student.id,
          status,
        });
        submissionSeq += 1;
      }
    }

    const annotationCount = randInt(random, 2, 3);
    for (let index = 0; index < annotationCount; index += 1) {
      const student = pick(random, classStudents);
      const type = pick(random, ANNOTATION_TYPES);
      const day = pick(random, schoolDays);
      annotations.push({
        id: `annotation-${annotationSeq}`,
        studentId: student.id,
        type,
        description: pick(random, ANNOTATION_DESCRIPTIONS[type]),
        createdAt: toDateFromIso(
          day.date,
          randInt(random, 9, 18),
          randInt(random, 0, 59),
        ),
      });
      annotationSeq += 1;
    }
  }

  const shuffledStudents = [...students];
  for (let index = shuffledStudents.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffledStudents[index];
    const candidate = shuffledStudents[swapIndex];
    if (current === undefined || candidate === undefined) continue;
    shuffledStudents[index] = candidate;
    shuffledStudents[swapIndex] = current;
  }

  const mailSenders = shuffledStudents.slice(0, 30);
  for (const sender of mailSenders) {
    const day = pick(random, schoolDays);
    mails.push({
      id: `mail-${mailSeq}`,
      senderStudentId: sender.id,
      subject: pick(random, MAIL_SUBJECTS),
      preview: pick(random, MAIL_PREVIEWS),
      receivedAt: toDateFromIso(
        day.date,
        randInt(random, 8, 20),
        randInt(random, 0, 59),
      ),
      isRead: random() < 0.6,
    });
    mailSeq += 1;
  }

  return {
    classes: [...CLASSES],
    students,
    attendance,
    assignments,
    submissions,
    annotations,
    mails,
    schoolDays,
  };
}
