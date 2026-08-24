# Roadmap inicial

| Orden | Tarea                                 | Trazabilidad                                              | Estado                  |
| ----- | ------------------------------------- | --------------------------------------------------------- | ----------------------- |
| 1     | BOOTSTRAP-001 foundation, SDD y arnés | HU-001..HU-013; RNF-UX-001                                | done                    |
| 2     | Auth y sesión                         | HU-001; RF-AUTH; INT-GOOGLE-001                           | done                    |
| 3     | Home, asistente y navegación          | HU-002..HU-003; RF-CHAT/RF-NAV; INT-BACKEND/INT-ASSISTANT | review (HU-003)         |
| 4     | Asistencia y tareas                   | HU-004/HU-007; RF-ASIS/RF-TASK                            | review (diseño visual)  |
| 5     | Alumnos y seguimiento                 | HU-005/HU-006; RF-ALUM                                    | review (diseño visual)  |
| 6     | Anotaciones                           | HU-008/HU-009; RF-NOTE                                    | review (diseño visual)  |
| 7     | Correo y comunicaciones               | HU-010..HU-012; RF-MAIL/RF-COMM                           | review (diseño visual)  |
| 8     | Alertas                               | HU-013; RF-FOLLOW                                         | blocked by Q-001..Q-003 |
| 9     | Datos demo en memoria (MVP)           | HU-004..HU-011                                            | done                    |
| 10    | RFC-001 backend en memoria + AI SDK   | HU-002; Q-009; RF-CHAT                                    | done                    |
| 11    | Backend propio `/v1` (implementación) | HU-002..HU-011; INT-BACKEND/INT-ASSISTANT                 | done                    |
| 12    | Consumo móvil de la API (MOB-API-001) | HU-004..HU-011; INT-BACKEND-001                           | done                    |
| 13    | Asistente AI SDK + tools (AI-001)     | HU-002; RF-CHAT; INT-ASSISTANT-001                        | review                  |

El hito 9 implementa una capa de datos mock en memoria (`SchoolRepository` +
generador determinista en `mobile/src/infrastructure/in-memory/`) que alimenta
asistencia, tareas, alumnos, perfil, anotaciones y correo con fechas lectivas
dinámicas (lun-vie, ancladas a la fecha local de inicio de la app). Sustituirá
a Supabase en el hito de integración sin tocar las pantallas.

El hito 10 es el [RFC-001](07-assistant-backend-rfc.md): decide el backend
propio (Node 22 + TypeScript + Express + Zod + AI SDK 7), el almacén en memoria
con seeds deterministas, la API REST bajo `/v1`, el descarte de n8n (Q-009) y el
aplazamiento del RAG. El hito 11 lo implementa sin cambiar la UI ni las tools.

El hito 11 se ejecuta como **API-001** (#67): paquete `backend/` con la API
escolar completa en memoria (`/health`, `/v1/bootstrap`, clases, alumnado,
asistencia, tareas/entregas, anotaciones y correo demo), seeds deterministas,
Docker multi-stage y tests sin red externa. La integración del móvil será
MOB-API-001 (#68) y el asistente real AI-001 (#69).

El hito 12 es **MOB-API-001** (#68): el móvil sustituye los mocks por un
adaptador HTTP (`infrastructure/api`) sobre el puerto async `SchoolRepository`,
con estados de carga/vacío/error, mutaciones confirmadas u optimistas con
rollback según el dominio, y `EXPO_PUBLIC_API_BASE_URL` documentada
(`10.0.2.2` en emulador). El repositorio en memoria queda como fake de tests.

El hito 13 es **AI-001** (#69): asistente real sobre AI SDK 7 en el backend
(`infrastructure/ai` con modelProvider, store de conversaciones en memoria,
20 tools de lectura sobre los servicios escolares compartidos con la API REST
y `POST /v1/assistant/messages` no streaming). El móvil integra
`ApiAssistantGateway` seleccionable por `EXPO_PUBLIC_ASSISTANT_MODE`
(`api|fake`); n8n queda eliminado (Q-009) y RAG sigue fuera de alcance.
Sin clave del proveedor, el endpoint responde 503 estable; CI y tests usan un
modelo simulado sin llamadas reales ni consumo de créditos.

## Descomposición preliminar por HU

| HU     | Tareas futuras (sin implementación en bootstrap)                      |
| ------ | --------------------------------------------------------------------- |
| HU-001 | Contrato de sesión; Google; credenciales; errores y expiración        |
| HU-002 | Modelo de conversación; gateway backend REST; AI SDK; estados de chat |
| HU-003 | Navegación autenticada; menú; cierre de sesión                        |
| HU-004 | Consulta de clase; matriz; ciclo y persistencia                       |
| HU-005 | Listado; acciones de fila; confirmación y borrado                     |
| HU-006 | Detalle; historiales; edición limitada                                |
| HU-007 | Matriz de tareas; ciclo y persistencia                                |
| HU-008 | Listado; gestión; detalle; accesos contextuales                       |
| HU-009 | Formulario; tipos; validación; persistencia                           |
| HU-010 | Bandeja; lectura; paginación; detalle                                 |
| HU-011 | Composición; resolución de destinatarios; envío                       |
| HU-012 | Alcances alumno/clase/profesorado/familias; autorización              |
| HU-013 | Regla configurable; alerta; comunicaciones dirigidas                  |

No se crearán tablas de negocio, migraciones o RLS hasta contrastar el modelo con las historias y preguntas abiertas.
