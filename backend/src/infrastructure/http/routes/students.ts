import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import {
  dateRangeQuerySchema,
  studentIdParamSchema,
  studentPatchBodySchema,
} from '../schemas.js';
import { toStudentDto } from '../dto.js';
import { singleQuery } from './classes.js';

/** Alumnado: ficha, progreso, edición limitada y borrado en cascada. */
export function createStudentsRouter(service: SchoolService): Router {
  const router = Router();

  router.get('/v1/students/:studentId', async (req, res) => {
    const { studentId } = parseWith(studentIdParamSchema, req.params);
    res.json(await service.getStudentDetail(studentId));
  });

  router.get('/v1/students/:studentId/progress', async (req, res) => {
    const { studentId } = parseWith(studentIdParamSchema, req.params);
    res.json(await service.getStudentProgress(studentId));
  });

  router.get('/v1/students/:studentId/attendance', async (req, res) => {
    const { studentId } = parseWith(studentIdParamSchema, req.params);
    const { from, to } = parseWith(dateRangeQuerySchema, {
      from: singleQuery(req.query.from),
      to: singleQuery(req.query.to),
    });
    res.json(await service.getStudentAttendance(studentId, from, to));
  });

  // Edición limitada del MVP (Q-014 abierta): solo firstName/lastName.
  router.patch('/v1/students/:studentId', async (req, res) => {
    const { studentId } = parseWith(studentIdParamSchema, req.params);
    const patch = parseWith(studentPatchBodySchema, req.body);
    res.json(toStudentDto(await service.updateStudent(studentId, patch)));
  });

  // Borrado coherente de relaciones (cascada completa).
  router.delete('/v1/students/:studentId', async (req, res) => {
    const { studentId } = parseWith(studentIdParamSchema, req.params);
    await service.deleteStudent(studentId);
    res.status(204).send();
  });

  return router;
}
