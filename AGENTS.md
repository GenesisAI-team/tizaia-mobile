# AGENTS.md â€” tizaia-mobile (Mobile Teacher App)

## 1. MISIÃ“N DEL PROYECTO

==================================================

Construir un primer prototipo funcional y entregable de una aplicaciÃ³n mÃ³vil de
apoyo al profesorado.

La aplicaciÃ³n permitirÃ¡, segÃºn la especificaciÃ³n proporcionada:

- AutenticaciÃ³n del profesorado.
- Acceso mediante Google Auth.
- Consulta de un asistente inteligente.
- NavegaciÃ³n entre Home, Asistencia, Alumnos, Tareas, Mails y Anotaciones.
- Registro y consulta de asistencia.
- Seguimiento de entrega de tareas.
- Consulta y gestiÃ³n de alumnos.
- Consulta y creaciÃ³n de anotaciones.
- Consulta y envÃ­o de comunicaciones.
- Comunicaciones individuales, a familias y a grupos.
- Seguimiento de rachas negativas.

El producto es un MVP Android. No se debe ampliar el alcance con funcionalidades
no solicitadas.

- AplicaciÃ³n mÃ³vil **Android** de apoyo al profesorado. Primer MVP.
- El stack tÃ©cnico completo se define en el punto `7. STACK TÃ‰CNICO`.
- MetodologÃ­a **SDD** (Spec-Driven Development): la fuente de verdad es el documento de especificaciÃ³n (`Especificacion_requisitos_por_historias_de_usuario.docx-1.pdf`) y su extracciÃ³n en `spec/`.
- Toda tarea debe ser trazable a HU-001..HU-013 y a sus RF asociados. No se inventan umbrales, permisos ni pantallas: lo no especificado queda como pregunta abierta (Q-xxx).

## 2. FUENTES DE VERDAD

==================================================

Antes de realizar cualquier cambio, se deberÃ¡n localizar y analizar completamente
estos documentos:

1. `Especificacion_requisitos_por_historias_de_usuario.docx-1.pdf`

La informaciÃ³n del proyecto se interpretarÃ¡ teniendo en cuenta, en este orden:

1. Instrucciones explÃ­citas de este prompt.
2. Requisitos normativos del documento de especificaciÃ³n.
3. Historias de usuario y criterios de aceptaciÃ³n.
4. Reglas de negocio, requisitos de datos e integraciones.
5. Decisiones tÃ©cnicas documentadas por el proyecto.
6. CÃ³digo existente.

Los bocetos sirven como referencia visual, pero no sustituyen los criterios de
aceptaciÃ³n ni los requisitos normativos.

No se deben inventar requisitos de negocio.

Cuando falte informaciÃ³n:

- Se registrarÃ¡ como pregunta abierta.
- Se identificarÃ¡n los IDs afectados.
- Se diferenciarÃ¡ entre un bloqueo real y una decisiÃ³n reversible.
- Se continuarÃ¡ con aquello que pueda implementarse de manera segura.
- No se marcarÃ¡ como validada una decisiÃ³n que siga pendiente.

No se modificarÃ¡ silenciosamente ninguna historia de usuario, requisito, regla de
negocio o criterio de aceptaciÃ³n.

## 3. MetodologÃ­a HÃ­brida de Desarrollo: SDD + GitHub Issues + Agent Orchestrator

Este proyecto seguirÃ¡ una metodologÃ­a **Spec-Driven Development (SDD)** combinada con GitHub Issues y Agent Orchestrator. La planificaciÃ³n, los requisitos y los criterios de aceptaciÃ³n estarÃ¡n documentados y versionados, mientras que las tareas concretas se ejecutarÃ¡n en entornos aislados y se integrarÃ¡n mediante Pull Requests.

### 3.1. Fuentes de verdad

