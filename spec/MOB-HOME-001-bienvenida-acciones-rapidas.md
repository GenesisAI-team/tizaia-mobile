# MOB-HOME-001 — Bienvenida conversacional y accesos rápidos en Home

**Estado:** ready para implementación (propuesta visual temporal para la demostración del MVP).  
**Alcance:** aplicación móvil, frontend.  
**Issue:** #109.  
**Trazabilidad:** HU-002 / RF-CHAT-001, 002, 003, 005, 006; HU-003 / RF-NAV-001..007. La mejora añade una forma de entrar a los módulos existentes y conserva el chat y la navegación requeridos.

## Necesidad y objetivo

Al iniciar sesión, Home presenta actualmente una sola burbuja «Buenas 👋 ¿En qué te puedo ayudar?» sobre un espacio vacío. Para la demostración docente, ofrecer un primer paso reconocible —asistencia, tareas, alumnado, etc.— ayuda a descubrir las funciones de apoyo al profesorado sin obligar a formular primero una consulta. El campo del asistente seguirá a la vista para quien prefiera conversar directamente.

La referencia visual de la tercera captura aportada por el solicitante es la **organización de las opciones** (saludo y tarjetas), no su paleta ni una pantalla adicional. Las dos primeras capturas muestran el estado actual de Home y su conversación.

## Comportamiento funcional

1. **Home sin conversación enviada:** mostrar una bienvenida breve y cálida, por ejemplo «Hola 👋 ¿Qué necesitas hoy?», seguida de 3 o 4 acciones rápidas seleccionadas de las cinco rutas siguientes. El bloque debe parecer una sugerencia del asistente, no sustituir el menú global. Mantener visibles el título HOME, el header, el campo «Compañero, escríbeme aquí…», el botón de envío y la TabBar. El texto introductorio no representa una respuesta del LLM ni se incorpora al historial.
2. **Acciones de navegación:** cada tarjeta tiene icono o marca, texto legible y destino fijo. Usar el `Drawer` existente y su `RootDrawerParamList`, con una ruta tipada por acción:

   | Texto sugerido | Ruta | Pantalla |
   | --- | --- | --- |
   | Revisar asistencia | `Attendance` | Asistencia |
   | Consultar alumnos | `Students` | Alumnos |
   | Ver tareas | `Tasks` | Tareas |
   | Abrir anotaciones | `Annotations` | Anotaciones |
   | Leer correo | `Mail` | Mails |

   Pulsar una tarjeta navega directamente; no escribe en el chat, no llama a `AssistantGateway` y no crea un `conversationId`. El usuario puede volver a Home mediante la navegación habitual.
3. **Variedad ligera:** definir en frontend unos pocos conjuntos estáticos de 3 o 4 acciones con etiquetas breves (p. ej. asistencia/tareas/alumnos; anotaciones/correo/asistencia; alumnos/tareas/anotaciones). Elegir uno al entrar en Home mientras todavía no se haya enviado un mensaje. Mantenerlo estable durante la misma visita para que enfocar el teclado o re-renderizar no reordene las tarjetas. Al regresar desde una acción, si el historial sigue vacío, puede elegirse otro conjunto. No usar datos escolares, fechas, recuentos, promesas de «pendientes» ni llamadas de red para construir las sugerencias.
4. **Escritura directa:** el campo funciona desde el primer momento. En cuanto el borrador contenga texto no vacío, ocultar suavemente la bienvenida y dejar visible el compositor. Si el usuario borra el borrador antes de enviar y aún no existe conversación, puede reaparecer. El envío de texto válido debe seguir exactamente el flujo actual de `sendDraft`; el primer mensaje del usuario y la respuesta o el error aparecen en la lista de chat.
5. **Primer envío y persistencia durante la visita:** tras enviar el primer mensaje, retirar definitivamente el bloque de bienvenida para esa instancia de Home, incluso si el borrador se vacía, la petición falla o el usuario cambia de módulo y vuelve. No reiniciar `messages`, `conversationIdRef` ni el estado del envío por enfocar/desenfocar Home. Al iniciar una nueva sesión/instancia sin conversación, la bienvenida vuelve a estar disponible. La bienvenida reemplaza la burbuja local de saludo inicial para evitar dos saludos simultáneos; una vez iniciada la conversación, la lista contiene los mensajes reales del turno.
6. **Transición:** salida discreta con `opacity` y un desplazamiento vertical corto, alrededor de 200–250 ms. No bloquear ni retrasar `sendDraft` ni la navegación. Respetar la preferencia de movimiento reducido con una transición inmediata o equivalente. Evitar saltos de contenido, especialmente al abrir el teclado en Android.

