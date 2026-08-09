# Tizaia Android foundation

## Requisitos

- Node.js LTS, PNPM 10+, Android Studio, Android SDK Platform/Build Tools compatibles con Expo SDK 57 y un emulador o dispositivo Android con depuración USB.
- Java 17 para Gradle/Expo SDK 57. Configurar `ANDROID_HOME` y añadir `platform-tools` al PATH.

El entorno de validación usa JDK 17.0.20 (Eclipse Adoptium). Si Gradle toma otra JVM, define `JAVA_HOME` antes de ejecutar el build.

En la última comprobación Gradle inició correctamente, pero el build nativo falló durante CMake/Prefab porque Windows no pudo iniciar los `prefab_command.bat` generados para `expo-modules-core` y `react-native-screens`. Revisar la instalación/configuración de CMake/Prefab del Android SDK.

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
