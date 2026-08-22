import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import {
  assignmentIdParamSchema,
  submissionParamsSchema,
  submissionStatusBodySchema,
} from '../schemas.js';
import { toSubmissionDto } from '../dto.js';

/** Tareas y entregas: listado por clase y cambio de estado de entrega. */
export function createAssignmentsRouter(service: SchoolService): Router {
  const router = Router();

  router.get('/v1/assignments/:assignmentId/submissions', async (req, res) => {
    const { assignmentId } = parseWith(assignmentIdParamSchema, req.params);
    res.json(
      (await service.getAssignmentSubmissions(assignmentId)).map(
        toSubmissionDto,
      ),
    );
  });

  // Ciclo BR-TASK-001: no entregada ↔ entregada (y pendiente).
  router.put(
    '/v1/assignments/:assignmentId/submissions/:studentId',
    async (req, res) => {
      const params = parseWith(submissionParamsSchema, req.params);
      const body = parseWith(submissionStatusBodySchema, req.body);
      const submission = await service.setSubmissionStatus({
        ...params,
        status: body.status,
      });
      res.json(toSubmissionDto(submission));
    },
  );

  return router;
}
