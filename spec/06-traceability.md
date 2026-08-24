# Matriz de trazabilidad inicial

| Historia | Origen                 | Requisitos                                                                            |
| -------- | ---------------------- | ------------------------------------------------------------------------------------- |
| HU-001   | CU-01                  | RF-AUTH-001..006; INT-GOOGLE-001                                                      |
| HU-002   | CU-02                  | RF-CHAT-001..006; INT-BACKEND-001; INT-ASSISTANT-001; INT-RAG-001 (aplazado, RFC-001) |
| HU-003   | Navegación transversal | RF-NAV-001..008                                                                       |
| HU-004   | CU-03                  | RF-ASIS-001..006; BR-ASIS-001; DAT-ASIS-001                                           |
| HU-005   | CU-04                  | RF-ALUM-001..007; BR-DELETE-001                                                       |
| HU-006   | CU-05                  | RF-ALUM-010..014; BR-HIST-001; BR-ANOT-001                                            |
| HU-007   | CU-08                  | RF-TASK-001..006; BR-TASK-001; DAT-TASK-001                                           |
| HU-008   | CU-07                  | RF-NOTE-001..006; BR-ANOT-002                                                         |
| HU-009   | CU-06                  | RF-NOTE-007..010; DAT-NOTE-001; BR-ANOT-001                                           |
| HU-010   | CU-09                  | RF-MAIL-001..009; DAT-MAIL-001                                                        |
| HU-011   | CU-10                  | RF-MAIL-010..020; INT-MAIL-001                                                        |
| HU-012   | CU-11/anexo            | RF-COMM-001..004; RF-MAIL-013..014                                                    |
| HU-013   | Anexo imprescindible   | RF-FOLLOW-001..004; Q-001..003                                                        |

Foundation acceptance: `mobile/` buildable and checks reproducible. Feature acceptance remains pending per roadmap.

## Hito datos demo en memoria (MVP)

| Artefacto                                     | HU/RF cubiertos                                                | Validación                    |
| --------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| `src/domain/school/` (modelos y fechas)       | HU-004, HU-007; DAT-ASIS-001/DAT-TASK-001                      | `pnpm test`                   |
| `src/infrastructure/in-memory/` (repositorio) | HU-004..HU-011                                                 | `pnpm test`                   |
| Pantallas conectadas al repositorio           | HU-004, HU-005, HU-006, HU-007, HU-008, HU-009, HU-010, HU-011 | `pnpm typecheck`, `pnpm lint` |

El contrato `SchoolRepository` permite sustituir la implementación en memoria
por Supabase sin cambios en la UI; la persistencia (guardar anotaciones, enviar
mails, guardar cambios de celda) queda fuera del alcance de este hito.

## RFC-001 — Backend en memoria y AI SDK

| Artefacto                           | HU/RF cubiertos                   | Validación                                                |
| ----------------------------------- | --------------------------------- | --------------------------------------------------------- |
| `spec/07-assistant-backend-rfc.md`  | HU-002; RF-CHAT-001..006; Q-009   | Revisión de PR; enlaces y referencias cruzadas de `spec/` |
| Actualización stack e integraciones | INT-BACKEND-001/INT-ASSISTANT-001 | Coherencia con RFC-001 (n8n, RAG, Supabase, Q-009)        |
| Roadmap, open questions y HU-002    | Q-009 resuelta; trazabilidad      | Sin contradicciones residuales                            |

RFC-001 define la arquitectura del backend del MVP ampliado (Node 22 + TS +
Express + Zod + AI SDK 7, almacén en memoria con seeds deterministas, REST bajo
`/v1`, RAG fuera de alcance) y resuelve Q-009 descartando n8n como integración
del asistente. No introduce código de runtime ni dependencias.

## Hito API-001 — Backend propio `/v1` en memoria (#67)

