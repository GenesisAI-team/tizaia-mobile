# AGENTS.md — tizaia-mobile (Mobile Teacher App)

Antes de diagnosticar incidencias de herramientas o configurar el entorno, leer `ERRORES_COMUNES.md`. Las consultas técnicas deben usar `resolve_library_id` y `query_docs` desde el MCP de Context7 del runtime del agente; no se debe intentar ejecutar `ALL_TOOLS` desde PowerShell ni desde otra shell. Los diagnósticos Gradle deben registrar la JVM reportada por `gradlew.bat --version`.

## 1. MISIÓN DEL PROYECTO

==================================================

Construir un primer prototipo funcional y entregable de una aplicación móvil de
apoyo al profesorado.

La aplicación permitirá, según la especificación proporcionada:

- Autenticación del profesorado.
- Acceso mediante Google Auth.
- Consulta de un asistente inteligente.
- Navegación entre Home, Asistencia, Alumnos, Tareas, Mails y Anotaciones.
- Registro y consulta de asistencia.
- Seguimiento de entrega de tareas.
- Consulta y gestión de alumnos.
- Consulta y creación de anotaciones.
- Consulta y envío de comunicaciones.
- Comunicaciones individuales, a familias y a grupos.
- Seguimiento de rachas negativas.

El producto es un MVP Android. No se debe ampliar el alcance con funcionalidades
no solicitadas.

- Aplicación móvil **Android** de apoyo al profesorado. Primer MVP.
- El stack técnico completo se define en el punto `7. STACK TÉCNICO`.
- Metodología **SDD** (Spec-Driven Development): la fuente de verdad es el documento de especificación (`Especificacion_requisitos_por_historias_de_usuario.docx-1.pdf`) y su extracción en `spec/`.
- Toda tarea debe ser trazable a HU-001..HU-013 y a sus RF asociados. No se inventan umbrales, permisos ni pantallas: lo no especificado queda como pregunta abierta (Q-xxx).

## 2. FUENTES DE VERDAD

==================================================

Antes de realizar cualquier cambio, se deberán localizar y analizar completamente
estos documentos:

1. `Especificacion_requisitos_por_historias_de_usuario.docx-1.pdf`

La información del proyecto se interpretará teniendo en cuenta, en este orden:

1. Instrucciones explícitas de este prompt.
2. Requisitos normativos del documento de especificación.
3. Historias de usuario y criterios de aceptación.
4. Reglas de negocio, requisitos de datos e integraciones.
5. Decisiones técnicas documentadas por el proyecto.
6. Código existente.

Los bocetos sirven como referencia visual, pero no sustituyen los criterios de
aceptación ni los requisitos normativos.

No se deben inventar requisitos de negocio.

Cuando falte información:

- Se registrará como pregunta abierta.
- Se identificarán los IDs afectados.
- Se diferenciará entre un bloqueo real y una decisión reversible.
- Se continuará con aquello que pueda implementarse de manera segura.
- No se marcará como validada una decisión que siga pendiente.

No se modificará silenciosamente ninguna historia de usuario, requisito, regla de
negocio o criterio de aceptación.

## 3. Metodología Híbrida de Desarrollo: SDD + GitHub Issues + Agent Orchestrator

Este proyecto seguirá una metodología **Spec-Driven Development (SDD)** combinada con GitHub Issues y Agent Orchestrator. La planificación, los requisitos y los criterios de aceptación estarán documentados y versionados, mientras que las tareas concretas se ejecutarán en entornos aislados y se integrarán mediante Pull Requests.

### 3.1. Fuentes de verdad

La especificación funcional y sus archivos derivados en `spec/` serán la fuente principal de verdad del proyecto. El `roadmap.md` recogerá la visión general, las prioridades y las dependencias. Las GitHub Issues describirán el trabajo concreto que debe realizarse, enlazando siempre con la documentación correspondiente sin sustituirla.

Agent Orchestrator gestionará las sesiones de trabajo, los worktrees y las ramas aisladas. Las Pull Requests contendrán los cambios implementados y su validación. La rama principal representará únicamente el trabajo revisado e integrado.

### 3.2. Identificación de tareas

