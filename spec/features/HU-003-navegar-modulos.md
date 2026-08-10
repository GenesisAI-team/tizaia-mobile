# HU-003 — Navegar entre módulos

Como profesor/a autenticado/a, quiero moverme entre Home, Asistencia, Alumnos, Tareas, Mails y Anotaciones y cerrar sesión. El logo abre Home, el menú hamburguesa muestra navegación, cada opción abre su pantalla y Salir cierra sesión. RF-NAV-001..008. Sesión expirada y confirmación de salida: pendientes.

## Implementación (issue #13)

- Navegación autenticada con `@react-navigation/drawer` v7: `mobile/src/navigation/AppDrawerNavigator.tsx` registra Home + 5 módulos; sin sesión se muestra `LoginScreen` (App.tsx).
- Header compartido vía `screenOptions` del Drawer: logo pulsable a la izquierda que abre Home (RF-NAV-001/002) y botón hamburguesa a la derecha que abre el drawer. `AppLogo` en `src/shared/components/AppLogo.tsx` (contrato `{ size?: number }`, óvalo bordeado con texto LOGO, puramente presentacional; coordinado con issue #12).
- Drawer desde la derecha, ancho completo, contenido personalizado `AppDrawerContent` con 6 filas bordeadas en mayúsculas: ASISTENCIA, ALUMNOS, TAREAS, MAILS, ANOTACIONES, SALIR (RF-NAV-003..007). SALIR llama a `signOut()` de `useAuth` (RF-NAV-008); al perderse la sesión las rutas protegidas se desmontan. Sin opción Home en el menú (acceso por logo).
- Lógica del menú extraída y testeable en `mobile/src/navigation/drawerMenu.ts` con tests en `drawerMenu.test.ts`.
- Home shell en `src/features/assistant/presentation/HomeScreen.tsx`: título centrado y subrayado "Tu asistente virtual", FlatList con burbuja inicial del asistente, entrada inferior con placeholder "Compañero, escríbeme aquí…" y envío cableado a `FakeAssistantGateway`; `KeyboardAvoidingView` con offset del header (`useHeaderHeight`). Lógica real del asistente: HU-002 (pendiente).
- Pantallas placeholder en `src/features/<feature>/presentation/` con componente compartido `src/shared/components/PlaceholderScreen.tsx` (título + "En construcción").
- Botón atrás de Android: el drawer abierto se cierra con atrás por comportamiento estándar de `@react-navigation/drawer` (documentado en reactnavigation.org).
- Decisiones documentadas: consultas Context7 a React Navigation v7 (`/websites/reactnavigation`: drawer, back behavior) y React Native (`/react/react-native-website`: KeyboardAvoidingView). Dependencias instaladas con `npx expo install` (SDK 57): `@react-navigation/drawer` ^7.13.8, `react-native-gesture-handler` ~2.32.0, `react-native-reanimated` 4.5.1; `import 'react-native-gesture-handler'` al inicio de `index.ts`.
- Pendientes sin cambios: sesión expirada y confirmación antes de salir (spec y Q-006).

