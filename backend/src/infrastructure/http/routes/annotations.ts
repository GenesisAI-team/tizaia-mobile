import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import {
  annotationIdParamSchema,
  createAnnotationBodySchema,
  listAnnotationsQuerySchema,
  managedBodySchema,
} from '../schemas.js';
import { toAnnotationDto } from '../dto.js';
import { singleQuery } from './classes.js';

/** Anotaciones: listado con filtros, creación y gestión (BR-ANOT-002). */
export function createAnnotationsRouter(service: SchoolService): Router {
  const router = Router();

  router.get('/v1/annotations', async (req, res) => {
    const filters = parseWith(listAnnotationsQuerySchema, {
      classId: singleQuery(req.query.classId),
      studentId: singleQuery(req.query.studentId),
      managed: singleQuery(req.query.managed),
    });
    res.json(
      (
        await service.listAnnotations({
          classId: filters.classId,
          studentId: filters.studentId,
          managed:
            filters.managed === undefined
              ? undefined
              : filters.managed === 'true',
        })
      ).map(toAnnotationDto),
    );
  });

  router.post('/v1/annotations', async (req, res) => {
    const body = parseWith(createAnnotationBodySchema, req.body);
    const annotation = await service.createAnnotation(body);
    res.status(201).json(toAnnotationDto(annotation));
  });

  router.patch('/v1/annotations/:annotationId/managed', async (req, res) => {
    const { annotationId } = parseWith(annotationIdParamSchema, req.params);
    const body = parseWith(managedBodySchema, req.body);
    const annotation = await service.setAnnotationManaged(
      annotationId,
      body.managed,
    );
    res.json(toAnnotationDto(annotation));
  });

  return router;
}
