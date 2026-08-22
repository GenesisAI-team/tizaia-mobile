# Datos e integraciones

## Integraciones

| ID | Obligación | HUs/RF |
|---|---|---|
| INT-GOOGLE-001 | Registro e inicio de sesión con Google | HU-001/RF-AUTH-001 |
| INT-BACKEND-001 | El móvil consume el backend propio (Node 22 + Express + Zod + AI SDK 7) vía REST JSON bajo `/v1` | HU-002..HU-011; RFC-001 |
| INT-ASSISTANT-001 | Cada mensaje del asistente se envía a `POST /v1/assistant/messages` del backend propio (no streaming; conserva `message` y `conversationId`) | HU-002/RF-CHAT-001..006; RFC-001 |
| INT-RAG-001 | Recuperar contexto desde RAG asociado a Supabase | HU-002/RF-CHAT-004 (aplazado: fuera de alcance del MVP mientras los datos sean estructurados, RFC-001) |
| INT-MAIL-001 | Recibir, consultar y enviar correos | HU-010..012/RF-MAIL |

INT-N8N-001 (cada mensaje inicia el flujo n8n) queda **sustituida** por
INT-ASSISTANT-001: RFC-001 resuelve Q-009 descartando n8n como integración del
asistente del MVP.

## Datos normativos (sin tablas en BOOTSTRAP-001)

`DAT-STU-001` identifica alumno, nombre, foto, nacimiento, correo educativo y contactos; `DAT-ASIS-001` asocia alumno/fecha/estado; `DAT-TASK-001` alumno/tarea/estado; `DAT-NOTE-001` alumno/tipo/contenido/fecha; `DAT-MAIL-001` asunto/remitente/fragmento/fecha/lectura.

La especificación menciona teachers, classes, students, contacts, attendance, assignments, submissions, annotations, messages, recipients, conversations y alerts, pero su diseño se difiere hasta las HUs y decisiones de autorización.

## Almacén de datos del backend (RFC-001)

El backend del MVP ampliado usa un almacén en memoria de proceso, inicializado
desde seeds deterministas (el mismo dataset que el mock móvil). El contrato
`SchoolRepository` del backend permite sustituir la implementación en memoria
por Supabase sin cambiar la UI ni las tools del asistente (ver
[RFC-001](07-assistant-backend-rfc.md)).

### Implementación API-001 (#67)

- Contratos REST activos: `/health`, `/v1/bootstrap`, `/v1/me`,
  `POST /v1/dev/reset` (solo con flag), clases/resumen/alumnado,
  asistencia (consulta + `PUT` por alumno/fecha), tareas y entregas
  (`PUT`), anotaciones (listado con filtros, creación, gestión) y correo demo
  (bandejas con filtros, detalle, lectura, destinatarios y envío a `sent`).
  Detalle completo en [`backend/README.md`](../backend/README.md).
- Campos mínimos añadidos al modelo (sin inventar lógica normativa): fecha de
  nacimiento, correo educativo y contactos del alumno (DAT-STU-001);
  cuerpo, destinatarios y carpeta (`inbox`/`sent`) del mail; estado
  `managed` de la anotación (BR-ANOT-002). La edición del alumno queda
  limitada a nombre/apellidos mientras Q-014 siga abierta.
- Volumen preservado: 6 clases, 20–30 alumnos/clase, 10 días lectivos,
  10 tareas/clase, entregas por alumno/tarea, 2–3 anotaciones/clase,
  30 correos, docente demo Laura Martínez y clase activa `class-1`.
- Mutaciones persistentes durante la vida del proceso; reinicio restaura el
  seed; sin réplicas. Sin IA, Supabase ni Vercel en esta entrega.