| Artefacto                                                                                  | HU/RF cubiertos                                                                                                                                            | Validación                                                             |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `backend/` (Node 22 + TS estricto + Express 5 + Zod 4)                                     | INT-BACKEND-001; datos de apoyo HU-002..HU-011                                                                                                             | `pnpm --dir backend validate` (typecheck, lint, tests, formato)        |
| Seeds deterministas (`src/seeds`) + `MemorySchoolRepository` con cascada y reset           | Volumen del mock: 6 clases, 20–30 alumnos/clase, 10 días lectivos, 10 tareas/clase, entregas, 2–3 anotaciones/clase, 30 mails; docente demo y clase activa | Unit tests de seeds y repositorio (`node:test`), determinismo incluido |
| REST `/health`, `/v1/bootstrap`, `/v1/me`, `/v1/dev/reset` y dominios completos bajo `/v1` | Lecturas y mutaciones observables entre peticiones; errores estables (`400/404/409/500`)                                                                   | Integration tests HTTP sin red externa; ejemplos `curl` en la PR       |
| Dockerfile multi-stage no root + healthcheck                                               | Despliegue portable a cualquier VPS Node/Docker (RFC-001)                                                                                                  | `docker build` + arranque + `curl /health` desde el contenedor         |
| Documentación (`backend/README.md`, stack, roadmap, integraciones, RFC aprobado)           | Trazabilidad consistente                                                                                                                                   | Revisión cruzada de enlaces de `spec/`                                 |

Limitaciones documentadas: memoria de proceso (el reinicio restaura el seed),
sin réplicas horizontales, edición del alumno limitada a nombre/apellidos
(Q-014 abierta) y sin reglas normativas de alertas (Q-001 abierta).
Queda fuera: integración móvil (#68), asistente AI SDK (#69).

## Hito MOB-API-001 — Consumo móvil de la API (#68)

| Artefacto                                                                                          | HU/RF cubiertos                                                                                                                                                            | Validación                                                              |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Puerto async `SchoolRepository` + modelos ampliados (`managed`, mail completo)                     | HU-004..HU-011; DAT-NOTE/DAT-MAIL; BR-ANOT-002                                                                                                                             | `pnpm --dir mobile typecheck`                                           |
| Adaptador HTTP (`infrastructure/api`: apiClient, contracts, mappers, `ApiSchoolRepository`)        | INT-BACKEND-001; errores estables 400/404/409/500 normalizados                                                                                                             | Tests unitarios de cliente, mappers y adaptador (fetch stub)            |
| Estado compartido (`shared/state`: provider de invalidación, `useSchoolResource`, `DataStateView`) | Estados loading/success/empty/error con reintento en todas las pantallas conectadas                                                                                        | Tests del hook con éxito, vacío, error y refetch por invalidación       |
| Pantallas migradas (inicio/drawer/clases/alumnado/asistencia/tareas/anotaciones/correo)            | Lecturas y mutaciones contra `/v1`; borrado con confirmación; asistencia/entregas/gestionada/leído con optimista+rollback documentado; correo con envío simulado explícito | `pnpm --dir mobile validate`; checklist manual en emulador (`10.0.2.2`) |
| Composition root sobre la API; fake en memoria solo para tests; sin claves de IA en bundle         | Criterios #68: ninguna pantalla usa mocks ni llama a `fetch` directamente                                                                                                  | Revisión cruzada de imports y trazabilidad                              |

Queda fuera: AI SDK real (#69), Supabase, correo real, sincronización offline.

## Hito AI-001 — Asistente AI SDK y tools (#69)

| Artefacto                                                                                     | HU/RF cubiertos                                                                                  | Validación                                                                        |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `infrastructure/ai/modelProvider.ts` + config (`AI_PROVIDER/AI_MODEL/OPENAI_API_KEY/...`)     | INT-ASSISTANT-001; RFC-001 §5/§8 (proveedor directo, sin Gateway, clave solo en backend)          | `pnpm --dir backend typecheck`; 503 estable sin clave                              |
| Store de conversaciones en memoria (`conversationStore`)                                      | RF-CHAT-004; RFC-001 §6 (TTL, límite, ids opacos)                                                | Tests unitarios TTL/límites/expiración                                             |
| Catálogo de 20 tools de lectura por dominio sobre `SchoolService`                             | RF-CHAT-002..006; «mismo store que la API REST»; sin seeds ni HTTP interno                        | Tests unitarios por tool con seed determinista; errores normalizados               |
| `schoolAssistant` + `POST /v1/assistant/messages` no streaming                                | HU-002/RF-CHAT-001..006; contrato estable `message`+`conversationId`; fechas «hoy/ayer» Madrid   | Tests de integración con modelo simulado (`ai/test`), 400/404/503/504/502          |
| `ApiAssistantGateway` + `EXPO_PUBLIC_ASSISTANT_MODE=api\|fake`; n8n eliminado                 | INT-ASSISTANT-001 activa; Q-009; sin claves/SDK del proveedor en el bundle                        | Tests del gateway (mapeo, continuidad, errores) y suite completa móvil             |

Queda fuera: tools de escritura, RAG, persistencia de conversaciones
(Supabase), streaming/SSE y alertas normativas (Q-001).
