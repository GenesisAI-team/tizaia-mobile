# HU-001 — Acceder a la aplicación

Como profesor/a, quiero registrarme e iniciar sesión mediante Google o correo/contraseña para acceder a las funcionalidades docentes.

**Criterios:** dado el login, autorizar Google válido abre Home; credenciales válidas abren Home; credenciales inválidas no crean sesión; al cargar se ve el icono. RF-AUTH-001..006, INT-GOOGLE-001. Q-006 mantiene pendientes alta, errores, recuperación y sesión expirada.

## Implementación fase 1

HU-001 dispone de un gateway sustituible, autenticación Supabase por correo/contraseña y OAuth Google, restauración de sesión persistida, logout y Home mínima. El navegador autenticado usa el esquema Android `tizaia://auth/callback`; la URL debe estar permitida en Supabase y Google debe estar configurado en el proyecto. Las rutas futuras están tipadas, pero no se montan como navegación de HU-003.

Fuentes consultadas: Context7 (`/supabase/supabase-js`, sesión persistida y Auth API), [Supabase Auth con Expo React Native](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth), [Google Auth en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [Expo AuthSession](https://docs.expo.dev/guides/authentication/). La primera anotación de la sesión indicaba erróneamente que Context7 no estaba disponible.

## Implementación fase 2 (diseño estructural del login, issue #12)

La pantalla Login aplica el diseño estructural aprobado: `AppLogo` (placeholder circular con borde y texto LOGO, reutilizable en el header autenticado de HU-003) visible al cargar (RF-AUTH-005), título y botón primario "Iniciar Sesión", botón "Continuar con Google" con la G multicolor a la izquierda, contenido centrado con ancho máximo ~420px y `KeyboardAvoidingView` + `ScrollView`. La lógica de auth (gateway, `useAuth`, estados loading/error) no se modificó.

Registro Context7 — Biblioteca: react-native-svg 15.15.4 (instalada con `npx expo install` para Expo SDK 57; justificación: la G multicolor de Google no existe en `@expo/vector-icons`, solo monocroma). Library ID: `/software-mansion/react-native-svg`. Consulta: renderizado de icono con `Svg`/`Path` (`viewBox`, `fill`), accesibilidad e instalación en Expo. Decisión: componente `GoogleGIcon` en `src/shared/components/` con los 4 colores oficiales de marca Google (#4285F4, #34A853, #FBBC05, #EA4335), decorativo (el botón aporta la etiqueta accesible). Sin fallback.

## Implementación fase 3 (transiciones y feedback de auth, issue #86 / AUTH-UX-086)

Se separó el booleano único `isLoading` en `isInitializing` (restauración de
sesión) e `isAuthenticating` (operación del usuario); `isLoading` se mantiene
derivado (`isInitializing || isAuthenticating`) solo como compatibilidad.
Criterios verificados: al cargar se ve el icono/marca (RF-AUTH-005) en la nueva
`AuthLoadingScreen` con identidad TizaIA (degradado + marca + loader discreto,
sin pantalla blanca); el login permanece montado durante el OAuth con el botón
de Google deshabilitado mostrando spinner inline + "Entrando…"; los
deshabilitados y el feedback de error son recuperables.

El login ya no muestra un loader global (`accessibilityLabel="Cargando"`
eliminado): el spinner queda dentro del botón. Se añadió `BrandBlock`
(marca + TIZAIA + tagline) compartido por `LoginScreen` y `AuthLoadingScreen`
para no duplicar estilos. `RootNavigator` decide: `isInitializing` →
`AuthLoadingScreen`; sesión → app; resto → `LoginScreen`.

`supabaseAuthGateway` precalienta la URL OAuth con `mayInitWithUrlAsync`
(Android-only, tolerante a fallos) antes de `openAuthSessionAsync`, y
`LoginScreen` ejecuta `WebBrowser.warmUpAsync()`/`coolDownAsync()` en
montaje/desmontaje. Registro Context7 — Biblioteca: expo-web-browser v57
(SDK 57). Library ID: `/websites/expo_dev_versions`. Decisión: mantener
Supabase OAuth + Custom Tabs; no migrar a Google Sign-In nativo en este MVP
(detalle en `spec/01-tech-stack.md`, sección AUTH-UX-086). Pruebas: unitarias
de `AuthProvider`, `RootNavigator`/`App`, `LoginScreen` y gateway; todas sin red.
