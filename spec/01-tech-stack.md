# Stack técnico y decisiones de foundation

- Android-only, React Native, Expo SDK 57, TypeScript estricto y PNPM.
- Navegación preparada con React Navigation (native stack); no se implementan rutas de feature en este bootstrap.
- Supabase JS queda aislado en `mobile/src/infrastructure/supabase/` y usa solo variables `EXPO_PUBLIC_*` públicas.
- El asistente depende del contrato `AssistantGateway`; `FakeAssistantGateway` permite tests y `N8nAssistantGateway` es una implementación HTTP sustituible (no conectada hoy).
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
- El endpoint del asistente (`/v1/assistant/messages`) llega con AI-001 (#69).

## Documentación consultada

Expo create-project/TypeScript y CNG, y Supabase Expo React Native quickstart (enlaces en el README). En la implementación de HU-001 se usaron además Context7 para Supabase JS y las guías oficiales actuales de Expo/Supabase; la anotación previa de que Context7 no estaba disponible era incorrecta. Para RFC-001 se consultará la documentación oficial de AI SDK (versión 7) antes de incorporar dependencias.

