import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createSeedData } from './createSeedData.js';
import { REFERENCE_DATE } from '../test/helpers.js';

describe('createSeedData', () => {
  const seed = createSeedData(REFERENCE_DATE);

  it('es determinista para la misma fecha de referencia', () => {
    const second = createSeedData(REFERENCE_DATE);
    assert.equal(JSON.stringify(second), JSON.stringify(seed));
  });

  it('mantiene el volumen del mock móvil', () => {
    assert.equal(seed.classes.length, 6);
    assert.equal(seed.schoolDays.length, 10);
    assert.equal(seed.mails.length, 30);
    for (const schoolClass of seed.classes) {
      const classStudents = seed.students.filter(
        (student) => student.classId === schoolClass.id,
      );
      assert.ok(
        classStudents.length >= 20 && classStudents.length <= 30,
        `La clase ${schoolClass.id} debe tener 20-30 alumnos`,
      );
      const classAssignments = seed.assignments.filter(
        (assignment) => assignment.classId === schoolClass.id,
      );
      assert.equal(classAssignments.length, 10);
      const classAnnotations = seed.annotations.filter((annotation) => {
        const student = seed.students.find(
          (item) => item.id === annotation.studentId,
        );
        return student?.classId === schoolClass.id;
      });
      assert.ok(
        classAnnotations.length >= 2 && classAnnotations.length <= 3,
        `La clase ${schoolClass.id} debe tener 2-3 anotaciones`,
      );
      for (const assignment of classAssignments) {
        const submissions = seed.submissions.filter(
          (submission) => submission.assignmentId === assignment.id,
        );
        assert.equal(submissions.length, classStudents.length);
      }
    }
    // Cada alumno con un registro de asistencia por día lectivo.
    const totalAttendance = seed.classes.reduce((sum, schoolClass) => {
      const classStudents = seed.students.filter(
        (student) => student.classId === schoolClass.id,
      );
      return sum + classStudents.length * seed.schoolDays.length;
    }, 0);
    assert.equal(seed.attendance.length, totalAttendance);
  });

  it('conserva docente demo y clase activa', () => {
    assert.deepEqual(seed.teacher, {
      id: 'teacher-1',
      name: 'Laura Martínez',
      email: 'laura@tizaia.es',
    });
    assert.equal(seed.activeClassId, 'class-1');
  });

  it('genera días lectivos lun-vie en orden descendente', () => {
    const weekdayLabels = new Set(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
    for (let index = 0; index < seed.schoolDays.length; index += 1) {
      const day = seed.schoolDays[index]!;
      assert.ok(weekdayLabels.has(day.label), `${day.date} debe ser lectivo`);
      if (index > 0) {
        assert.ok(day.date < seed.schoolDays[index - 1]!.date);
      }
    }
  });

  it('añade los campos mínimos nuevos sin inventar lógica normativa', () => {
    assert.ok(seed.students.length > 0);
    const isoDate = /^\d{4}-\d{2}-\d{2}$/;
    for (const student of seed.students) {
      assert.match(student.birthDate, isoDate);
      const year = Number(student.birthDate.slice(0, 4));
      assert.ok(year >= 2007 && year <= 2014, `Año razonable: ${year}`);
      assert.match(student.schoolEmail, /@alumnos\.tizaia\.es$/);
    }
    assert.equal(seed.contacts.length, seed.students.length * 2);
    for (const contact of seed.contacts) {
      assert.ok(['madre', 'padre'].includes(contact.relationship));
    }
    for (const annotation of seed.annotations) {
      assert.equal(typeof annotation.managed, 'boolean');
    }
    for (const mail of seed.mails) {
      assert.equal(mail.folder, 'inbox');
      assert.ok(mail.body.length > mail.preview.length - 10);
      assert.notEqual(mail.senderStudentId, null);
    }
  });
});
