# Tizaia Android foundation

Consulta la [guía de errores comunes](../ERRORES_COMUNES.md) para diagnosticar Context7, Gradle y JDK.

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

Para iniciar Expo limpiando la caché:

```powershell
pnpm start:clear
```

Las variables `EXPO_PUBLIC_*` son configuración pública del cliente; no guardar secretos. El proyecto solo genera Android (`android/`); no se mantiene soporte iOS.

## Conexión al backend propio (MOB-API-001)

La app consume la API en memoria de #67 vía `EXPO_PUBLIC_API_BASE_URL`
(default `http://10.0.2.2:3000`).

| Entorno móvil                    | URL del backend                   |
| -------------------------------- | --------------------------------- |
| Emulador Android                 | `http://10.0.2.2:3000`            |
| iOS Simulator (fuera de alcance) | `http://localhost:3000`           |
| Dispositivo físico               | `http://<IP-LAN-del-equipo>:3000` |

Flujo de verificación manual:

1. Levantar el backend: `pnpm --dir backend dev` y comprobar `curl http://localhost:3000/health`.
2. Arrancar la app (`pnpm dev`) con el emulador apuntando a `10.0.2.2:3000`.
3. Cambiar asistencia, gestionar una anotación, marcar un correo como leído, crear anotación/mail y eliminar un alumno.
4. Navegar entre pantallas: los cambios persisten sin reiniciar la app.
5. Verificar contra el backend (`curl /v1/bootstrap` o los endpoints de dominio).
6. Reiniciar el backend: el seed determinista se restaura.

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
