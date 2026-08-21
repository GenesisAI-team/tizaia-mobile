import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import {
  attendanceParamsSchema,
  attendanceStatusBodySchema,
} from '../schemas.js';
import { toAttendanceDto } from '../dto.js';

/** Asistencia individual: `PUT /v1/attendance/:classId/:studentId/:date`. */
export function createAttendanceRouter(service: SchoolService): Router {
  const router = Router();

  router.put('/v1/attendance/:classId/:studentId/:date', (req, res) => {
    const params = parseWith(attendanceParamsSchema, req.params);
    const body = parseWith(attendanceStatusBodySchema, req.body);
    const record = service.setAttendance({ ...params, status: body.status });
    res.json(toAttendanceDto(record));
  });

  return router;
}
