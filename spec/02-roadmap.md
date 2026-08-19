# Roadmap inicial

| Orden | Tarea                                 | Trazabilidad                                | Estado                  |
| ----- | ------------------------------------- | ------------------------------------------- | ----------------------- |
| 1     | BOOTSTRAP-001 foundation, SDD y arnés | HU-001..HU-013; RNF-UX-001                  | done                    |
| 2     | Auth y sesión                         | HU-001; RF-AUTH; INT-GOOGLE-001             | done                    |
| 3     | Home, asistente y navegación          | HU-002..HU-003; RF-CHAT/RF-NAV; INT-N8N/RAG | review (HU-003)         |
| 4     | Asistencia y tareas                   | HU-004/HU-007; RF-ASIS/RF-TASK              | review (diseño visual)  |
| 5     | Alumnos y seguimiento                 | HU-005/HU-006; RF-ALUM                      | review (diseño visual)  |
| 6     | Anotaciones                           | HU-008/HU-009; RF-NOTE                      | review (diseño visual)  |
| 7     | Correo y comunicaciones               | HU-010..HU-012; RF-MAIL/RF-COMM             | review (diseño visual)  |
| 8     | Alertas                               | HU-013; RF-FOLLOW                           | blocked by Q-001..Q-003 |
| 9     | Datos demo en memoria (MVP)           | HU-004..HU-011                              | done                    |

El hito 9 implementa una capa de datos mock en memoria (`SchoolRepository` +
generador determinista en `mobile/src/infrastructure/in-memory/`) que alimenta
asistencia, tareas, alumnos, perfil, anotaciones y correo con fechas lectivas
dinámicas (lun-vie, ancladas a la fecha local de inicio de la app). Sustituirá
a Supabase en el hito de integración sin tocar las pantallas.

## Descomposición preliminar por HU

| HU     | Tareas futuras (sin implementación en bootstrap)               |
| ------ | -------------------------------------------------------------- |
| HU-001 | Contrato de sesión; Google; credenciales; errores y expiración |
| HU-002 | Modelo de conversación; gateway n8n; RAG; estados de chat      |
| HU-003 | Navegación autenticada; menú; cierre de sesión                 |
| HU-004 | Consulta de clase; matriz; ciclo y persistencia                |
| HU-005 | Listado; acciones de fila; confirmación y borrado              |
| HU-006 | Detalle; historiales; edición limitada                         |
| HU-007 | Matriz de tareas; ciclo y persistencia                         |
| HU-008 | Listado; gestión; detalle; accesos contextuales                |
| HU-009 | Formulario; tipos; validación; persistencia                    |
| HU-010 | Bandeja; lectura; paginación; detalle                          |
| HU-011 | Composición; resolución de destinatarios; envío                |
| HU-012 | Alcances alumno/clase/profesorado/familias; autorización       |
| HU-013 | Regla configurable; alerta; comunicaciones dirigidas           |

No se crearán tablas de negocio, migraciones o RLS hasta contrastar el modelo con las historias y preguntas abiertas.
