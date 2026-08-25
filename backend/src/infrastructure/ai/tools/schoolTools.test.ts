import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchoolService } from '../../../application/schoolService.js';
import { createMemorySchoolRepository } from '../../memory/index.js';
import { createSchoolTools, SCHOOL_TOOL_NAMES } from './index.js';

/**
 * Tests unitarios de las tools SIN invocar un modelo real (issue #69): se
 * ejecuta directamente el `execute` de cada herramienta contra los servicios
 * de aplicación sobre el seed determinista.
 */
const REFERENCE_DATE = new Date(2026, 7, 21); // viernes 2026-08-21

function createContext() {
  const service = new SchoolService(
    createMemorySchoolRepository(REFERENCE_DATE),
  );
  const context = {
    service,
    now: () => new Date('2026-08-21T12:00:00Z'), // 14:00 Madrid → hoy = 2026-08-21
  };
  const tools = createSchoolTools(context);
  return { service, tools };
}

async function executeTool(
  tools: ReturnType<typeof createSchoolTools>,
  name: string,
  input: unknown,
): Promise<unknown> {
  const definition = (tools as Record<string, never>)[name] as unknown as {
    execute?: (input: unknown) => Promise<unknown>;
  };
  assert.ok(
    typeof definition?.execute === 'function',
    `tool ${name} sin execute`,
  );
  return definition.execute(input);
}

describe('catálogo de tools escolares', () => {
  it('expone exactamente el catálogo mínimo de la issue #69', () => {
    const { tools } = createContext();
    for (const name of SCHOOL_TOOL_NAMES) {
      assert.ok(name in tools, `falta la tool ${name}`);
    }
    assert.equal(Object.keys(tools).length, SCHOOL_TOOL_NAMES.length);
  });
});

describe('tools de clases y alumnado', () => {
  it('getDashboardSummary resume la clase activa del docente', async () => {
    const { tools } = createContext();
    const result = (await executeTool(tools, 'getDashboardSummary', {})) as {
      teacher: { name: string };
      activeClass: { id: string };
      totalStudents: number;
      attendanceToday: { present: number; absent: number; late: number };
    };
    assert.equal(result.teacher.name, 'Laura Martínez');
    assert.equal(result.activeClass.id, 'class-1');
    assert.ok(result.totalStudents > 0);
    assert.ok('unrecorded' in result.attendanceToday);
  });

  it('listClasses devuelve las seis clases del seed', async () => {
    const { tools } = createContext();
    const result = (await executeTool(tools, 'listClasses', {})) as {
      count: number;
    };
    assert.equal(result.count, 6);
  });

  it('findStudents filtra por nombre y devuelve className', async () => {
    const { tools } = createContext();
    const all = (await executeTool(tools, 'findStudents', {
      classId: 'class-1',
    })) as { students: Array<{ id: string; fullName: string }> };
    assert.ok(all.students.length > 0);
    const first = all.students[0]!;
    const byQuery = (await executeTool(tools, 'findStudents', {
      query: first.fullName.split(' ')[0],
    })) as { count: number; students: unknown[] };
    assert.ok(byQuery.count >= 1);
    // Caso de cero resultados explícito.
    const none = (await executeTool(tools, 'findStudents', {
      query: 'zzz-inexistente',
    })) as { count: number; students: unknown[] };
    assert.equal(none.count, 0);
    assert.deepEqual(none.students, []);
  });

  it('normaliza errores de dominio como { error } sin romper la petición', async () => {
    const { tools } = createContext();
    const result = (await executeTool(tools, 'getClassSummary', {
      classId: 'clase-fantasma',
    })) as { error: { code: string } };
    assert.equal(result.error.code, 'NOT_FOUND');
  });
});

