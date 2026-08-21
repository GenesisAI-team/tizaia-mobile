# RFC-001 — Backend en memoria y AI SDK para el MVP ampliado

- **Estado:** propuesto (pendiente de revisión y aprobación de la PR).
- **Issue:** [#66](https://github.com/GenesisAI-team/tizaia-mobile/issues/66).
- **HUs/RF cubiertos:** HU-002 (RF-CHAT-001..006); trazabilidad del resto de módulos (HU-004..HU-011) vía datos de apoyo del asistente.
- **Decisiones aplazadas que condicionan este RFC:** Q-012 (autorización, cifrado y privacidad de menores) y Q-013 (objetivos de rendimiento/disponibilidad).

## 1. Contexto

TizaIA Mobile dispone de un MVP React Native con datos escolares simulados por
`InMemorySchoolRepository` (`mobile/src/infrastructure/in-memory/`) y un
asistente desacoplado tras el contrato `AssistantGateway`
(`mobile/src/features/assistant/domain/assistantGateway.ts`). La especificación
mantiene abierta **Q-009** (operaciones vía API propia, n8n o ambos) y contempla
n8n/RAG como integración futura del asistente.

El siguiente incremento necesita un backend propio, verificable y desplegable
sin depender de Vercel como plataforma. Este RFC formaliza esa decisión **antes**
de incorporar dependencias o código de ejecución.

## 2. Inventario de entidades y flujos actuales

Modelos de dominio en `mobile/src/domain/school/models.ts` y contrato de datos
en `mobile/src/domain/school/schoolRepository.ts`:

| Entidad | Campos esenciales | Flujos consumidos hoy |
| --- | --- | --- |
| `SchoolClass` | id, groupName, subject | Listado y clase activa (Clases, Asistencia, Tareas) |
| `Student` | id, classId, firstName, lastName, description | Listado, perfil y seguimiento (Alumnos) |
| `AttendanceRecord` | id, studentId, date, status (`present`/`absent`/`late`) | Matriz de Asistencia |
| `Assignment` / `AssignmentSubmission` | id, classId, title, dueDate / status (`submitted`/`notSubmitted`/`pending`) | Matriz de Tareas |
| `Annotation` | id, studentId, type, description, createdAt | Listado y creación de Anotaciones |
| `Mail` | id, senderStudentId, subject, preview, receivedAt, isRead | Bandeja y redacción de Mails |
| `SchoolDay` | date, label, secondaryLabel | Días lectivos de Asistencia y Tareas |

El generador determinista `createMockSchoolData` (`mockSchoolData.ts`) produce
el dataset completo a partir de una fecha de referencia y una semilla fija
(`mulberry32(20260819)`): clases, alumnado (20-30 por clase), asistencia por día
lectivo, tareas y entregas, anotaciones y mails.

Flujo del asistente (HU-002, `HomeScreen.tsx`): la UI envía `message` y un
`conversationId` opcional a `AssistantGateway.sendMessage` y muestra la
respuesta. Hoy el composition root (`createAppDependencies.ts`) inyecta
`FakeAssistantGateway`; `N8nAssistantGateway` existe como implementación HTTP
sustituible pero no está conectada.

## 3. Requisitos funcionales y no funcionales del backend y el asistente

### 3.1 Funcionales

- Exponer los datos escolares del MVP (clases, alumnado, asistencia, tareas,
  anotaciones y mails) al asistente mediante servicios de aplicación.
- Responder a mensajes del chat de HU-002 de forma contextualizada, usando los
  datos del almacén en memoria como contexto.
- Mantener la conversación mediante `conversationId` (en memoria, preparada
  para persistencia posterior).
- API REST JSON versionada bajo `/v1`.
- Contrato inicial no streaming para `POST /v1/assistant/messages`.

### 3.2 No funcionales

- **Portabilidad:** ejecución local (localhost) durante desarrollo y en
  contenedor Docker sobre cualquier VPS con Node 22.
- **Despliegue:** sin dependencia de Vercel como plataforma.
- **Seguridad:** secretos únicamente en el backend (variables de entorno);
  modo demo explícito; escritura por la IA no permitida.
- **Observabilidad:** logs estructurados y errores controlados, sin datos
  docentes sensibles (alineado con AGENTS.md).
- **Testabilidad:** repositorio en memoria y gateway de IA sustituibles por
  fakes durante los tests.
- **Mantenimiento:** KISS/YAGNI; una única instancia en memoria, sin escalado
  horizontal en el MVP.

## 4. Alternativas comparadas

Criterios (alineados con AGENTS.md §12): cumplimiento de requisitos,
complejidad, coste, seguridad, observabilidad, testabilidad, mantenimiento,
portabilidad, dependencia del proveedor, compatibilidad con Supabase/RAG y
bloqueos (de plataforma, SDK o proveedor).

| Criterio | A) n8n | B) Backend propio + AI SDK (elegida) | C) SDK directo del proveedor |
| --- | --- | --- | --- |
| Cumplimiento de requisitos | Cubre chat, pero añade orquestación ajena a HU-002 | Cubre HU-002 y las consultas de datos de apoyo | Cubre chat, sin datos de apoyo estructurados |
| Complejidad | Alta: plataforma externa, webhooks, gestión de workflows | Media: servidor Express + capa de IA desacoplada | Baja: solo llamadas al proveedor |
| Coste | Licencia/instancia propia u hosting adicional | Coste de VPS pequeño + coste del proveedor de IA | Coste del proveedor de IA |
| Seguridad | Secretos y datos viajan por webhook externo; superficie amplia | Secretos en backend propio; control total | Secretos en la app móvil o backend mínimo; peor en móvil |
| Observabilidad | Depende de la plataforma (ejecuciones, logs) | Logs y métricas propias con el stack del backend | Limitada a lo que ofrezca el SDK |
| Testabilidad | Simular webhooks y flujos externos | Fácil: repositorio y gateway en memoria/fake | Media: depende del SDK |
| Mantenimiento | Plataforma a operar/actualizar aparte | Stack conocido (Node/TS/Express) en el equipo | Cambios de proveedor acoplados al móvil |
| Portabilidad | Depende del hosting de n8n | Cualquier VPS con Node/Docker | Cualquier host, pero acopla al proveedor |
| Dependencia del proveedor | Baja (n8n orquesta, el proveedor va dentro) | Baja: AI SDK abstrae el proveedor; paquete directo intercambiable | Alta: SDK propietario del proveedor |
| Compatibilidad Supabase/RAG | Media: RAG posible vía Supabase en el flujo | Alta: repositorio sustituible por Supabase y RAG futuro en el mismo backend | Baja: sin capa de datos propia |
| Bloqueos | Bloqueo de plataforma (n8n) | Bloqueo de SDK bajo (AI SDK es open source); proveedor intercambiable | Bloqueo de proveedor y de SDK propietario |