La especificaciÃ³n funcional y sus archivos derivados en `spec/` serÃ¡n la fuente principal de verdad del proyecto. El `roadmap.md` recogerÃ¡ la visiÃ³n general, las prioridades y las dependencias. Las GitHub Issues describirÃ¡n el trabajo concreto que debe realizarse, enlazando siempre con la documentaciÃ³n correspondiente sin sustituirla.

Agent Orchestrator gestionarÃ¡ las sesiones de trabajo, los worktrees y las ramas aisladas. Las Pull Requests contendrÃ¡n los cambios implementados y su validaciÃ³n. La rama principal representarÃ¡ Ãºnicamente el trabajo revisado e integrado.

### 3.2. IdentificaciÃ³n de tareas

Cada tarea tendrÃ¡ un identificador estable y Ãºnico, por ejemplo `MOB-001`, `AUTH-001` o `PAYMENTS-003`.

El identificador deberÃ¡ utilizarse en el roadmap, en la GitHub Issue, en la Pull Request y en las comunicaciones relacionadas. Esto permitirÃ¡ mantener la trazabilidad entre requisitos, implementaciÃ³n, revisiÃ³n y cierre.

### 3.3. Ciclo de vida de una tarea

Las tareas podrÃ¡n encontrarse en los estados `backlog`, `ready`, `in_progress`, `review`, `blocked` o `done`.

`backlog` indica que la tarea todavÃ­a necesita definiciÃ³n. `ready` significa que puede asignarse. `in_progress` indica que existe un agente trabajando en ella. `review` corresponde a una Pull Request pendiente de revisiÃ³n. `blocked` se utilizarÃ¡ cuando exista una dependencia o decisiÃ³n pendiente. `done` solo se alcanzarÃ¡ cuando la Pull Request haya sido revisada, integrada, validada y la issue haya sido cerrada.

No se utilizarÃ¡ `implemented` como estado final, porque la existencia de cÃ³digo en una rama no implica que la tarea estÃ© terminada.

### 3.4. CreaciÃ³n de GitHub Issues

Una tarea se convertirÃ¡ en GitHub Issue cuando tenga un objetivo claro, un alcance limitado, criterios de aceptaciÃ³n verificables, dependencias conocidas y procedimientos de validaciÃ³n definidos. TambiÃ©n deberÃ¡ poder ejecutarse dentro del alcance de una Ãºnica Pull Request.

Las ideas incompletas permanecerÃ¡n inicialmente en `roadmap.md` o en la especificaciÃ³n. La issue se crearÃ¡ cuando la tarea alcance el estado `ready`, utilizando GitHub o `gh` CLI cuando sea necesario.

### 3.5. Estructura de una tarea

Cada tarea deberÃ¡ incluir como mÃ­nimo su referencia a la especificaciÃ³n, el contexto, el alcance, aquello que queda fuera de alcance, los criterios de aceptaciÃ³n, la forma de validaciÃ³n y sus dependencias.

La descripciÃ³n debe ser suficientemente clara para que otro agente pueda ejecutarla sin tener que inventar decisiones funcionales ni consultar informaciÃ³n que deberÃ­a estar documentada.

### 3.6. EjecuciÃ³n con Agent Orchestrator

Agent Orchestrator se utilizarÃ¡ para coordinar las sesiones de trabajo. El flujo habitual serÃ¡:

```bash
ao status --json
ao project ls --json
ao spawn --project <id-del-proyecto> --issue <numero-de-issue> --name "<nombre-corto>" --harness opencode --prompt "<tarea>"
```

Para varias tareas independientes se repetirÃ¡ `ao spawn` con una sesiÃ³n por issue:

```bash
ao spawn --project <id-del-proyecto> --issue 23 --name "tarea-23" --harness opencode
ao spawn --project <id-del-proyecto> --issue 24 --name "tarea-24" --harness opencode
```