Cada tarea tendrá un identificador estable y único, por ejemplo `MOB-001`, `AUTH-001` o `PAYMENTS-003`.

El identificador deberá utilizarse en el roadmap, en la GitHub Issue, en la Pull Request y en las comunicaciones relacionadas. Esto permitirá mantener la trazabilidad entre requisitos, implementación, revisión y cierre.

### 3.3. Ciclo de vida de una tarea

Las tareas podrán encontrarse en los estados `backlog`, `ready`, `in_progress`, `review`, `blocked` o `done`.

`backlog` indica que la tarea todavía necesita definición. `ready` significa que puede asignarse. `in_progress` indica que existe un agente trabajando en ella. `review` corresponde a una Pull Request pendiente de revisión. `blocked` se utilizará cuando exista una dependencia o decisión pendiente. `done` solo se alcanzará cuando la Pull Request haya sido revisada, integrada, validada y la issue haya sido cerrada.

No se utilizará `implemented` como estado final, porque la existencia de código en una rama no implica que la tarea esté terminada.

### 3.4. Creación de GitHub Issues

Una tarea se convertirá en GitHub Issue cuando tenga un objetivo claro, un alcance limitado, criterios de aceptación verificables, dependencias conocidas y procedimientos de validación definidos. También deberá poder ejecutarse dentro del alcance de una única Pull Request.

Las ideas incompletas permanecerán inicialmente en `roadmap.md` o en la especificación. La issue se creará cuando la tarea alcance el estado `ready`, utilizando GitHub o `gh` CLI cuando sea necesario.

### 3.5. Estructura de una tarea

Cada tarea deberá incluir como mínimo su referencia a la especificación, el contexto, el alcance, aquello que queda fuera de alcance, los criterios de aceptación, la forma de validación y sus dependencias.

La descripción debe ser suficientemente clara para que otro agente pueda ejecutarla sin tener que inventar decisiones funcionales ni consultar información que debería estar documentada.

### 3.6. Ejecución con Agent Orchestrator

Agent Orchestrator se utilizará para coordinar las sesiones de trabajo. El flujo habitual será:

```bash
ao status --json
ao project ls --json
ao spawn --project <id-del-proyecto> --issue <numero-de-issue> --name "<nombre-corto>" --prompt "<tarea>"
```

Para varias tareas independientes se repetirá `ao spawn` con una sesión por issue:

```bash
ao spawn --project <id-del-proyecto> --issue 23 --name "tarea-23"
ao spawn --project <id-del-proyecto> --issue 24 --name "tarea-24"
```

Cada agente trabajará en su propio worktree y rama. El estado del daemon podrá consultarse mediante `ao status --json` y las sesiones mediante `ao session ls --json`. Agent Orchestrator facilitará el seguimiento de ramas, Pull Requests, CI, revisiones y conflictos, pero no sustituirá la revisión humana.

### 3.7. Reglas para los agentes

Antes de modificar código, cada agente deberá leer `AGENTS.md`, la issue asignada y las especificaciones relacionadas. Deberá respetar el alcance de la tarea, evitar refactorizaciones no solicitadas y no asumir decisiones que no estén documentadas.

El agente deberá ejecutar las validaciones indicadas, informar de cualquier bloqueo, crear una Pull Request asociada a la tarea e incluir en ella los cambios realizados, las validaciones y los posibles riesgos. No deberá realizar el merge ni cerrar manualmente la issue salvo autorización expresa. El roadmap se actualizará desde la rama principal para reducir conflictos entre agentes.

### 3.8. Pull Requests y finalización

Toda Pull Request deberá identificar la tarea correspondiente, explicar los cambios, indicar las validaciones ejecutadas y mantener un alcance limitado. Cuando corresponda, incluirá una referencia como `Closes #<numero>` y deberá tener la CI correcta antes de solicitar el merge.

Una tarea se considerará finalizada cuando cumpla los criterios de aceptación, pase las validaciones, sea revisada, se integre en la rama principal, cierre la issue y actualice el estado correspondiente del roadmap.

### 3.9. Excepciones sin GitHub Issue

Podrán utilizarse prompts directos con Agent Orchestrator para exploraciones técnicas, prototipos temporales, investigaciones o tareas pequeñas que todavía no justifiquen una issue.

