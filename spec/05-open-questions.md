# Preguntas abiertas y riesgos

Ningún requisito dependiente se considera validado mientras no exista decisión aceptada.

| ID    | Pregunta / impacto                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-001 | Umbral de faltas, tardanzas o resultados bajos para una racha; bloquea RF-FOLLOW-001.                                                                               |
| Q-002 | Fuente y escala de “resultados bajos”; no hay módulo de calificaciones.                                                                                             |
| Q-003 | Latencia máxima de alerta.                                                                                                                                          |
| Q-004 | Contenido y acciones de Detalle anotación.                                                                                                                          |
| Q-005 | Contenido y acciones de Detalle mail.                                                                                                                               |
| Q-006 | Alta estándar, errores, recuperación y sesión expirada; la fase 1 implementa inicio de sesión, restauración y logout, pero no resuelve estas decisiones pendientes. |
| Q-007 | Borrado físico/lógico, retención y recuperación de alumnos.                                                                                                         |
| Q-008 | Grupos exactos de +Grupos y permisos por alcance.                                                                                                                   |
| Q-010 | Selección de clase con varias clases.                                                                                                                               |
| Q-011 | Proveedor/cuenta de correo, fallos parciales, reintentos y límites.                                                                                                 |
| Q-012 | Autorización, cifrado, auditoría, retención y privacidad de menores.                                                                                                |
| Q-013 | Objetivos medibles de rendimiento, disponibilidad y accesibilidad.                                                                                                  |
| Q-014 | Si la edición del alumno queda limitada permanentemente al nombre.                                                                                                  |
| Q-015 | Destino de la pestaña Overview (globo) de la TabBar: `Tizaia.op` no lo define; UI-023 lo cablea provisionalmente a Clases.                                          |
| Q-016 | Los FAB "Añadir alumno/tarea/clase" del `.op` no tienen pantalla destino definida; quedan sin acción hasta decisión del equipo de diseño.                           |

## Preguntas resueltas

| ID    | Decisión y consecuencias                                                                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-009 | Operaciones vía API propia: **backend propio (Node 22 + Express + Zod + AI SDK 7)** para el asistente y los datos de apoyo del MVP ampliado; n8n queda descartado como integración del asistente. Ver [RFC-001](07-assistant-backend-rfc.md). Consecuencias: el móvil consumirá `POST /v1/assistant/messages` (no streaming, conserva `message` y `conversationId`); RAG queda fuera de alcance mientras los datos sean estructurados; los secretos viven solo en el backend; la migración a Supabase será por sustitución del adaptador. |
