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
  StudentContact,
  SubmissionStatus,
  Teacher,
} from '../domain/models.js';
import {
  getDayMonthLabel,
  getRecentSchoolDays,
  getWeekdayLabel,
  toDateFromIso,
} from './schoolDates.js';

/**
 * Seeds deterministas del MVP. Reproducen el volumen y las relaciones del mock
 * móvil (`mobile/src/infrastructure/in-memory/mockSchoolData.ts`, semilla
 * `20260819`) y añaden los campos mínimos de la issue #67: fecha de nacimiento,
 * correo educativo, contactos, cuerpo/destinatarios de correo y estado
 * gestionado de anotaciones. No se inventa lógica normativa (Q-001 abierta).
 */

export type SeedData = {
  teacher: Teacher;
  activeClassId: string;
  classes: SchoolClass[];
  students: Student[];
  contacts: StudentContact[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  annotations: Annotation[];
  mails: Mail[];
  schoolDays: SchoolDay[];
};

const TEACHER: Teacher = {
  id: 'teacher-1',
  name: 'Laura Martínez',
  email: 'laura@tizaia.es',
};

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

const MAIL_BODY_CLOSINGS: readonly string[] = [
  'Gracias por su atención, quedo a la espera de su respuesta.',
  'Cualquier duda, no dude en responder a este correo.',
  'Un saludo y gracias por su tiempo.',
  'Agradezco de antemano su atención.',
];

const ANNOTATION_DESCRIPTIONS: Record<Annotation['type'], readonly string[]> = {
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

/** Año de nacimiento aproximado por curso (curso 2025-2026 / demo 2026). */
const BIRTH_YEAR_BY_GROUP: readonly {
  prefix: string;
  year: number;
}[] = [
  { prefix: '2.º BACHILLER', year: 2008 },
  { prefix: '1.º BACHILLER', year: 2009 },
  { prefix: '4 ESO', year: 2010 },
  { prefix: '3 ESO', year: 2011 },
  { prefix: '2º ESO', year: 2012 },
  { prefix: '2 ESO', year: 2012 },
  { prefix: '1 ESO', year: 2013 },
];

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (random: () => number, min: number, max: number): number =>
  min + Math.floor(random() * (max - min + 1));

const pick = <T>(random: () => number, values: readonly T[]): T =>
  values[Math.floor(random() * values.length)]!;

const describe = (template: string, firstName: string): string =>
  template.replace('{firstName}', firstName);

/** Elimina acentos y normaliza para correos deterministas. */
export const slugifyName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const birthYearForGroup = (groupName: string): number => {
  const match = BIRTH_YEAR_BY_GROUP.find((entry) =>
    groupName.startsWith(entry.prefix),
  );
  return match?.year ?? 2010;
};

/**
 * Genera el dataset demo determinista. Misma semilla (`20260819`) y mismas
 * relaciones por identificador que el mock móvil.
 */
export function createSeedData(referenceDate: Date): SeedData {
  const random = mulberry32(20260819);

  const schoolDays: SchoolDay[] = getRecentSchoolDays(referenceDate, 10).map(
    (date) => ({
      date,
      label: getWeekdayLabel(date),
      secondaryLabel: getDayMonthLabel(date),
    }),
  );

  const students: Student[] = [];
  const contacts: StudentContact[] = [];
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
    const birthYear = birthYearForGroup(schoolClass.groupName);

    for (let index = 0; index < classSize; index += 1) {
      const studentNumber = students.length + 1;
      const studentId = `student-${studentNumber}`;
      const firstName = pick(random, FIRST_NAMES);
      const lastName = pick(random, LAST_NAMES);
      const lastSlug = slugifyName(lastName);

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
        birthDate: `${birthYear}-${pad(String(randInt(random, 1, 12)))}-${pad(
          String(randInt(random, 1, 28)),
        )}`,
        schoolEmail: `${slugifyName(firstName)}.${lastSlug}${studentNumber}@alumnos.tizaia.es`,
        description,
      });

      // Contactos familiares mínimos (madre y padre deterministas).
      contacts.push({
        id: `contact-${contacts.length}`,
        studentId,
        fullName: `Ana ${lastName}`,
        relationship: 'madre',
        email: `ana.${lastSlug}.m${studentNumber}@familia.tizaia.es`,
      });
      contacts.push({
        id: `contact-${contacts.length}`,
        studentId,
        fullName: `José ${lastName}`,
        relationship: 'padre',
        email: `jose.${lastSlug}.p${studentNumber}@familia.tizaia.es`,
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
        managed: random() < 0.4,
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
    const subject = pick(random, MAIL_SUBJECTS);
    const preview = pick(random, MAIL_PREVIEWS);
    const closing = pick(random, MAIL_BODY_CLOSINGS);
    const body = `${preview.slice(0, -1)}. ${closing}`;
    mails.push({
      id: `mail-${mailSeq}`,
      folder: 'inbox',
      senderStudentId: sender.id,
      senderLabel: `${sender.firstName} ${sender.lastName}`,
      subject,
      body,
      preview,
      receivedAt: toDateFromIso(
        day.date,
        randInt(random, 8, 20),
        randInt(random, 0, 59),
      ),
      isRead: random() < 0.6,
      recipients: [],
    });
    mailSeq += 1;
  }

  return {
    teacher: TEACHER,
    activeClassId: CLASSES[0]?.id ?? 'class-1',
    classes: [...CLASSES],
    students,
    contacts,
    attendance,
    assignments,
    submissions,
    annotations,
    mails,
    schoolDays,
  };
}

function pad(value: number | string): string {
  return String(value).padStart(2, '0');
}
