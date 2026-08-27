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

## UI: sistema de skeleton loading (issue #85)

Las pantallas de datos muestran durante la **primera carga** un esqueleto con la
estructura del contenido real (lista de alumnos, bandeja, matriz de
asistencia/tareas, perfil, clases) en lugar del spinner global. Mejora la
percepción de rendimiento y reduce el salto visual al llegar los datos.

- **Decisión técnica**: se usa `react-native-reanimated` (ya presente en el
  stack, 4.5.1) para el pulso de opacidad 0.45→0.85; **no** se añade una
  librería de skeletons ni se duplica la animación. `react-native-worklets`
  es peer dependency de Reanimated y no se declara explícitamente.
- **Cuándo skeleton y cuándo spinner**: skeleton = primera carga con
  estructura conocida (`DataStateView` con prop `skeleton`); spinner =
  mutaciones y formularios (botones de guardado, preload de
  `NewMailScreen`/`NewAnnotationScreen`), donde el texto de estado ya
  comunica la operación.
- **Tokens**: los bloques usan `tizaiaColors.skeleton` y los radios de
  `tizaiaRadius`/`dp()`; la geometría de cada composición imita las tarjetas
  reales (avatar, líneas, acciones, matriz) para que el skeleton "se
  convierta" en el contenido.
- **Accesibilidad**: los bloques son decorativos (`accessible={false}` y
  `importantForAccessibility="no-hide-descendants"`); el contenedor expone
  "Cargando contenido" al lector. La animación se detiene si el sistema
  solicita "reducir movimiento" (`AccessibilityInfo`).
- **Escalabilidad**: al crecer el volumen de datos (Supabase) el skeleton es
  estable: muestra siempre las mismas filas de ejemplo, independiente del
  backend.
- **Regla viewport (refactor #89)**: los skeletons representan el viewport y la
  geometría esperada del contenido, no el número real de registros. Los boards
  de Asistencia (`rows={7}`) y Tareas (`rows={6}`) llenan el área visible con
  valores explícitos por pantalla (KISS, sin cálculo dinámico).
- **Tests**: `react-native-reanimated` y `react-native-worklets` no disponen
  de runtime nativo en Jest; `jest.config.js` incluye `jest-setup.js` con
  `setUpTests()` y el mock oficial de worklets. No se prueban frames.

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
