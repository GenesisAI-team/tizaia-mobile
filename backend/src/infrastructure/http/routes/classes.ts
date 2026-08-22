import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import { classIdParamSchema, dateRangeQuerySchema } from '../schemas.js';

/**
 * Clases: listado, detalle, resumen, alumnado, asistencia por rango y tareas.
 */
export function createClassesRouter(service: SchoolService): Router {
  const router = Router();

  router.get('/v1/classes', async (_req, res) => {
    res.json(await service.listClasses());
  });

  router.get('/v1/classes/:classId', async (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(await service.getClass(classId));
  });

  router.get('/v1/classes/:classId/summary', async (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(await service.getClassSummary(classId));
  });

  router.get('/v1/classes/:classId/students', async (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(await service.listStudents(classId));
  });

  router.get('/v1/classes/:classId/attendance', async (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    const { from, to } = parseWith(dateRangeQuerySchema, {
      from: singleQuery(req.query.from),
      to: singleQuery(req.query.to),
    });
    res.json(await service.listClassAttendance(classId, from, to));
  });

  router.get('/v1/classes/:classId/assignments', async (req, res) => {
    const { classId } = parseWith(classIdParamSchema, req.params);
    res.json(await service.listAssignments(classId));
  });

  return router;
}

/** Express devuelve `string | string[] | ParsedQs | ...`: nos quedamos con el primer string. */
export function singleQuery(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}