Cada agente trabajarÃƒÂ¡ en su propio worktree y rama. El estado del daemon podrÃƒÂ¡ consultarse mediante `ao status --json` y las sesiones mediante `ao session ls --json`. Agent Orchestrator facilitarÃƒÂ¡ el seguimiento de ramas, Pull Requests, CI, revisiones y conflictos, pero no sustituirÃƒÂ¡ la revisiÃƒÂ³n humana.

### 3.7. Reglas para los agentes

Antes de modificar cÃ³digo, cada agente deberÃ¡ leer `AGENTS.md`, la issue asignada y las especificaciones relacionadas. DeberÃ¡ respetar el alcance de la tarea, evitar refactorizaciones no solicitadas y no asumir decisiones que no estÃ©n documentadas.

El agente deberÃ¡ ejecutar las validaciones indicadas, informar de cualquier bloqueo, crear una Pull Request asociada a la tarea e incluir en ella los cambios realizados, las validaciones y los posibles riesgos. No deberÃ¡ realizar el merge ni cerrar manualmente la issue salvo autorizaciÃ³n expresa. El roadmap se actualizarÃ¡ desde la rama principal para reducir conflictos entre agentes.

### 3.8. Pull Requests y finalizaciÃ³n

Toda Pull Request deberÃ¡ identificar la tarea correspondiente, explicar los cambios, indicar las validaciones ejecutadas y mantener un alcance limitado. Cuando corresponda, incluirÃ¡ una referencia como `Closes #<numero>` y deberÃ¡ tener la CI correcta antes de solicitar el merge.

Una tarea se considerarÃ¡ finalizada cuando cumpla los criterios de aceptaciÃ³n, pase las validaciones, sea revisada, se integre en la rama principal, cierre la issue y actualice el estado correspondiente del roadmap.

### 3.9. Excepciones sin GitHub Issue

PodrÃ¡n utilizarse prompts directos con Agent Orchestrator para exploraciones tÃ©cnicas, prototipos temporales, investigaciones o tareas pequeÃ±as que todavÃ­a no justifiquen una issue.

Para las implementaciones normales se utilizarÃ¡ preferentemente GitHub Issues, porque ofrecen mejor trazabilidad, contexto y coordinaciÃ³n entre agentes.

### 3.10. Principio general

La metodologÃ­a se resume en la siguiente regla:

```text
Markdown y spec/ para planificar.
GitHub Issues para definir y asignar.
Agent Orchestrator para ejecutar.
Pull Requests para revisar.
La rama principal para dar por terminado.
```

### 3.11. GitHub CLI como Ãºnica integraciÃ³n

Todas las operaciones con GitHub deberÃ¡n realizarse exclusivamente mediante el
GitHub CLI local (`gh`) ejecutado desde la terminal. Esta regla incluye la
consulta de repositorios, la creaciÃ³n y gestiÃ³n de issues, ramas, Pull
Requests, comentarios, revisiones y checks.

No se utilizarÃ¡n la aplicaciÃ³n GitHub integrada, conectores GitHub, MCP de
GitHub ni herramientas `codex_apps.github`.

Antes de cualquier operaciÃ³n con GitHub se comprobarÃ¡ la autenticaciÃ³n con:

```bash
gh auth status
```

## 4. VALIDACIÃ“N OBLIGATORIA ANTES DE ABRIR/ACTUALIZAR PR

Ejecutar desde `mobile/` (salvo que la tarea indique otro directorio):

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Cada PR debe indicar: HU y RF cubiertos, criterios de aceptaciÃ³n verificados y comandos de validaciÃ³n ejecutados.

## 5. ESTRUCTURA DEL REPOSITORIO

==================================================

La raÃ­z del proyecto debe mantener esta estructura general:

```text
/
â”œâ”€â”€ AGENTS.md
â”œâ”€â”€ README.md
â”œâ”€â”€ .gitignore
â”œâ”€â”€ .env.example
â”œâ”€â”€ spec/
â”œâ”€â”€ mobile/
â”œâ”€â”€ .github/
â”œâ”€â”€ .opencode/
â””â”€â”€ otros archivos generales estrictamente necesarios
```