describe('tools de asistencia', () => {
  it('listClassAbsences resuelve «hoy» contra Europe/Madrid y cuenta ausentes', async () => {
    const { tools } = createContext();
    const result = (await executeTool(tools, 'listClassAbsences', {
      classId: 'class-1',
      date: 'hoy',
    })) as {
      date: string;
      class: { id: string; name: string };
      absentStudents: Array<{ id: string; fullName: string }>;
      count: number;
      totalStudents: number;
    };
    assert.equal(result.date, '2026-08-21'); // primer día lectivo del seed
    assert.equal(result.class.id, 'class-1');
    assert.equal(result.absentStudents.length, result.count);
    assert.ok(result.totalStudents >= 20 && result.totalStudents <= 30);
  });

  it('getClassAttendance sin rango devuelve todo el historial (no solo hoy)', async () => {
    const { tools, service } = createContext();
    const all = (await executeTool(tools, 'getClassAttendance', {
      classId: 'class-1',
    })) as {
      totalRecords: number;
      days: Array<{ date: string }>;
    };
    // Seed determinista: 10 días lectivos → varios días en el historial
    assert.ok(all.days.length > 1);
    assert.ok(all.totalRecords > 0);
    const filtered = (await executeTool(tools, 'getClassAttendance', {
      classId: 'class-1',
      from: 'hoy',
      to: 'hoy',
    })) as { totalRecords: number; days: Array<{ date: string }> };
    assert.equal(filtered.days.length, 1);
    assert.equal(filtered.days[0]!.date, '2026-08-21');
    assert.ok(all.totalRecords >= filtered.totalRecords);
    // Coherencia con el servicio: sin rango = sin filtro de fechas
    const directAll = await service.listClassAttendance('class-1');
    assert.equal(all.totalRecords, directAll.length);
  });

  it('getClassAttendance resuelve «ayer» en Europe/Madrid', async () => {
    const { tools } = createContext();
    const result = (await executeTool(tools, 'getClassAttendance', {
      classId: 'class-1',
      from: 'ayer',
      to: 'ayer',
    })) as { days: Array<{ date: string }> };
    assert.equal(result.days[0]!.date, '2026-08-20');
  });

  it('getStudentAttendanceSummary agrega recuentos coherentes', async () => {
    const { tools } = createContext();
    const students = (await executeTool(tools, 'findStudents', {
      classId: 'class-1',
      limit: 1,
    })) as { students: Array<{ id: string }> };
    const result = (await executeTool(tools, 'getStudentAttendanceSummary', {
      studentId: students.students[0]!.id,
    })) as {
      totalDays: number;
      present: number;
      absent: number;
      late: number;
    };
    assert.equal(
      result.present + result.absent + result.late,
      result.totalDays,
    );
  });
});

describe('tools de tareas, anotaciones y correo', () => {
  it('listMissingSubmissions solo incluye no entregadas con nombres', async () => {
    const { tools } = createContext();
    const assignments = (await executeTool(tools, 'listAssignments', {
      classId: 'class-1',
      limit: 1,
    })) as { assignments: Array<{ id: string }> };
    const result = (await executeTool(tools, 'listMissingSubmissions', {
      assignmentId: assignments.assignments[0]!.id,
    })) as {
      missingStudents: Array<{ id: string; fullName: string }>;
    };
    assert.ok(Array.isArray(result.missingStudents));
  });

  it('searchAnnotations respeta cero resultados y listUnmanagedAnnotations filtra gestionadas', async () => {
    const { tools } = createContext();
    const none = (await executeTool(tools, 'searchAnnotations', {
      query: 'zzz-imposible-de-encontrar',
    })) as { count: number; annotations: unknown[] };
    assert.equal(none.count, 0);
    const unmanaged = (await executeTool(tools, 'listUnmanagedAnnotations', {
      limit: 5,
    })) as {
      annotations: Array<{ managed: boolean; createdAt: string }>;
    };
    for (const annotation of unmanaged.annotations) {
      assert.equal(annotation.managed, false);
      assert.ok(!Number.isNaN(Date.parse(annotation.createdAt)));
    }
  });

  it('countUnreadMails devuelve número y searchMails caso vacío', async () => {
    const { tools } = createContext();
    const unread = (await executeTool(tools, 'countUnreadMails', {
      folder: 'inbox',
    })) as { folder: string; unreadCount: number };
    assert.equal(unread.folder, 'inbox');
    assert.ok(unread.unreadCount >= 0);
    const search = (await executeTool(tools, 'searchMails', {
      query: 'zzz-imposible',
    })) as { count: number; mails: unknown[] };
    assert.equal(search.count, 0);
    assert.deepEqual(search.mails, []);
  });
});

describe('tools de señales descriptivas', () => {
  it('getStudentRiskSignals devuelve solo hechos observables, sin umbrales ni alertas', async () => {
    const { tools } = createContext();
    const students = (await executeTool(tools, 'findStudents', {
      limit: 1,
    })) as { students: Array<{ id: string }> };
    const result = (await executeTool(tools, 'getStudentRiskSignals', {
      studentId: students.students[0]!.id,
    })) as Record<string, unknown>;
    const serialized = JSON.stringify(result);
    assert.ok(serialized.includes('Q-001'));
    assert.equal(
      'alert' in result || 'riskLevel' in result || 'score' in result,
      false,
    );
  });
});
