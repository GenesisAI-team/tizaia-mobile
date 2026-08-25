# Stack técnico y decisiones de foundation

- Android-only, React Native, Expo SDK 57, TypeScript estricto y PNPM.
- Navegación preparada con React Navigation (native stack); no se implementan rutas de feature en este bootstrap.
- Supabase JS queda aislado en `mobile/src/infrastructure/supabase/` y usa solo variables `EXPO_PUBLIC_*` públicas.
- El asistente depende del contrato `AssistantGateway`; `FakeAssistantGateway`
  queda para desarrollo aislado/tests y `ApiAssistantGateway` consume el
  backend propio (AI-001). n8n queda eliminado del repo tras Q-009/RFC-001.
- Se genera `mobile/android/` con Expo Prebuild. No se crea ni mantiene `ios/`.

## Backend del MVP ampliado (RFC-001)

Según [RFC-001](07-assistant-backend-rfc.md), el asistente del MVP ampliado se
sirve de un backend propio:

- **Node.js 22 + TypeScript estricto + Express + Zod + AI SDK 7**, salvo impedimento técnico documentado.
- **AI SDK como librería open source**: no exige desplegar en Vercel; se usa el paquete directo del proveedor con modelo configurable y sin AI Gateway por defecto.
- Despliegue local durante desarrollo y en contenedor Docker sobre cualquier VPS con Node 22.
- Almacén en memoria de proceso con seeds deterministas (una instancia, sin escalado horizontal); sustituible por Supabase por cambio de adaptador.
- API REST JSON versionada bajo `/v1`; contrato no streaming en `POST /v1/assistant/messages` conservando `message` y `conversationId`.
- El móvil consumirá ese backend mediante un `AssistantGateway` HTTP; RAG queda fuera de alcance mientras los datos sean estructurados (Q-009 resuelta en `05-open-questions.md`).

### Implementación actual (API-001)

- El backend vive en `backend/` (paquete PNPM independiente, ESM, Node ≥22):
  Express 5, Zod 4 y CORS configurable; tests con `node:test` + `tsx` sin red externa.
- Arquitectura: `src/domain` (modelos y puerto `SchoolRepository`),
  `src/application` (`SchoolService`), `src/infrastructure/memory`
  (`MemorySchoolRepository`, store singleton) e `infrastructure/http`
  (rutas versionadas bajo `/v1`, validación Zod y errores estables).
- Seeds deterministas en `src/seeds` (misma semilla que el mock móvil) con los
  campos mínimos nuevos: nacimiento, correo educativo, contactos,
  cuerpo/destinatarios de correo y estado gestionado de anotaciones.
- Dockerfile multi-stage (Node 22-alpine, usuario no root, healthcheck
  `/health`). Ejecución y contratos: [`backend/README.md`](../backend/README.md).

### Asistente con AI SDK (AI-001)

- **`ai` 7.x + `@ai-sdk/openai`** (paquete directo del proveedor; sin AI
  Gateway ni servicios de Vercel). Documentación oficial de AI SDK consultada
  vía Context7 antes de incorporar dependencias (`generateText`, `tool()` con
  esquemas Zod, `stopWhen`, `MockLanguageModelV4` de `ai/test` para pruebas
  sin proveedor real).
- `infrastructure/ai/`: `modelProvider.ts` (proveedor/modelo por entorno,
  intercambiable sin tocar tools), `conversationStore.ts` (historial en
  memoria con TTL y límite de mensajes), `schoolAssistant.ts` (instrucciones
  anti-alucinación, límite de pasos y timeout con error tipado) y `tools/`
  (20 tools de lectura por dominio sobre `SchoolService`; ninguna importa
  seeds ni llama por HTTP a la propia API).
- `POST /v1/assistant/messages` no streaming: 400 payload inválido,
  404 conversación inexistente/expirada, 503 `ASSISTANT_UNAVAILABLE` si falta
  la clave del proveedor, 504 `ASSISTANT_TIMEOUT` y 502
  `ASSISTANT_PROVIDER_ERROR` estables sin filtrar detalles internos.
- Configuración solo en el backend (`AI_PROVIDER`, `AI_MODEL`,
  `OPENAI_API_KEY`, `AI_MAX_STEPS=6`, `AI_TIMEOUT_MS=30000`,
  `CONVERSATION_TTL_MS`, `CONVERSATION_MAX_MESSAGES`): ver
  [`backend/.env.example`](../backend/.env.example).
- Fechas relativas («hoy»/«ayer») resueltas en el backend con
  `Europe/Madrid` y reloj inyectable (testeable).

### Consumo móvil de la API (MOB-API-001)

- Puerto `SchoolRepository` del móvil **async** (`Promise<T>`), misma frontera
  que el backend: sustituible por Supabase sin tocar pantallas (RFC-001 §9).
- Adaptador HTTP en `mobile/src/infrastructure/api/` (`apiClient` con timeout
  y normalización de la envolvente de errores, DTOs propios, mappers y
  `ApiSchoolRepository`). Las pantallas no llaman a `fetch` ni importan
  modelos del backend.
- Estado compartido mínimo en `shared/state/`: provider de invalidación +
  `useSchoolResource` (loading/success/empty/error con reintento). Sin React
  Query por decisión de la issue #68.
- Mutaciones: optimistas con rollback en asistencia, entregas, gestión de
  anotaciones y lectura de correo; confirmadas con recarga en crear/borrar/
  editar. Documentado por dominio en el código.
- Configuración pública: `EXPO_PUBLIC_API_BASE_URL` con default
  `http://10.0.2.2:3000` (emulador Android); localhost en iOS Simulator e IP
  LAN en dispositivo físico. Sin secretos en variables `EXPO_PUBLIC_*`.
- `InMemorySchoolRepository` deja de ser fuente de verdad en runtime y queda
  como fake async para tests.
- Asistente móvil (AI-001): `ApiAssistantGateway` reutiliza `apiClient`
  (timeout + errores normalizados) contra `/v1/assistant/messages`;
  `EXPO_PUBLIC_ASSISTANT_MODE=api|fake` selecciona la implementación en la
  raíz de composición (por defecto `api`). Sin claves ni SDK del proveedor en
  el bundle.

## Documentación consultada

Expo create-project/TypeScript y CNG, y Supabase Expo React Native quickstart (enlaces en el README). En la implementación de HU-001 se usaron además Context7 para Supabase JS y las guías oficiales actuales de Expo/Supabase; la anotación previa de que Context7 no estaba disponible era incorrecta. Para AI-001 se consultó vía Context7 la documentación oficial de AI SDK (v7: `generateText`/tools/`ai/test`) antes de incorporar `ai@7.0.78` y `@ai-sdk/openai@4.x`.