La carpeta `spec/` debe contener directamente los archivos Markdown generales y
la Ãºnica subcarpeta permitida, `features/`. No se crearÃ¡n otras subcarpetas.
Todos los archivos de `spec/` y `spec/features/` serÃ¡n Markdown.

La estructura inicial serÃ¡:

```text
spec/
â”œâ”€â”€ 00-mission.md
â”œâ”€â”€ 01-tech-stack.md
â”œâ”€â”€ 02-roadmap.md
â”œâ”€â”€ 03-business-rules.md
â”œâ”€â”€ 04-data-and-integrations.md
â”œâ”€â”€ 05-open-questions.md
â”œâ”€â”€ 06-traceability.md
â””â”€â”€ features/
    â”œâ”€â”€ HU-001-acceder-aplicacion.md
    â”œâ”€â”€ HU-002-consultar-asistente-ia.md
    â”œâ”€â”€ HU-003-navegar-modulos.md
    â”œâ”€â”€ HU-004-registrar-consultar-asistencia.md
    â”œâ”€â”€ HU-005-gestionar-listado-alumnos.md
    â”œâ”€â”€ HU-006-consultar-seguimiento-alumno.md
    â”œâ”€â”€ HU-007-registrar-entrega-tareas.md
    â”œâ”€â”€ HU-008-gestionar-anotaciones.md
    â”œâ”€â”€ HU-009-crear-anotacion.md
    â”œâ”€â”€ HU-010-consultar-correos.md
    â”œâ”€â”€ HU-011-redactar-enviar-correo.md
    â”œâ”€â”€ HU-012-enviar-comunicaciones-alcance.md
    â””â”€â”€ HU-013-detectar-rachas-negativas.md
```

## 6. ESTÃNDARES TÃ‰CNICOS, OPERATIVOS Y DE CALIDAD

### 6.1. Comandos

Los siguientes comandos quedarÃ¡n definidos como contrato futuro del proyecto y
deberÃ¡n implementarse como scripts reales en `package.json`:

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

Los comandos de release y migraciones se utilizarÃ¡n Ãºnicamente cuando proceda.
No se considerarÃ¡n disponibles hasta que estÃ©n configurados y verificados.

### 6.2. Convenciones

Se utilizarÃ¡ TypeScript estricto, `camelCase` para variables y funciones,
`PascalCase` para componentes y tipos, nombres explÃ­citos y ausencia de `any`
salvo justificaciÃ³n escrita.

Las entradas externas deberÃ¡n validarse. La UI, la lÃ³gica de aplicaciÃ³n y el
acceso a infraestructura estarÃ¡n separados. Los tests se mantendrÃ¡n prÃ³ximos al
comportamiento probado.

Se gestionarÃ¡n explÃ­citamente los estados `loading`, `empty`, `error` y
`success`. Los errores serÃ¡n controlados y comprensibles. Los componentes serÃ¡n
pequeÃ±os, enfocados y organizados por features.

Se aplicarÃ¡n DRY, KISS y YAGNI, evitando abstracciones prematuras. Se preferirÃ¡
la composiciÃ³n frente a la herencia y se utilizarÃ¡ inyecciÃ³n de dependencias en
integraciones que puedan sustituirse durante los tests.

### 6.3. No hacer

No se subirÃ¡n archivos `.env`, credenciales ni secretos. No se implementarÃ¡n
funcionalidades fuera del MVP ni se modificarÃ¡n requisitos silenciosamente.

No se instalarÃ¡n dependencias sin una razÃ³n documentada. No se utilizarÃ¡n APIs
sin consultar previamente su documentaciÃ³n oficial mediante Context7. No se
omitirÃ¡n pruebas para acelerar una Pull Request ni se marcarÃ¡ como READY una PR
con validaciones fallidas.

