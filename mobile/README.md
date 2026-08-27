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
- **Skeletons scrollables (refactor #91)**: los skeletons de pantallas con
  contenido scrollable (p. ej. `StudentProfileScreen`) respetan el mismo
  contenedor, padding (`styles.content`) y eje de scroll que el contenido final
  para minimizar layout shift y evitar recortes; el `titleBlock` con `flex:1`
  solo se usa dentro de `titleRow`, no como contenedor vertical.
- **Tests**: `react-native-reanimated` y `react-native-worklets` no disponen
  de runtime nativo en Jest; `jest.config.js` incluye `jest-setup.js` con
  `setUpTests()` y el mock oficial de worklets. No se prueban frames.

## Branding: BrandMark, fuente única del logo (issue #95, refine #98)

`shared/components/BrandMark.tsx` es la **fuente única** (single source) del
logotipo de Tizaia: círculo `#FFFFFFC7` con halo melocotón `#F8C4A6` y la
letra "T" en tinta. No se deben crear copias manuales del logo ni de la "T".

Todas las variantes derivan del **mismo base** y escalan sus proporciones a
partir del diámetro `login` (168dp, radio 84, halo 120, T 64) y la
sombra/elevación se escala por variante para mantener círculos concéntricos
y `T` centrada a todas las escalas. Si aparece una "T" nueva, debe
reutilizarse este componente, no duplicarse estilos.

Variantes disponibles (`variant` prop):

| Variante  | Tamaño            | Uso                                                                                                                                                                                             |
| --------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`   | 168dp (grande)    | Pantalla de Login (`LoginScreen`), tamaño intacto, sombra `elevation 6 / radius 17`.                                                                                                            |
| `header`  | 40dp (compacto)   | Header global (`AppHeaderLogo`): cabe en el header sin aumentar su altura, sin recortar el halo ni desplazar el menú, sombra ligera `elevation 2 / radius 4` para centrado óptico (refine #98). |
| `loading` | 72dp (intermedio) | Transición breve de autenticación (`AuthTransitionLoading`, issue #94, refine #98 estático). Sombra intermedia `elevation 4 / radius 10`.                                                       |

El header global reutiliza `BrandMark variant="header"` dentro del botón de
`AppHeaderLogo` (`accessible={false}` para evitar doble lectura accesible: el
botón ya anuncia "Ir a Home").

## Auth: transición breve de marca (issue #94, refine #98)

El loader genérico blanco de `App.tsx` (`ActivityIndicator` centrado) ha sido
sustituido por `AuthTransitionLoading` — una microtransición estática con
identidad TizaIA que se muestra solo mientras `isLoading === true`.

- **Qué cambia (solo visual):** fondo degradado `ScreenBackground` + `BrandMark`
  `variant="loading"` (72dp, intermedia entre `login` y `header`) + palabra
  `TIZAIA` estática (`28/700 ls7`) + `ActivityIndicator` `small` `inkButton`
  debajo. Sin animación de letras ni `Reanimated` en este componente, sin
  `delay` artificial y sin bloquear navegación: si `isLoading` termina antes,
  se muestra `Home`/`Login` inmediatamente; si tarda más, el spinner permanece
  discreto. Sirve para restauración inicial, fin de login Google/password y
  cierre de sesión (mismo `isLoading`).
- **Qué NO cambia:** `AuthProvider` mantiene un único `isLoading`, `RootNavigator`
  solo sustituye el componente visual, `signInWithGoogle` y
  `WebBrowser.openAuthSessionAsync` permanecen intactos, no se reutiliza
  `LoginScreen` como pantalla de espera post-OAuth y no se reintroduce la
  arquitectura `isInitializing/isAuthenticating` de la PR #87.
- **Por qué:** el flujo `Login → Google → [T + TIZAIA estático + spinner] → Home`
  evita la pantalla técnica genérica sin reintroducir la reaparición del login
  con `Entrando…` de la PR #87. La marca no se anima porque el estado suele
  durar décimas y una animación de entrada se corta; la duración sigue
  dependiendo exclusivamente del estado real.
- **Accesibilidad:** contenedor con `accessibilityLabel="Cargando TizaIA"` y
  `role="progressbar"`; spinner con `accessibilityLabel="Cargando"`.

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
