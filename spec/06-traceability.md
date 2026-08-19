# Matriz de trazabilidad inicial

| Historia | Origen | Requisitos |
|---|---|---|
| HU-001 | CU-01 | RF-AUTH-001..006; INT-GOOGLE-001 |
| HU-002 | CU-02 | RF-CHAT-001..006; INT-N8N-001; INT-RAG-001 |
| HU-003 | Navegación transversal | RF-NAV-001..008 |
| HU-004 | CU-03 | RF-ASIS-001..006; BR-ASIS-001; DAT-ASIS-001 |
| HU-005 | CU-04 | RF-ALUM-001..007; BR-DELETE-001 |
| HU-006 | CU-05 | RF-ALUM-010..014; BR-HIST-001; BR-ANOT-001 |
| HU-007 | CU-08 | RF-TASK-001..006; BR-TASK-001; DAT-TASK-001 |
| HU-008 | CU-07 | RF-NOTE-001..006; BR-ANOT-002 |
| HU-009 | CU-06 | RF-NOTE-007..010; DAT-NOTE-001; BR-ANOT-001 |
| HU-010 | CU-09 | RF-MAIL-001..009; DAT-MAIL-001 |
| HU-011 | CU-10 | RF-MAIL-010..020; INT-MAIL-001 |
| HU-012 | CU-11/anexo | RF-COMM-001..004; RF-MAIL-013..014 |
| HU-013 | Anexo imprescindible | RF-FOLLOW-001..004; Q-001..003 |

Foundation acceptance: `mobile/` buildable and checks reproducible. Feature acceptance remains pending per roadmap.

## Hito datos demo en memoria (MVP)

| Artefacto                                   | HU/RF cubiertos                       | Validación |
| ------------------------------------------- | ------------------------------------- | ---------- |
| `src/domain/school/` (modelos y fechas)     | HU-004, HU-007; DAT-ASIS-001/DAT-TASK-001 | `pnpm test` |
| `src/infrastructure/in-memory/` (repositorio) | HU-004..HU-011                      | `pnpm test` |
| Pantallas conectadas al repositorio         | HU-004, HU-005, HU-006, HU-007, HU-008, HU-009, HU-010, HU-011 | `pnpm typecheck`, `pnpm lint` |

El contrato `SchoolRepository` permite sustituir la implementación en memoria
por Supabase sin cambios en la UI; la persistencia (guardar anotaciones, enviar
mails, guardar cambios de celda) queda fuera del alcance de este hito.