No se mezclarÃ¡n tareas independientes en una misma PR ni se trabajarÃ¡
directamente sobre la rama principal. No se desactivarÃ¡ RLS para resolver
errores ni se almacenarÃ¡n datos docentes sensibles en logs.

No se crearÃ¡ una arquitectura innecesariamente compleja, no se desarrollarÃ¡ una
versiÃ³n iOS en este MVP y no se mantendrÃ¡n funcionalidades fuera del alcance
aprobado.

### 6.4. Git y Pull Requests

Cada tarea se desarrollarÃ¡ en un worktree y una rama independiente. Las ramas
deberÃ¡n identificar la tarea correspondiente.

Los commits serÃ¡n pequeÃ±os y descriptivos. Cada Pull Request tendrÃ¡ un alcance
limitado, enlazarÃ¡ con su GitHub Issue e incluirÃ¡ los cambios realizados, las
validaciones ejecutadas y los posibles riesgos.

No se harÃ¡ merge sin revisiÃ³n. La rama principal solo contendrÃ¡ trabajo
revisado, validado e integrado.

### 6.5. VerificaciÃ³n

Cada cambio seguirÃ¡ un ciclo de escribir, ejecutar tests, revisar resultados,
corregir problemas y volver a validar. La tarea no se considerarÃ¡ terminada
hasta que las validaciones sean correctas y la revisiÃ³n se haya completado.

### 6.6. Memoria y contexto

El contexto persistente se guardarÃ¡ en `spec/`. DespuÃ©s de cada tarea se
actualizarÃ¡ el archivo de la HU correspondiente, el roadmap y los documentos
afectados.

Los resultados, decisiones y preguntas abiertas deberÃ¡n resumirse en archivos
del proyecto. No se dependerÃ¡ Ãºnicamente del historial del chat. Cuando sea
necesario, se compactarÃ¡ el contexto y se recuperarÃ¡ la informaciÃ³n desde los
archivos antes de continuar una sesiÃ³n.

### 6.7. MCP y herramientas

Se utilizarÃ¡ Supabase MCP para consultar o gestionar recursos de Supabase,
esquema, autenticaciÃ³n, RLS y migraciones cuando corresponda.

Se utilizarÃ¡ Context7 para consultar documentaciÃ³n oficial y actualizada de
librerÃ­as, frameworks, SDKs, APIs y herramientas antes de utilizarlos.

Para trabajar con Issues, Pull Requests, ramas, checks y revisiones se utilizarÃ¡
exclusivamente el GitHub CLI local (`gh`).

Se utilizarÃ¡ n8n MCP Ãºnicamente mientras n8n siga
siendo la soluciÃ³n elegida o estÃ© siendo evaluada para
`consultar-asistente-ia`.

## 7. STACK TÃ‰CNICO

==================================================

### 7.1. Requisitos obligatorios

- AplicaciÃ³n mÃ³vil exclusivamente Android.
- React Native.
- TypeScript estricto.
- Expo.
- Desarrollo y ejecuciÃ³n mediante Android Studio.
- Supabase como backend principal.
- Supabase Auth.
- Google Auth obligatorio.
- Persistencia de datos en Supabase.
- GitHub como repositorio y plataforma de Pull Requests.
- `n8n` como opciÃ³n actualmente especificada para el chat inteligente.
- La integraciÃ³n de `n8n` deberÃ¡ mantenerse desacoplada para poder sustituirse
  por un SDK de agentes cuando exista una decisiÃ³n tÃ©cnica documentada.

No se aÃ±adirÃ¡ soporte para iOS. Si la herramienta de inicializaciÃ³n genera una
carpeta `ios/`, deberÃ¡ eliminarse, excluirse del alcance y dejarse documentada
la decisiÃ³n.

### 7.2. Arquitectura recomendada

