import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import { classIdParamSchema, dateRangeQuerySchema } from '../schemas.js';

/**
 * Clases: listado, detalle, resumen, alumnado, asistencia por rango y tareas.
 */
export function createClassesRouter(service: SchoolService): Router {
  const router = Router();

  router.get('/v1/classes', (_req, res) => {
    res.json(service.listClasses());
  });

  router.get('/v1/classes/:classId', (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(service.getClass(classId));
  });

  router.get('/v1/classes/:classId/summary', (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(service.getClassSummary(classId));
  });

  router.get('/v1/classes/:classId/students', (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(service.listStudents(classId));
  });

  router.get('/v1/classes/:classId/attendance', (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    const { from, to } = parseWith(dateRangeQuerySchema, {
      from: singleQuery(req.query.from),
      to: singleQuery(req.query.to),
    });
    res.json(service.listClassAttendance(classId, from, to));
  });

  router.get('/v1/classes/:classId/assignments', (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(service.listAssignments(classId));
  });

  return router;
}

/** Express devuelve `string | string[] | ParsedQs | ...`: nos quedamos con el primer string. */
export function singleQuery(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}
