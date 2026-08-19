import type {
  Annotation,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Mail,
  SchoolClass,
  SchoolDay,
  Student,
} from '../../domain/school/models';
import type { SchoolRepository } from '../../domain/school/schoolRepository';
import { createMockSchoolData, type MockSchoolData } from './mockSchoolData';

const FALLBACK_ACTIVE_CLASS: SchoolClass = {
  id: 'class-1',
  groupName: '1.º BACHILLER D',
  subject: 'Tecnología',
};

/**
 * Repositorio demo en memoria. Genera el dataset una sola vez a partir de la
 * fecha local de inicio de la app (de ahí que las etiquetas de día dependan
 * de cuándo se lance). Sustituible por una implementación sobre Supabase.
 */
export class InMemorySchoolRepository implements SchoolRepository {
  private readonly data: MockSchoolData;
  private readonly activeClassId: string;

  constructor(referenceDate: Date = new Date()) {
    this.data = createMockSchoolData(referenceDate);
    this.activeClassId = this.data.classes[0]?.id ?? 'class-1';
  }

  getActiveClassId(): string {
    return this.activeClassId;
  }

  getActiveClass(): SchoolClass {
    return (
      this.data.classes.find(
        (schoolClass) => schoolClass.id === this.activeClassId,
      ) ??
      this.data.classes[0] ??
      FALLBACK_ACTIVE_CLASS
    );
  }

  getClasses(): SchoolClass[] {
    return this.data.classes;
  }

  getStudents(classId?: string): Student[] {
    return this.data.students.filter(
      (student) => student.classId === (classId ?? this.activeClassId),
    );
  }

  getStudent(studentId: string): Student | undefined {
    return this.data.students.find((student) => student.id === studentId);
  }

  getSchoolDays(): SchoolDay[] {
    return this.data.schoolDays;
  }

  getAttendance(studentId: string): AttendanceRecord[] {
    return this.data.attendance.filter(
      (record) => record.studentId === studentId,
    );
  }

  getAttendanceForClass(classId?: string): AttendanceRecord[] {
    const classStudentIds = new Set(
      this.getStudents(classId).map((student) => student.id),
    );
    return this.data.attendance.filter((record) =>
      classStudentIds.has(record.studentId),
    );
  }

  getAssignments(classId?: string): Assignment[] {
    return this.data.assignments.filter(
      (assignment) => assignment.classId === (classId ?? this.activeClassId),
    );
  }

  getSubmissions(assignmentId: string): AssignmentSubmission[] {
    return this.data.submissions.filter(
      (submission) => submission.assignmentId === assignmentId,
    );
  }

  getAnnotations(): Annotation[] {
    return this.data.annotations;
  }

  getMails(): Mail[] {
    return this.data.mails;
  }

  getStudentFamilyLabel(studentId: string): string {
    const student = this.getStudent(studentId);
    return student ? `Familia de ${student.firstName}` : '';
  }
}