## Diseño y puntos de integración

- Partir de `mobile/src/features/assistant/presentation/HomeScreen.tsx`: `ASSISTANT_GREETING` y el mensaje `greeting` son locales; `FlatList` muestra el chat y `KeyboardAvoidingView` sitúa el compositor. Un componente presentacional pequeño para bienvenida/tarjetas es opcional si mantiene Home legible.
- Navegar con las rutas ya registradas en `mobile/src/navigation/AppDrawerNavigator.tsx` y tipadas en `mobile/src/navigation/types.ts`. No crear una segunda pantalla de menú ni modificar las rutas existentes. El acceso por logo, el drawer y la TabBar deben seguir funcionando.
- Seguir `DESIGN.md` §2, §3 y §5.1 y los tokens de `mobile/src/shared/theme/tizaiaTheme.ts`: degradado melocotón, superficies blancas translúcidas, tinta oscura, radios suaves y tipografía actual. Priorizar un saludo claro y tarjetas compactas; no copiar los colores ni la densidad de la tercera referencia. Usar etiquetas específicas de acción y áreas táctiles cómodas para Android.
- Situar la bienvenida dentro del espacio conversacional, con scroll cuando falte altura, sin solaparse con input/TabBar. Verificar pantalla pequeña, fuente ampliada y teclado abierto. Proporcionar `accessibilityRole="button"`, nombre accesible descriptivo y foco coherente para cada acción; no depender solo del icono o del color.
- La selección de variantes es puramente visual. No añadir dependencia, persistencia, endpoint, tool, prompt ni lectura adicional del backend.

## Criterios de aceptación verificables

- [ ] Tras iniciar sesión, Home sin turnos muestra el saludo, 3–4 acciones y el campo de entrada visible, con estilo coherente con TizaIA.
- [ ] Las cinco opciones tienen mapeo correcto a las rutas existentes; cada conjunto mostrado contiene solo opciones disponibles y ninguna duplica otra dentro del mismo conjunto.
- [ ] Pulsar cada opción abre su módulo sin añadir mensajes ni invocar el gateway. Volver a Home sin haber enviado mensajes permite ver bienvenida, con una variante estable durante cada visita.
- [ ] Escribir directamente oculta la bienvenida con una transición discreta; borrar el texto sin enviar permite recuperarla. Enviar la primera consulta produce un solo turno real, oculta la bienvenida aunque falle el gateway y mantiene el historial y `conversationId` en turnos sucesivos.
- [ ] Tras una conversación, navegar fuera y volver mantiene el chat en curso y no vuelve a mostrar la bienvenida. Un inicio limpio sin conversación la muestra de nuevo.
- [ ] El teclado, la TabBar, el drawer, el botón atrás y la interacción táctil/accesible siguen siendo utilizables en Android, también en un dispositivo pequeño y con texto ampliado o movimiento reducido.

## Validación para quien implemente

1. Pruebas de comportamiento de Home con `AssistantGateway` simulado: estado inicial, navegación por tarjeta sin envío, redacción/borrado, primer envío, error recuperable y conservación de conversación tras volver. Comprobar el destino de cada acción sin duplicar la tabla de implementación de forma tautológica.
2. `pnpm --dir mobile validate` (typecheck, lint, tests y formato).
3. Comprobación visual/manual en Android: Home recién autenticado, teclado, pantalla estrecha, texto grande, movimiento reducido y regreso desde un módulo. Adjuntar capturas del antes/después a la PR de implementación si están disponibles.

## Límites

Esta PR documenta el encargo para OpenCode; **no implementa aún la interfaz**. La futura implementación debe quedar en esta misma rama/PR o en una continuación vinculada antes de considerarla lista para revisión. No cambiar backend, Supabase, AI SDK, tools, contrato `AssistantGateway`, lógica de asistencia ni especificación normativa de HU-002/HU-003. La decisión de conservar esta bienvenida después de la presentación queda abierta.
