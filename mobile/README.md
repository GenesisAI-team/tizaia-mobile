# Tizaia Android foundation

## Requisitos

- Node.js LTS, PNPM 10+, Android Studio, Android SDK Platform/Build Tools compatibles con Expo SDK 57 y un emulador o dispositivo Android con depuración USB.
- Java 17 para Gradle/Expo SDK 57. Configurar `ANDROID_HOME` y añadir `platform-tools` al PATH.

En esta máquina el build nativo no pudo completarse porque `java -version` devuelve 1.8.0_401; Gradle 9.3.1 exige Java 17 o posterior. Instala/configura JDK 17 y repite `pnpm build:android:debug`.

## Desarrollo

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
pnpm android
```

Las variables `EXPO_PUBLIC_*` son configuración pública del cliente; no guardar secretos. El proyecto solo genera Android (`android/`); no se mantiene soporte iOS.

## Calidad y native checks

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm validate
pnpm prebuild:android
pnpm build:android:debug
```

El prebuild regenerable usa CNG. Las migraciones, tablas y RLS de Supabase están fuera de BOOTSTRAP-001.
