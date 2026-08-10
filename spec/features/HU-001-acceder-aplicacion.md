# HU-001 — Acceder a la aplicación

Como profesor/a, quiero registrarme e iniciar sesión mediante Google o correo/contraseña para acceder a las funcionalidades docentes.

**Criterios:** dado el login, autorizar Google válido abre Home; credenciales válidas abren Home; credenciales inválidas no crean sesión; al cargar se ve el icono. RF-AUTH-001..006, INT-GOOGLE-001. Q-006 mantiene pendientes alta, errores, recuperación y sesión expirada.

## Implementación fase 1

HU-001 dispone de un gateway sustituible, autenticación Supabase por correo/contraseña y OAuth Google, restauración de sesión persistida, logout y Home mínima. El navegador autenticado usa el esquema Android `tizaia://auth/callback`; la URL debe estar permitida en Supabase y Google debe estar configurado en el proyecto. Las rutas futuras están tipadas, pero no se montan como navegación de HU-003.

Fuentes consultadas: Context7 (`/supabase/supabase-js`, sesión persistida y Auth API), [Supabase Auth con Expo React Native](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth), [Google Auth en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [Expo AuthSession](https://docs.expo.dev/guides/authentication/). La primera anotación de la sesión indicaba erróneamente que Context7 no estaba disponible.

## Implementación fase 2 (diseño estructural del login, issue #12)

La pantalla Login aplica el diseño estructural aprobado: `AppLogo` (placeholder circular con borde y texto LOGO, reutilizable en el header autenticado de HU-003) visible al cargar (RF-AUTH-005), título y botón primario "Iniciar Sesión", botón "Continuar con Google" con la G multicolor a la izquierda, contenido centrado con ancho máximo ~420px y `KeyboardAvoidingView` + `ScrollView`. La lógica de auth (gateway, `useAuth`, estados loading/error) no se modificó.

Registro Context7 — Biblioteca: react-native-svg 15.15.4 (instalada con `npx expo install` para Expo SDK 57; justificación: la G multicolor de Google no existe en `@expo/vector-icons`, solo monocroma). Library ID: `/software-mansion/react-native-svg`. Consulta: renderizado de icono con `Svg`/`Path` (`viewBox`, `fill`), accesibilidad e instalación en Expo. Decisión: componente `GoogleGIcon` en `src/shared/components/` con los 4 colores oficiales de marca Google (#4285F4, #34A853, #FBBC05, #EA4335), decorativo (el botón aporta la etiqueta accesible). Sin fallback.