Para las implementaciones normales se utilizará preferentemente GitHub Issues, porque ofrecen mejor trazabilidad, contexto y coordinación entre agentes.

### 3.10. Principio general

La metodología se resume en la siguiente regla:

```text
Markdown y spec/ para planificar.
GitHub Issues para definir y asignar.
Agent Orchestrator para ejecutar.
Pull Requests para revisar.
La rama principal para dar por terminado.
```

### 3.11. GitHub CLI como única integración

Todas las operaciones con GitHub deberán realizarse exclusivamente mediante el
GitHub CLI local (`gh`) ejecutado desde la terminal. Esta regla incluye la
consulta de repositorios, la creación y gestión de issues, ramas, Pull
Requests, comentarios, revisiones y checks.

No se utilizarán la aplicación GitHub integrada, conectores GitHub, MCP de
GitHub ni herramientas `codex_apps.github`.

Antes de cualquier operación con GitHub se comprobará la autenticación con:

```bash
gh auth status
```

### 3.12. Kanban del proyecto

El Kanban de trabajo es https://github.com/orgs/GenesisAI-team/projects/2. Las
transiciones son exactas: issue preparada = `Backlog`; worker AO iniciado =
`In progress`; PR abierta = `Review`; PR mergeada e issue cerrada = `Done`.
AO actualiza el Project directamente mediante `gh project item-edit`. La PR
vinculada no se añade como tarjeta separada. No deben hacerse commits
adicionales solo para mover el Kanban.

## 4. VALIDACIÓN OBLIGATORIA ANTES DE ABRIR/ACTUALIZAR PR

Ejecutar desde `mobile/` (salvo que la tarea indique otro directorio):

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Cada PR debe indicar: HU y RF cubiertos, criterios de aceptación verificados y comandos de validación ejecutados.

## 5. ESTRUCTURA DEL REPOSITORIO

==================================================

La raíz del proyecto debe mantener esta estructura general:

```text
/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── spec/
├── mobile/
├── .github/
├── .opencode/
└── otros archivos generales estrictamente necesarios
```

La carpeta `spec/` debe contener directamente los archivos Markdown generales y
la única subcarpeta permitida, `features/`. No se crearán otras subcarpetas.
Todos los archivos de `spec/` y `spec/features/` serán Markdown.

La estructura inicial será:

```text
spec/
├── 00-mission.md
├── 01-tech-stack.md
├── 02-roadmap.md
├── 03-business-rules.md
├── 04-data-and-integrations.md
├── 05-open-questions.md
├── 06-traceability.md
└── features/
    ├── HU-001-acceder-aplicacion.md
    ├── HU-002-consultar-asistente-ia.md
    ├── HU-003-navegar-modulos.md
    ├── HU-004-registrar-consultar-asistencia.md
    ├── HU-005-gestionar-listado-alumnos.md
    ├── HU-006-consultar-seguimiento-alumno.md
    ├── HU-007-registrar-entrega-tareas.md
    ├── HU-008-gestionar-anotaciones.md
    ├── HU-009-crear-anotacion.md
    ├── HU-010-consultar-correos.md
    ├── HU-011-redactar-enviar-correo.md
    ├── HU-012-enviar-comunicaciones-alcance.md
    └── HU-013-detectar-rachas-negativas.md
```

## 6. ESTÁNDARES TÉCNICOS, OPERATIVOS Y DE CALIDAD

### 6.1. Comandos

Los siguientes comandos quedarán definidos como contrato futuro del proyecto y
deberán implementarse como scripts reales en `package.json`:

```bash
pnpm install
pnpm dev
pnpm android
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm build:android:debug
pnpm build:android:release
pnpm validate
pnpm supabase:migration:new <nombre>
pnpm supabase:migration:up
```

Los comandos de release y migraciones se utilizarán únicamente cuando proceda.
No se considerarán disponibles hasta que estén configurados y verificados.

### 6.2. Convenciones

Se utilizará TypeScript estricto, `camelCase` para variables y funciones,
`PascalCase` para componentes y tipos, nombres explícitos y ausencia de `any`
salvo justificación escrita.