```text
mobile/
â”œâ”€â”€ android/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ features/
â”‚   â”œâ”€â”€ navigation/
â”‚   â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ infrastructure/
â”‚   â”œâ”€â”€ shared/
â”‚   â”œâ”€â”€ config/
â”‚   â””â”€â”€ test/
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â””â”€â”€ archivos de configuraciÃ³n
```

Dentro de `src/features/`, el cÃ³digo se organizarÃ¡ por capacidad funcional:

- `auth`
- `assistant`
- `attendance`
- `students`
- `tasks`
- `annotations`
- `mail`
- `alerts`

No se crearÃ¡n capas vacÃ­as ni clases sin comportamiento. Las interfaces solo se
utilizarÃ¡n cuando aporten sustituciÃ³n, testabilidad o separaciÃ³n respecto a una
integraciÃ³n externa.

`n8n` seguirÃ¡ siendo una opciÃ³n provisional para `consultar-asistente-ia`; no
se considerarÃ¡ una decisiÃ³n tecnolÃ³gica definitiva hasta que quede documentada.

## 8. CALIDAD DEL CÃ“DIGO

==================================================

Se aplicarÃ¡n los siguientes principios:

- DRY.
- KISS.
- YAGNI.
- Responsabilidad Ãºnica.
- Bajo acoplamiento.
- Alta cohesiÃ³n.
- ComposiciÃ³n sobre herencia.
- Dependencia de abstracciones en integraciones.
- Interfaces pequeÃ±as.
- Funciones puras cuando simplifiquen la lÃ³gica.
- Tipos explÃ­citos.
- Estados imposibles difÃ­ciles de representar.
- ValidaciÃ³n en los lÃ­mites del sistema.
- Repositorios sustituibles por implementaciones en memoria durante los tests.

No se aplicarÃ¡n patrones por obligaciÃ³n ni se convertirÃ¡ el MVP en una
arquitectura empresarial innecesaria.

No se crearÃ¡n:

- God objects.
- Servicios globales con mÃºltiples responsabilidades.
- Componentes de pantalla con toda la lÃ³gica.
- Acceso directo a Supabase desde cualquier componente.
- Condicionales de proveedor repartidos por la UI.
- DuplicaciÃ³n de reglas de negocio.
- Cadenas de herencia.
- Abstracciones sin uso real.
- Tipos `any` generalizados.

## 9. EXPERIENCIA ANDROID

==================================================

La aplicaciÃ³n debe estar optimizada para Android. Como mÃ­nimo:

- NavegaciÃ³n consistente.
- Estados de carga.
- Estados vacÃ­os.
- Estados de error.
- Teclado gestionado correctamente.
- Scroll correcto.
- Ãreas tÃ¡ctiles suficientes.
- BotÃ³n atrÃ¡s de Android coherente.
- Formularios validados.
- Mensajes comprensibles.
- Sin scroll horizontal global accidental.
- DiseÃ±o usable en tamaÃ±os Android representativos.
- Listas eficientes.
- Identificadores accesibles para testing.

## 10. PRIMERA EJECUCIÃ“N OBLIGATORIA

==================================================

Empieza inmediatamente con una Ãºnica tarea de bootstrap:

### BOOTSTRAP-001 â€” Inicializar proyecto, SDD y arnÃ©s de agentes

No pidas confirmaciÃ³n antes de iniciarla.

Debe realizar:

