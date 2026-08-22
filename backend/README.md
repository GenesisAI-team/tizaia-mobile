# TizaIA Backend (API-001)

API REST del MVP ampliado sobre un almacén **en memoria** con seeds
deterministas (RFC-001). Node.js 22 + TypeScript estricto + Express 5 + Zod.
Sin proveedores de IA, sin Supabase y sin dependencias de Vercel.

- Issue: [#67](https://github.com/GenesisAI-team/tizaia-mobile/issues/67)
- Decisión técnica: [RFC-001](../spec/07-assistant-backend-rfc.md) (`Depends on #66`)

## Ejecución local

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env   # opcional; hay valores por defecto
pnpm dev
curl http://localhost:3000/health
```

El puerto se configura con `PORT` (por defecto `3000`). Variables (ver
`.env.example`): `PORT`, `CORS_ORIGINS`, `ENABLE_DEV_RESET`, `DEMO_MODE`.
No se admiten secretos: este backend demo no necesita claves.

## Scripts

```powershell
pnpm dev           # tsx watch src/server.ts
pnpm build         # tsc -p tsconfig.build.json -> dist/
pnpm start         # node dist/server.js
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint .
pnpm test          # node:test + tsx (sin red externa)
pnpm format:check  # prettier --check .
pnpm validate      # typecheck + lint + test + format
```

## Contratos REST

Respuestas JSON; fechas ISO-8601. Errores con envolvente estable:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Solicitud no válida",
    "details": []
  }
}
```

Códigos usados: `400 VALIDATION_ERROR`, `404 NOT_FOUND`, `409 NON_SCHOOL_DAY`,
`500 INTERNAL_ERROR`.

### Sistema

| Método | Ruta            | Notas                                                |
| ------ | --------------- | ---------------------------------------------------- |
| GET    | `/health`       | Sonda de vida (healthcheck Docker)                   |
| GET    | `/v1/bootstrap` | Grafo completo coherente para hidratar el móvil      |
| GET    | `/v1/me`        | Docente activo y clase activa                        |
| POST   | `/v1/dev/reset` | Solo con `ENABLE_DEV_RESET=true`; si no responde 404 |

### Clases y alumnado

| Método | Ruta                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| GET    | `/v1/classes` · `/v1/classes/:classId` · `/v1/classes/:classId/summary`               |
| GET    | `/v1/classes/:classId/students` · `/v1/classes/:classId/attendance?from=&to=`         |
| GET    | `/v1/classes/:classId/assignments`                                                    |
| GET    | `/v1/students/:studentId` (incluye contactos) · `/progress` · `/attendance?from=&to=` |
| PATCH  | `/v1/students/:studentId` — solo `firstName`/`lastName` (Q-014 abierta)               |
| DELETE | `/v1/students/:studentId` — borrado en cascada sin huérfanos                          |

### Asistencia, tareas y anotaciones

| Método | Ruta                                                   | Cuerpo                                                     |
| ------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| PUT    | `/v1/attendance/:classId/:studentId/:date`             | `{ "status": "present" \| "absent" \| "late" }`            |
| GET    | `/v1/assignments/:assignmentId/submissions`            | —                                                          |
| PUT    | `/v1/assignments/:assignmentId/submissions/:studentId` | `{ "status": "submitted" \| "notSubmitted" \| "pending" }` |
| GET    | `/v1/annotations?classId=&studentId=&managed=`         | —                                                          |
| POST   | `/v1/annotations`                                      | `{ studentId, type, description }` → 201                   |
| PATCH  | `/v1/annotations/:annotationId/managed`                | `{ "managed": true }`                                      |

Fechas en formato `YYYY-MM-DD`; una fecha no lectiva responde `409 NON_SCHOOL_DAY`.

### Correo demo

| Método | Ruta                                                     | Cuerpo / query                                                                       |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| GET    | `/v1/mails?folder=inbox\|sent&unread=true\|false&query=` | —                                                                                    |
| GET    | `/v1/mails/:mailId`                                      | —                                                                                    |
| PATCH  | `/v1/mails/:mailId/read`                                 | `{ "isRead": true }`                                                                 |
| GET    | `/v1/mail-recipients?query=`                             | familias y grupos disponibles                                                        |
| POST   | `/v1/mails`                                              | `{ subject, body, recipientIds: ["family-<studentId>" \| "group-<classId>"] }` → 201 |

## Ejemplos `curl`

```bash
# Lectura inicial
curl http://localhost:3000/v1/bootstrap > bootstrap.json

# Mutación: asistencia ausente el primer día lectivo del seed
curl -X PUT http://localhost:3000/v1/attendance/class-1/student-1/2026-08-21 \
  -H "Content-Type: application/json" -d '{"status":"absent"}'

# Lectura posterior: el cambio persiste mientras viva el proceso
curl "http://localhost:3000/v1/classes/class-1/attendance?from=2026-08-21&to=2026-08-21"

# Envío mock a la familia de un alumno y al grupo
curl -X POST http://localhost:3000/v1/mails \
  -H "Content-Type: application/json" \
  -d '{"subject":"Salida","body":"Confirmad asistencia.","recipientIds":["family-student-1","group-class-1"]}'

# Verlo en enviados
curl "http://localhost:3000/v1/mails?folder=sent"

# Reset (solo desarrollo)
ENABLE_DEV_RESET=true pnpm dev
curl -X POST http://localhost:3000/v1/dev/reset
```

## Persistencia y limitaciones explícitas

- Las mutaciones viven en memoria de proceso: sobreviven entre peticiones,
  no entre reinicios. Recrear el proceso o el contenedor restaura el seed.
- No montar varias réplicas: cada réplica tendría memoria distinta.
- Los seeds no son una base de datos ni un volumen persistente.
- La migración futura sustituirá el adaptador `SchoolRepository` por Supabase
  sin cambiar servicios ni rutas (RFC-001 §9).
- Modo demo explícito (`X-Demo-Mode`, `DEMO_MODE`); no es seguridad de producción.

## Docker

```powershell
docker build -t tizaia-backend ./backend
docker run --rm -d -p 3000:3000 --name tizaia-api tizaia-backend
curl http://localhost:3000/health
docker logs tizaia-api
docker stop tizaia-api
```

Imagen multi-stage (Node 22-alpine), usuario no root `tizaia`, healthcheck
sobre `/health`, `PORT` y orígenes CORS configurables por entorno.

## Trazabilidad

Cubre HU-002..HU-011 como datos de apoyo (INT-BACKEND-001) según
[`spec/06-traceability.md`](../spec/06-traceability.md). Fuera de alcance:
integración móvil (#68), asistente AI SDK (#69), Supabase, RAG, correo real,
autenticación real y reglas de alertas (Q-001 abierta).