Las entradas externas deberán validarse. La UI, la lógica de aplicación y el
acceso a infraestructura estarán separados. Los tests se mantendrán próximos al
comportamiento probado.

Se gestionarán explícitamente los estados `loading`, `empty`, `error` y
`success`. Los errores serán controlados y comprensibles. Los componentes serán
pequeños, enfocados y organizados por features.

Se aplicarán DRY, KISS y YAGNI, evitando abstracciones prematuras. Se preferirá
la composición frente a la herencia y se utilizará inyección de dependencias en
integraciones que puedan sustituirse durante los tests.

### 6.3. No hacer

No se subirán archivos `.env`, credenciales ni secretos. No se implementarán
funcionalidades fuera del MVP ni se modificarán requisitos silenciosamente.

No se instalarán dependencias sin una razón documentada. No se utilizarán APIs
sin consultar previamente su documentación oficial mediante Context7. No se
omitirán pruebas para acelerar una Pull Request ni se marcará como READY una PR
con validaciones fallidas.

No se mezclarán tareas independientes en una misma PR ni se trabajará
directamente sobre la rama principal. No se desactivará RLS para resolver
errores ni se almacenarán datos docentes sensibles en logs.

No se creará una arquitectura innecesariamente compleja, no se desarrollará una
versión iOS en este MVP y no se mantendrán funcionalidades fuera del alcance
aprobado.

### 6.4. Git y Pull Requests

Cada tarea se desarrollará en un worktree y una rama independiente. Las ramas
deberán identificar la tarea correspondiente.

Los commits serán pequeños y descriptivos. Cada Pull Request tendrá un alcance
limitado, enlazará con su GitHub Issue e incluirá los cambios realizados, las
validaciones ejecutadas y los posibles riesgos.

No se hará merge sin revisión. La rama principal solo contendrá trabajo
revisado, validado e integrado.

### 6.5. Verificación

Cada cambio seguirá un ciclo de escribir, ejecutar tests, revisar resultados,
corregir problemas y volver a validar. La tarea no se considerará terminada
hasta que las validaciones sean correctas y la revisión se haya completado.

### 6.6. Memoria y contexto

El contexto persistente se guardará en `spec/`. Después de cada tarea se
actualizará el archivo de la HU correspondiente, el roadmap y los documentos
afectados.

Los resultados, decisiones y preguntas abiertas deberán resumirse en archivos
del proyecto. No se dependerá únicamente del historial del chat. Cuando sea
necesario, se compactará el contexto y se recuperará la información desde los
archivos antes de continuar una sesión.

### 6.7. MCP y herramientas

Se utilizará Supabase MCP para consultar o gestionar recursos de Supabase,
esquema, autenticación, RLS y migraciones cuando corresponda.

Se utilizará Context7 para consultar documentación oficial y actualizada de
librerías, frameworks, SDKs, APIs y herramientas antes de utilizarlos.

Para trabajar con Issues, Pull Requests, ramas, checks y revisiones se utilizará
exclusivamente el GitHub CLI local (`gh`).

Se utilizará n8n MCP únicamente mientras n8n siga
siendo la solución elegida o esté siendo evaluada para
`consultar-asistente-ia`.

## 7. STACK TÉCNICO

==================================================

### 7.1. Requisitos obligatorios

- Aplicación móvil exclusivamente Android.
- React Native.
- TypeScript estricto.
- Expo.
- Desarrollo y ejecución mediante Android Studio.
- Supabase como backend principal.
- Supabase Auth.
- Google Auth obligatorio.
- Persistencia de datos en Supabase.
- GitHub como repositorio y plataforma de Pull Requests.
- `n8n` como opción actualmente especificada para el chat inteligente.
- La integración de `n8n` deberá mantenerse desacoplada para poder sustituirse
  por un SDK de agentes cuando exista una decisión técnica documentada.

No se añadirá soporte para iOS. Si la herramienta de inicialización genera una
carpeta `ios/`, deberá eliminarse, excluirse del alcance y dejarse documentada
la decisión.

### 7.2. Arquitectura recomendada

