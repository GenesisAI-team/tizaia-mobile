# HU-001 — Acceder a la aplicación

Como profesor/a, quiero registrarme e iniciar sesión mediante Google o correo/contraseña para acceder a las funcionalidades docentes.

**Criterios:** dado el login, autorizar Google válido abre Home; credenciales válidas abren Home; credenciales inválidas no crean sesión; al cargar se ve el icono. RF-AUTH-001..006, INT-GOOGLE-001. Q-006 mantiene pendientes alta, errores, recuperación y sesión expirada.

## Implementación fase 1

HU-001 dispone de un gateway sustituible, autenticación Supabase por correo/contraseña y OAuth Google, restauración de sesión persistida, logout y Home mínima. El navegador autenticado usa el esquema Android `tizaia://auth/callback`; la URL debe estar permitida en Supabase y Google debe estar configurado en el proyecto. Las rutas futuras están tipadas, pero no se montan como navegación de HU-003.

Fuentes consultadas: Context7 (`/supabase/supabase-js`, sesión persistida y Auth API), [Supabase Auth con Expo React Native](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth), [Google Auth en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [Expo AuthSession](https://docs.expo.dev/guides/authentication/). La primera anotación de la sesión indicaba erróneamente que Context7 no estaba disponible.