**Conclusión:** la alternativa B ofrece el mejor equilibrio: desacopla la IA
(`AssistantGateway`/AI SDK) del proveedor, mantiene los secretos en el backend,
es portable a cualquier VPS con Node/Docker y es la más testable. n8n (A) queda
descartado como integración del asistente del MVP; el SDK directo (C) no aporta
las fronteras de `SchoolRepository`/servicios que el asistente necesita.

## 5. Decisión adoptada

1. **Backend propio** en **Node.js 22 + TypeScript estricto + Express + Zod +
   AI SDK 7**, salvo impedimento técnico documentado en la implementación.
2. **AI SDK usado como librería open source**: no exige desplegar en Vercel. Se
   usará el **paquete directo del proveedor** (`@ai-sdk/<proveedor>`) con modelo
   configurable vía variables de entorno; **sin AI Gateway por defecto**.
3. **Despliegue:** localhost durante desarrollo; contenedor Docker en VPS.
4. **Persistencia MVP:** memoria de proceso, inicializada desde seeds
   deterministas (mismo dataset que el mock móvil actual).
5. **API:** REST JSON versionada bajo `/v1`.
6. **RAG:** fuera de alcance mientras las consultas sean sobre datos
   estructurados.
7. **Conversaciones:** en memoria, preparadas para persistencia posterior.
8. **Escritura por la IA:** no permitida; las tools son únicamente de lectura.
9. **Seguridad:** secretos solo en backend; modo demo explícito.
10. **Evolución:** sustituir el adaptador en memoria por Supabase sin cambiar
    la UI ni las tools.

> **Mismo estado en memoria:** el móvil y el asistente leen el mismo estado
> demo. El móvil consume hoy `InMemorySchoolRepository` y el backend ampliado
> usará un almacén propio inicializado con **el mismo generador determinista**
> (`createMockSchoolData`, misma semilla `20260819`), de modo que lo que el
> profesorado ve en pantalla y lo que el asistente consulta vía tools son
> equivalentes. Cuando el móvil consuma el backend (hito 11), ambas partes
> leerán literalmente la misma instancia en memoria.

### 5.1 Fronteras de arquitectura

```
mobile (React Native)                 backend (Node 22 + TS + Express + Zod)
┌──────────────────────┐              ┌─────────────────────────────────────┐
│ AssistantGateway     │──HTTP /v1──▶ │ AssistantController                 │
│ (contrato actual)    │              │   → AssistantService (AI SDK)       │
│ SchoolRepository     │              │   → Tools (solo lectura)            │
│ (solo en MVP móvil)  │              │       → ApplicationServices         │
└──────────────────────┘              │           → SchoolRepository        │
                                      │               → InMemoryStore       │
                                      └─────────────────────────────────────┘
```