```text
mobile/
├── android/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── navigation/
│   ├── services/
│   ├── infrastructure/
│   ├── shared/
│   ├── config/
│   └── test/
├── package.json
├── tsconfig.json
└── archivos de configuración
```

Dentro de `src/features/`, el código se organizará por capacidad funcional:

- `auth`
- `assistant`
- `attendance`
- `students`
- `tasks`
- `annotations`
- `mail`
- `alerts`

No se crearán capas vacías ni clases sin comportamiento. Las interfaces solo se
utilizarán cuando aporten sustitución, testabilidad o separación respecto a una
integración externa.

`n8n` seguirá siendo una opción provisional para `consultar-asistente-ia`; no
se considerará una decisión tecnológica definitiva hasta que quede documentada.

## 8. CALIDAD DEL CÓDIGO

==================================================

Se aplicarán los siguientes principios:

- DRY.
- KISS.
- YAGNI.
- Responsabilidad única.
- Bajo acoplamiento.
- Alta cohesión.
- Composición sobre herencia.
- Dependencia de abstracciones en integraciones.
- Interfaces pequeñas.
- Funciones puras cuando simplifiquen la lógica.
- Tipos explícitos.
- Estados imposibles difíciles de representar.
- Validación en los límites del sistema.
- Repositorios sustituibles por implementaciones en memoria durante los tests.

No se aplicarán patrones por obligación ni se convertirá el MVP en una
arquitectura empresarial innecesaria.

No se crearán:

- God objects.
- Servicios globales con múltiples responsabilidades.
- Componentes de pantalla con toda la lógica.
- Acceso directo a Supabase desde cualquier componente.
- Condicionales de proveedor repartidos por la UI.
- Duplicación de reglas de negocio.
- Cadenas de herencia.
- Abstracciones sin uso real.
- Tipos `any` generalizados.

## 9. EXPERIENCIA ANDROID

==================================================

La aplicación debe estar optimizada para Android. Como mínimo:

- Navegación consistente.
- Estados de carga.
- Estados vacíos.
- Estados de error.
- Teclado gestionado correctamente.
- Scroll correcto.
- Áreas táctiles suficientes.
- Botón atrás de Android coherente.
- Formularios validados.
- Mensajes comprensibles.
- Sin scroll horizontal global accidental.
- Diseño usable en tamaños Android representativos.
- Listas eficientes.
- Identificadores accesibles para testing.

## 10. PRIMERA EJECUCIÓN OBLIGATORIA

==================================================

Empieza inmediatamente con una única tarea de bootstrap:

### BOOTSTRAP-001 — Inicializar proyecto, SDD y arnés de agentes

No pidas confirmación antes de iniciarla.

Debe realizar:

1. Inspeccionar el repositorio.
2. Localizar y analizar los documentos fuente completos.
3. Inicializar Git cuando sea necesario.
4. Crear la estructura raíz.
5. Crear `AGENTS.md`.
6. Crear todos los archivos iniciales de `spec/` y las historias dentro de `spec/features/`.
7. Extraer HU-001 a HU-013 sin perder sus criterios.
8. Extraer requisitos, reglas, integraciones y preguntas abiertas.
9. Crear el roadmap inicial.
10. Crear la matriz de trazabilidad inicial.
11. Descomponer cada HU en tareas preliminares.
12. Inicializar la aplicación React Native Android en `mobile/`.
13. Configurar TypeScript estricto.
14. Configurar PNPM.
15. Configurar lint y formato.
16. Configurar tests.
17. Configurar React Navigation.
18. Crear la configuración base de Supabase sin secretos.
19. Crear interfaces iniciales para repositorios e integraciones.
20. Crear `.env.example`.
21. Crear scripts de validación.
22. Configurar CI en GitHub.
23. Comprobar el build Android inicial.
24. Crear un README breve y reproducible.
25. Crear worktree, rama y PR de bootstrap.
26. Ejecutar reviewer automático.
27. Corregir problemas.
28. Dejar el PR en READY.

Rama:

`chore/BOOTSTRAP-001-project-foundation`

## 11. SUPABASE

==================================================

Usa Supabase MCP siempre que esté disponible para:

