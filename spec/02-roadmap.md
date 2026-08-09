# Roadmap inicial

| Orden | Tarea | Trazabilidad | Estado |
|---|---|---|---|
| 1 | BOOTSTRAP-001 foundation, SDD y arnés | HU-001..HU-013; RNF-UX-001 | in_progress |
| 2 | Auth y sesión | HU-001; RF-AUTH; INT-GOOGLE-001 | backlog |
| 3 | Home, asistente y navegación | HU-002..HU-003; RF-CHAT/RF-NAV; INT-N8N/RAG | backlog |
| 4 | Asistencia y tareas | HU-004/HU-007; RF-ASIS/RF-TASK | backlog |
| 5 | Alumnos y seguimiento | HU-005/HU-006; RF-ALUM | backlog |
| 6 | Anotaciones | HU-008/HU-009; RF-NOTE | backlog |
| 7 | Correo y comunicaciones | HU-010..HU-012; RF-MAIL/RF-COMM | backlog |
| 8 | Alertas | HU-013; RF-FOLLOW | blocked by Q-001..Q-003 |

## Descomposición preliminar por HU

| HU | Tareas futuras (sin implementación en bootstrap) |
|---|---|
| HU-001 | Contrato de sesión; Google; credenciales; errores y expiración |
| HU-002 | Modelo de conversación; gateway n8n; RAG; estados de chat |
| HU-003 | Navegación autenticada; menú; cierre de sesión |
| HU-004 | Consulta de clase; matriz; ciclo y persistencia |
| HU-005 | Listado; acciones de fila; confirmación y borrado |
| HU-006 | Detalle; historiales; edición limitada |
| HU-007 | Matriz de tareas; ciclo y persistencia |
| HU-008 | Listado; gestión; detalle; accesos contextuales |
| HU-009 | Formulario; tipos; validación; persistencia |
| HU-010 | Bandeja; lectura; paginación; detalle |
| HU-011 | Composición; resolución de destinatarios; envío |
| HU-012 | Alcances alumno/clase/profesorado/familias; autorización |
| HU-013 | Regla configurable; alerta; comunicaciones dirigidas |

No se crearán tablas de negocio, migraciones o RLS hasta contrastar el modelo con las historias y preguntas abiertas.
