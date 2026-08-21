import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { parseWith } from '../validation.js';
import {
  listMailsQuerySchema,
  mailIdParamSchema,
  mailReadBodySchema,
  recipientsQuerySchema,
  sendMailBodySchema,
} from '../schemas.js';
import { toMailDto } from '../dto.js';
import { singleQuery } from './classes.js';

/** Correo demo: bandejas, detalle, lectura, destinatarios y envío mock. */
export function createMailsRouter(service: SchoolService): Router {
  const router = Router();

  router.get('/v1/mails', (req, res) => {
    const filters = parseWith(listMailsQuerySchema, {
      folder: singleQuery(req.query.folder),
      unread: singleQuery(req.query.unread),
      query: singleQuery(req.query.query),
    });
    res.json(
      toMailDto(
        service.listMails({
          folder: filters.folder,
          unread:
            filters.unread === undefined
              ? undefined
              : filters.unread === 'true',
          query: filters.query,
        }),
      ),
    );
  });

  router.get('/v1/mails/:mailId', (req, res) => {
    const { mailId } = parseWith(mailIdParamSchema, req.params);
    res.json(toMailDto(service.getMailDetail(mailId)));
  });

  router.patch('/v1/mails/:mailId/read', (req, res) => {
    const { mailId } = parseWith(mailIdParamSchema, req.params);
    const body = parseWith(mailReadBodySchema, req.body);
    res.json(toMailDto(service.setMailRead(mailId, body.isRead)));
  });

  router.get('/v1/mail-recipients', (req, res) => {
    const { query } = parseWith(recipientsQuerySchema, {
      query: singleQuery(req.query.query),
    });
    res.json(service.searchRecipients(query));
  });

  // Envío mock persistido en memoria: aparece en la carpeta `sent`.
  router.post('/v1/mails', (req, res) => {
    const body = parseWith(sendMailBodySchema, req.body);
    const mail = service.sendMail(body);
    res.status(201).json(toMailDto(mail));
  });

  return router;
}