- Inspeccionar el proyecto.
- Diseñar el esquema.
- Crear migraciones.
- Crear tablas.
- Crear índices necesarios.
- Configurar RLS.
- Crear políticas.
- Revisar relaciones.
- Validar consultas.
- Generar datos de prueba.
- Inspeccionar errores de backend.

Todo cambio de base de datos debe existir como migración versionada.

Nunca realices cambios manuales no reproducibles.

Como mínimo, analiza entidades relacionadas con:

- `teachers`
- `classes`
- `students`
- `student_contacts`
- `attendance_records`
- `assignments`
- `assignment_submissions`
- `annotations`
- `messages`
- `message_recipients`
- `conversations`
- `conversation_messages`
- `alerts`

No crees todas las tablas automáticamente sin contrastarlas con los requisitos.

Implementa únicamente aquellas necesarias para las HU seleccionadas y para la
integridad mínima del modelo.

Aplica estas salvaguardas técnicas provisionales:

- RLS activado.
- Acceso autenticado.
- Denegación por defecto.
- Mínimo privilegio.
- Ningún secreto dentro de la aplicación.
- Claves privadas solo en backend o variables seguras.
- Logs sin datos docentes sensibles.

Cuando el modelo de propiedad de los datos no esté definido, regístralo como
pregunta abierta y utiliza datos demo o políticas restrictivas.

## 12. ASISTENTE INTELIGENTE

==================================================

La UI no debe depender directamente de n8n ni de un SDK concreto.

Define un contrato similar a `AssistantGateway`.

Responsabilidades:

- Enviar mensaje.
- Recibir respuesta.
- Mantener identificador de conversación.
- Gestionar errores.
- Gestionar timeouts.
- Permitir sustitución por fake durante tests.

Implementaciones posibles:

- `N8nAssistantGateway`
- `OpenAIAssistantGateway`
- `FakeAssistantGateway`

La especificación existente establece n8n como integración principal.

Antes de sustituirla crea un RFC que compare:

- Cumplimiento de requisitos.
- Complejidad.
- Coste.
- Seguridad.
- Observabilidad.
- Mantenimiento.
- Dependencia del proveedor.
- Facilidad de pruebas.
- Compatibilidad con Supabase y RAG.

No sustituyas n8n silenciosamente.

Usa el MCP de n8n para:

- Inspeccionar workflows.
- Crear o modificar el autorizado.
- Verificar webhook.
- Revisar ejecuciones.
- Validar entradas y salidas.
- Detectar errores.
- Documentar la versión del flujo.

Si no te llega ningún dato, implementa el contrato, el fake, la configuración y
las pruebas, pero registra la validación real como bloqueo externo.

## 13. CONTEXT7

==================================================

Usa Context7 antes de incorporar o modificar código dependiente de:

- React Native.
- React Navigation.
- Supabase JS.
- Google Sign-In.
- Librerías de testing.
- Cualquier SDK de agentes.
- Librerías de almacenamiento seguro.
- Cualquier dependencia cuya API pueda variar por versión.

Consulta la documentación de la versión exacta.

No inventes APIs.

Registra en el plan técnico:

- Biblioteca consultada.
- Versión.
- Decisión tomada.
- Enlace o referencia documental cuando sea posible.

## 14. ERRORES OPERATIVOS

Antes de diagnosticar problemas de Context7 o de la JVM de Gradle, leer
`ERRORES_COMUNES.md`. Context7 se consulta obligatoriamente mediante las
herramientas MCP `resolve_library_id` y `query_docs` del runtime del agente;
no se intentan ejecutar como comandos de PowerShell. `ALL_TOOLS` tampoco es un
comando ni una variable de PowerShell: solo puede existir como metadata del
runtime de herramientas del agente.

Para errores de Gradle se debe registrar la salida de `java -version`,
`where.exe java` y `mobile/android/gradlew.bat --version`, revisar
`org.gradle.java.home` y el Gradle JDK de Android Studio, y repetir la prueba
después de `mobile/android/gradlew.bat --stop`. Se permite usar temporalmente
`JAVA_HOME` con JDK 17 en la sesión actual. Nunca se versionan rutas locales,
credenciales ni configuraciones de usuario. Si Context7 no está disponible,
solo se acepta como fallback la documentación oficial y debe quedar registrado.