- `SchoolRepository` (backend): mismo contrato conceptual que el móvil, con la
  implementación en memoria (`InMemoryStore`). Sustituible por Supabase.
- Servicios de aplicación: encapsulan las consultas de negocio que las tools
  del asistente invocan.
- `AssistantGateway` (backend): envuelve el AI SDK con proveedor directo;
  sustituible por fake durante tests.

## 6. Ciclo de vida del almacén en memoria

- **Una instancia compartida** por proceso, creada en el arranque del backend.
- Dataset inicializado desde seeds deterministas (misma semilla que el mock
  móvil) para que el estado sea reproducible.
- **Reinicio al recrear el proceso**: cualquier mutación (p. ej. conversaciones
  nuevas o futuras escrituras) se pierde al reiniciar el contenedor.
- **Sin escalado horizontal**: no habrá varias réplicas porque el estado vive en
  memoria de proceso; escalar exigiría persistencia compartida (Supabase), que
  es justamente el hito posterior.

## 7. Contrato inicial del asistente

`POST /v1/assistant/messages` (no streaming):

```jsonc
// Request
{ "message": "¿Quién ha faltado más esta semana?", "conversationId": "conv-1" }

// Response 200
{ "message": "En 1.º BACHILLER D, ...", "conversationId": "conv-1" }
```

- Se conservan `message` y `conversationId` para mantener compatibilidad con el
  contrato móvil actual (`AssistantRequest`/`AssistantResponse`).
- Las **tools del asistente consultan servicios de aplicación** del backend; no
  leen archivos mock ni llaman por HTTP al propio backend desde dentro.

## 8. Seguridad y modo demo

- Los secretos (API key del proveedor de IA, etc.) viven solo en variables de
  entorno del backend; nunca en el móvil ni en el repositorio.
- El modo demo es explícito (variable de entorno) y no requiere credenciales
  reales para ejecutar la app.
- La autenticación del backend (cómo el móvil se autentica contra `/v1`) queda
  como **decisión aplazada** vinculada a Q-012 y al modelo de sesión HU-001.

## 9. Migración a Supabase

La transición se realiza **por sustitución del adaptador**: se implementa una
nueva `SchoolRepository` sobre Supabase (tablas, RLS y migraciones versionadas,
según AGENTS.md §11) y se cambia la fábrica del composition root del backend.
La UI móvil, los servicios de aplicación y las tools del asistente no cambian.
Esta migración está fuera del alcance de este RFC y se planificará como hito
posterior.

## 10. Decisiones confirmadas y aplazadas

### Decisiones confirmadas

- Backend propio Node.js 22 + TypeScript + Express + Zod + AI SDK 7.
- AI SDK open source, sin despliegue obligatorio en Vercel; paquete directo del
  proveedor, sin AI Gateway por defecto.
- Almacén en memoria de proceso con seeds deterministas; una instancia; sin
  escalado horizontal.
- REST JSON versionada bajo `/v1`; contrato no streaming en
  `POST /v1/assistant/messages` conservando `message` y `conversationId`.
- Tools de solo lectura que consultan servicios de aplicación.
- RAG fuera de alcance para datos estructurados del MVP.
- Migración a Supabase por sustitución de adaptador.
- n8n descartado como integración del asistente del MVP (resuelve Q-009).

### Decisiones aplazadas

- Autenticación/autorización del backend contra el móvil (Q-012).
- Streaming del asistente (contrato inicial no streaming).
- Proveedor y modelo concretos de IA para el despliegue real.
- RAG para datos no estructurados.
- Persistencia real (Supabase) y escalado horizontal.

## 11. Consecuencias y trazabilidad

- **Q-009 queda resuelta** en `spec/05-open-questions.md`.
- Integraciones: se sustituye INT-N8N-001 por INT-BACKEND-001/INT-ASSISTANT-001
  y se aplaza INT-RAG-001 en `spec/04-data-and-integrations.md`.
- Trazabilidad y roadmap actualizados en `spec/06-traceability.md` y
  `spec/02-roadmap.md`; HU-002 revisada en `spec/features/HU-002-consultar-asistente-ia.md`.
- El siguiente hito (fuera de este RFC) implementará el backend descrito.

## 12. Fuera de alcance

- Implementar backend, endpoints, Dockerfile o dependencias.
- Modificar pantallas móviles.
- Conectar un proveedor real de IA.
- Implementar Supabase, RAG, correo real o alertas normativas.