1. Inspeccionar el repositorio.
2. Localizar y analizar los documentos fuente completos.
3. Inicializar Git cuando sea necesario.
4. Crear la estructura raÃ­z.
5. Crear `AGENTS.md`.
6. Crear todos los archivos iniciales de `spec/` y las historias dentro de `spec/features/`.
7. Extraer HU-001 a HU-013 sin perder sus criterios.
8. Extraer requisitos, reglas, integraciones y preguntas abiertas.
9. Crear el roadmap inicial.
10. Crear la matriz de trazabilidad inicial.
11. Descomponer cada HU en tareas preliminares.
12. Inicializar la aplicaciÃ³n React Native Android en `mobile/`.
13. Configurar TypeScript estricto.
14. Configurar PNPM.
15. Configurar lint y formato.
16. Configurar tests.
17. Configurar React Navigation.
18. Crear la configuraciÃ³n base de Supabase sin secretos.
19. Crear interfaces iniciales para repositorios e integraciones.
20. Crear `.env.example`.
21. Crear scripts de validaciÃ³n.
22. Configurar CI en GitHub.
23. Comprobar el build Android inicial.
24. Crear un README breve y reproducible.
25. Crear worktree, rama y PR de bootstrap.
26. Ejecutar reviewer automÃ¡tico.
27. Corregir problemas.
28. Dejar el PR en READY.

Rama:

`chore/BOOTSTRAP-001-project-foundation`

## 11. SUPABASE

==================================================

Usa Supabase MCP siempre que estÃ© disponible para:

- Inspeccionar el proyecto.
- DiseÃ±ar el esquema.
- Crear migraciones.
- Crear tablas.
- Crear Ã­ndices necesarios.
- Configurar RLS.
- Crear polÃ­ticas.
- Revisar relaciones.
- Validar consultas.
- Generar datos de prueba.
- Inspeccionar errores de backend.

Todo cambio de base de datos debe existir como migraciÃ³n versionada.

Nunca realices cambios manuales no reproducibles.

Como mÃ­nimo, analiza entidades relacionadas con:

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

No crees todas las tablas automÃ¡ticamente sin contrastarlas con los requisitos.

Implementa Ãºnicamente aquellas necesarias para las HU seleccionadas y para la
integridad mÃ­nima del modelo.

Aplica estas salvaguardas tÃ©cnicas provisionales:

- RLS activado.
- Acceso autenticado.
- DenegaciÃ³n por defecto.
- MÃ­nimo privilegio.
- NingÃºn secreto dentro de la aplicaciÃ³n.
- Claves privadas solo en backend o variables seguras.
- Logs sin datos docentes sensibles.

Cuando el modelo de propiedad de los datos no estÃ© definido, regÃ­stralo como
pregunta abierta y utiliza datos demo o polÃ­ticas restrictivas.

## 12. ASISTENTE INTELIGENTE

==================================================

La UI no debe depender directamente de n8n ni de un SDK concreto.

Define un contrato similar a `AssistantGateway`.

Responsabilidades:

- Enviar mensaje.
- Recibir respuesta.
- Mantener identificador de conversaciÃ³n.
- Gestionar errores.
- Gestionar timeouts.
- Permitir sustituciÃ³n por fake durante tests.

Implementaciones posibles:

- `N8nAssistantGateway`
- `OpenAIAssistantGateway`
- `FakeAssistantGateway`

La especificaciÃ³n existente establece n8n como integraciÃ³n principal.

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
- Documentar la versiÃ³n del flujo.

Si no te llega ningÃºn dato, implementa el contrato, el fake, la configuraciÃ³n y
las pruebas, pero registra la validaciÃ³n real como bloqueo externo.

## 13. CONTEXT7

==================================================

Usa Context7 antes de incorporar o modificar cÃ³digo dependiente de:

- React Native.
- React Navigation.
- Supabase JS.
- Google Sign-In.
- LibrerÃ­as de testing.
- Cualquier SDK de agentes.
- LibrerÃ­as de almacenamiento seguro.
- Cualquier dependencia cuya API pueda variar por versiÃ³n.

Consulta la documentaciÃ³n de la versiÃ³n exacta.

No inventes APIs.

Registra en el plan tÃ©cnico:

- Biblioteca consultada.
- VersiÃ³n.
- DecisiÃ³n tomada.
- Enlace o referencia documental cuando sea posible.
