import { z } from 'zod';

/** Esquemas Zod compartidos por las rutas (validación en el límite HTTP). */

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const classIdParamSchema = z.object({
  classId: z.string().min(1),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().min(1),
});

export const assignmentIdParamSchema = z.object({
  assignmentId: z.string().min(1),
});

export const annotationIdParamSchema = z.object({
  annotationId: z.string().min(1),
});

export const mailIdParamSchema = z.object({
  mailId: z.string().min(1),
});

export const attendanceParamsSchema = z.object({
  classId: z.string().min(1),
  studentId: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
});

export const submissionParamsSchema = z.object({
  assignmentId: z.string().min(1),
  studentId: z.string().min(1),
});

export const dateRangeQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '`from` debe tener formato YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '`to` debe tener formato YYYY-MM-DD')
    .optional(),
});

export const attendanceStatusBodySchema = z.object({
  status: z.enum(['present', 'absent', 'late']),
});

export const submissionStatusBodySchema = z.object({
  status: z.enum(['submitted', 'notSubmitted', 'pending']),
});

export const managedBodySchema = z.object({
  managed: z.boolean(),
});

export const studentPatchBodySchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
  })
  .refine(
    (patch) => patch.firstName !== undefined || patch.lastName !== undefined,
    { message: 'Indica al menos un campo editable (firstName o lastName)' },
  );

export const createAnnotationBodySchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(['contrary', 'aggravating', 'positive']),
  description: z.string().trim().min(1).max(500),
});

export const listAnnotationsQuerySchema = z.object({
  classId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  managed: z.enum(['true', 'false']).optional(),
});

export const listMailsQuerySchema = z.object({
  folder: z.enum(['inbox', 'sent']).optional(),
  unread: z.enum(['true', 'false']).optional(),
  query: z.string().max(200).optional(),
});

export const mailReadBodySchema = z.object({
  isRead: z.boolean(),
});

export const recipientsQuerySchema = z.object({
  query: z.string().max(200).optional(),
});

export const sendMailBodySchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(1000),
  recipientIds: z.array(z.string().min(1)).max(50),
});
