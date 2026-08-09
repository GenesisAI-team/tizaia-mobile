# Datos e integraciones

## Integraciones

| ID | Obligación | HUs/RF |
|---|---|---|
| INT-GOOGLE-001 | Registro e inicio de sesión con Google | HU-001/RF-AUTH-001 |
| INT-N8N-001 | Cada mensaje inicia el flujo n8n | HU-002/RF-CHAT-003 |
| INT-RAG-001 | Recuperar contexto desde RAG asociado a Supabase | HU-002/RF-CHAT-004 |
| INT-MAIL-001 | Recibir, consultar y enviar correos | HU-010..012/RF-MAIL |

## Datos normativos (sin tablas en BOOTSTRAP-001)

`DAT-STU-001` identifica alumno, nombre, foto, nacimiento, correo educativo y contactos; `DAT-ASIS-001` asocia alumno/fecha/estado; `DAT-TASK-001` alumno/tarea/estado; `DAT-NOTE-001` alumno/tipo/contenido/fecha; `DAT-MAIL-001` asunto/remitente/fragmento/fecha/lectura.

La especificación menciona teachers, classes, students, contacts, attendance, assignments, submissions, annotations, messages, recipients, conversations y alerts, pero su diseño se difiere hasta las HUs y decisiones de autorización.

