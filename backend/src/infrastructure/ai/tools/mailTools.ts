import { tool } from 'ai';
import { z } from 'zod';

import type { ToolSet } from 'ai';
import {
  capList,
  limitSchema,
  resolveLimit,
  runTool,
  type SchoolToolContext,
} from './shared.js';

const folderSchema = z
  .enum(['inbox', 'sent'])
  .optional()
  .describe(
    'Carpeta: «inbox» (entrada) o «sent» (enviados); por defecto inbox',
  );

/**
 * Tools de correo (AI-001): bandejas, recuento de no leídos y búsqueda de
 * solo lectura sobre `SchoolService`. El correo del MVP es simulado (demo).
 */
export function createMailTools(context: SchoolToolContext): ToolSet {
  const { service } = context;

  const toItems = (
    mails: Awaited<ReturnType<typeof service.listMails>>,
  ): Array<{
    id: string;
    folder: string;
    senderLabel: string;
    subject: string;
    preview: string;
    receivedAt: string;
    isRead: boolean;
  }> =>
    mails.map((mail) => ({
      id: mail.id,
      folder: mail.folder,
      senderLabel: mail.senderLabel,
      subject: mail.subject,
      preview: mail.preview,
      receivedAt: mail.receivedAt.toISOString(),
      isRead: mail.isRead,
    }));

  return {
    listRecentMails: tool({
      description:
        'Correos más recientes de una carpeta (por defecto, la bandeja de entrada).',
      inputSchema: z.object({
        folder: folderSchema,
        unreadOnly: z
          .boolean()
          .optional()
          .describe('Si es true, solo los no leídos'),
        limit: limitSchema(),
      }),
      execute: async ({ folder, unreadOnly, limit }) =>
        runTool(async () => {
          const mails = await service.listMails({
            folder: folder ?? 'inbox',
            unread: unreadOnly,
          });
          return {
            count: mails.length,
            mails: capList(toItems(mails), resolveLimit(limit, 10)),
          };
        }),
    }),

    countUnreadMails: tool({
      description:
        'Número de correos sin leer en una carpeta (por defecto, la bandeja de entrada).',
      inputSchema: z.object({ folder: folderSchema }),
      execute: async ({ folder }) =>
        runTool(async () => {
          const effectiveFolder = folder ?? 'inbox';
          const mails = await service.listMails({
            folder: effectiveFolder,
            unread: true,
          });
          return { folder: effectiveFolder, unreadCount: mails.length };
        }),
    }),

    searchMails: tool({
      description:
        'Busca correos por texto en asunto, cuerpo o remitente, opcionalmente dentro de una carpeta.',
      inputSchema: z.object({
        query: z.string().min(1).describe('Texto a buscar'),
        folder: folderSchema,
        limit: limitSchema(),
      }),
      execute: async ({ query, folder, limit }) =>
        runTool(async () => {
          const mails = await service.listMails({
            folder: folder ?? 'inbox',
            query,
          });
          return {
            count: mails.length,
            mails: capList(toItems(mails), resolveLimit(limit, 10)),
          };
        }),
    }),
  };
}
