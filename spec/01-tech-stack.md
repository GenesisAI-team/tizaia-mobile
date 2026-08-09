# Stack técnico y decisiones de foundation

- Android-only, React Native, Expo SDK 57, TypeScript estricto y PNPM.
- Navegación preparada con React Navigation (native stack); no se implementan rutas de feature en este bootstrap.
- Supabase JS queda aislado en `mobile/src/infrastructure/supabase/` y usa solo variables `EXPO_PUBLIC_*` públicas.
- El asistente depende del contrato `AssistantGateway`; `N8nAssistantGateway` es una implementación HTTP sustituible y `FakeAssistantGateway` permite tests.
- Se genera `mobile/android/` con Expo Prebuild. No se crea ni mantiene `ios/`.

## Documentación consultada

Expo create-project/TypeScript y CNG, y Supabase Expo React Native quickstart (enlaces en el README). Context7 no estaba disponible como herramienta MCP en esta sesión; no se inventaron APIs y se usaron las guías oficiales actuales.

