# DESIGN.md — Especificación visual definitiva de Tizaia

**Fuente de verdad:** `design/Tizaia.op` (versión 0.8.4). Este documento es la representación fiel y completa de las 12 pantallas definitivas y debe considerarse el contrato visual para la implementación en React Native y para la orquestación de agentes.

---

## 1. Alcance y fuentes de verdad

| Fuente | Rol |
|---|---|
| `design/Tizaia.op` | **Autoridad definitiva.** Todo valor de este documento proviene de él. |
| `design/Tizaia-Tokens/` | Referencia de origen (exportación Figma). Algunos valores difieren del `.op`; ante conflicto manda el `.op`. |
| `design/tizaia_design_system/DESIGN.md` | Histórico inicial. No normativo. No se actualiza. |
| PNG en `design/pantalla_*/` | Prototipo histórico. No normativo. |

**Pantallas documentadas (12):** Home, Asistencia, Alumnos, Tareas, Mails, Anotaciones, Clases, Login, Menu Hamburguesa, Nueva Anotación, Nuevo Mail, Perfil Alumno.

**Excluido:** la página `Components` del `.op` es material interno del equipo de diseño. No se documenta ni se implementa.

---

## 2. Lienzo y reglas globales

- **Canvas:** `768 × 1376` px en las 12 pantallas.
- **Fondo de pantalla:** degradado vertical (`angle: 90°`) con 3 paradas:
  - `0.0` → `#FBC7A5`
  - `0.5` → `#FCE0C3`
  - `1.0` → `#FFF8EC`
- En Login, Menu Hamburguesa, Nueva Anotación, Nuevo Mail y Perfil Alumno el frame raíz tiene `clipContent: true` (recorta decoraciones que sobresalen).
- **Posiciones:** todas las coordenadas de este documento están en px del canvas, relativas al frame contenedor (la posición de primer nivel es absoluta respecto a la pantalla).
- **Tema:** solo `Mode: Light`. No existe variante oscura.
- **Mock de status bar:** el `.op` incluye en varias pantallas una barra de estado simulada (`iOSStatusBar` o textos `Time`/`Status`). Es un artefacto del diseño: en la implementación Android se sustituye por la status bar real del sistema y **no** se implementa como componente.
- **Mock de home indicator:** en Alumnos hay un texto `HomeIndicator` ("━"). Mismo tratamiento: artefacto visual, no componente.

### Anatomía común de pantalla autenticada

```
┌────────────────────────────────────┐
│ [Status bar mock]  (ver nota)      │
│ LOGO                ☰ (MenuIcon)   │  ← Header común (y≈90)
│            TITULO                  │  ← ScreenTitle centrado + subrayado
│         (contenido propio)         │
│                    (FAB opcional)  │  ← 613,1115
│         [ TabBar flotante ]        │  ← 184,1260
└────────────────────────────────────┘
```

Login y Menu Hamburguesa no usan TabBar ni el header común.

---

## 3. Tokens

### 3.1 Variables declaradas en `Tizaia.op`

| Variable | Tipo | Valor |
|---|---|---|
| `color-accent` | color | `#F28C6B` |
| `color-accent-soft` | color | `#FED8B9` |
| `color-bg` | color | `#FCF9F3` |
| `color-danger` | color | `#D96B65` |
| `color-line` | color | `#E7D9CE` |
| `color-muted` | color | `#6D777D` |
| `color-success` | color | `#6DBB8A` |
| `color-surface` | color | `#FFFFFF` |
| `color-text` | color | `#24303A` |
| `color-warning` | color | `#F1BE62` |
| `surface-gradient-start` | color | `#FAF0E8` |
| `surface-gradient-end` | color | `#FCF9F3` |
| `radius-sm` | number | `10` |
| `radius-md` | number | `16` |
| `radius-lg` | number | `24` |
| `space-1` | number | `8` |
| `space-2` | number | `12` |
| `space-3` | number | `16` |
| `space-4` | number | `24` |

> **Nota importante:** las pantallas del `.op` están pintadas mayoritariamente con **colores literales** (no referencias a variables). Los literales son igual de normativos. No "corregir" un literal por su variable parecida.

### 3.2 Paleta literal usada en las pantallas

| Rol | Hex | Uso |
|---|---|---|
| Tinta principal | `#3E3030` | Títulos, textos, iconos inactivos, subrayados |
| Tinta botón / activo | `#403034` | Botones oscuros, FAB, pestaña activa, badge |
| Terracota acento | `#C9785D` | Eyebrows, chevrons `›`, enlaces ("¿Olvidaste…?") |
| Texto secundario | `#765D58` | Subtítulos Login/Perfil, email |
| Texto secundario menú | `#846E69` | Subtítulos de MenuItem, materia clase activa |
| Placeholder de campo | `#8C7772` | Placeholders de Login |
| Eyebrow menú / versión | `#8D6A61` | "NAVEGACIÓN", "Tizaia · versión 1.0" |
| Avatar | `#B9D9F4` | Todos los avatares (con iniciales `#3E3030`) |
| Melocotón suave | `#F8C4A6` | Cabeceras Día/Task, badges, iconos de menú, halo logo |
| Celda correcto | `#A8D5BA` | AttendanceCell/TaskCell estado "done" |
| Celda fallo | `#F2A7A0` | Celdas "undone", fondo icono logout |
| Celda pendiente | `#F8EEE5` | Celdas "pending" (asistencia) |
| Tarjeta cristal | `#FFFFFF99` | GlassCards y boards (blanco 60%) |
| Tarjeta perfil | `#FFFFFFD6` | ProfileCard / ActiveClassCard |
| Tarjeta menú | `#FFFFFFB8` | MenuItem |
| Fondo de campo | `#FFF9F4` | Inputs, editores, option rows |
| Borde de campo | `#E7CEC1` | Strokes de inputs/editores |
| Acción suave | `#FFF1E8` | Botones de acción `→`, adjuntar |
| Éxito | `#8FBC8F` | Confirm, PositiveOption, ActiveBadge, anillos |
| Aviso | `#F4A460` | Anillos/indicadores warning |
| Peligro | `#E9967A` | Anillos/indicadores danger |
| Triángulo aviso (Alumnos) | `#C89A31` | Icono Warn |
| Botón ver | `#B9D9F4` | ViewButton (fondo) |
| Botón borrar | `#F5C7C7` fondo / `#C76D6D` icono | DeleteButton |
| Sobre enviar (Anotaciones) | `#223866` | Icono Send |
| Confirmar | `#55B875` | Icono Confirm |
| Logout texto | `#8F4E48` | "Cerrar sesión" y su chevron |
| Logout borde | `#E5B4A4` | Stroke LogoutButton |
| Divider login | `#DDC9BE` | Líneas "o" |
| Borde Google | `#D9C5BB` | Stroke GoogleButton |
| Decoración blanca | `#FFFFFF2E` / `#FFFFFF26` | Círculos decorativos |
| Decoración melocotón | `#F8C4A64D` / `#F8C4A633` | Círculos decorativos |

### 3.3 Tipografía

- **Familia única:** Arial (todo el documento).
- Escala de pesos usados: 300 (solo "+"), 400, 500, 600, 700.
- Tamaños por elemento se detallan en cada pantalla/componente.
- LetterSpacing relevantes: Brand "TIZAIA" `7.0`; Logo menú `5.0`; eyebrows `2.2–2.5`; contraseña `4.0`.

---

## 4. Componentes reutilizables

Identificadores estables para la implementación y para los agentes.

### 4.1 `HeaderBar` (header común)
- **Logo:** texto `LOGO`, Arial 38/700, `#3E3030`, en `(35, 90)`. (En Menu Hamburguesa es `TIZAIA` con ls 5.)
- **MenuIcon:** en `(681, 90)`, contenedor 52×44, `layout: vertical`, `gap: 8`; 3 rectángulos 48×5, radio 3, `#3E3030`.
- Presente en: Home, Asistencia, Alumnos, Tareas, Mails, Anotaciones, Clases, Nueva Anotación, Nuevo Mail, Perfil Alumno.

### 4.2 `TabBar` (barra de navegación inferior flotante)
- Posición `(184, 1260)`, tamaño 400×92, **radio 46 (píldora)**.
- Fondo `#FFFFFFE6`, stroke `#FFFFFF` 1px, sombra `0/6/18` color `#3E303026`.
- Dos pestañas de 160×72, radio 36, en `x=20` y `x=220` (local, `y=10`):
  - **HomeTab** — icono casa (path 44×40).
    - Activo (solo en Home): fondo `#403034`, icono blanco.
    - Inactivo: sin fondo, icono `#3E3030`.
  - **OverviewTab** — icono globo 44×44 en `#3E3030`, strokes 3px: elipse contorno 40×40, elipse meridiano 20×40, rectángulo ecuador 40×3 (radio 1.5).
    - Estado activo no aparece representado en el `.op`.
- Presente en: Home, Asistencia, Alumnos, Tareas, Mails, Anotaciones, Clases, Nueva Anotación, Nuevo Mail, Perfil Alumno.
- Nodos de referencia: `n1529` (Home), `n1537` (Asistencia), etc.

### 4.3 `ScreenTitle`
- Texto centrado, mayúsculas, Arial **48/700** `#3E3030` en pantallas principales; **42/700** en pantallas de formulario/detalle (Nueva Anotación, Nuevo Mail, Perfil Alumno).
- **TitleUnderline:** rectángulo de 4px de alto, radio 2, `#3E3030`, bajo el título (ancho proporcional al texto; ver cada pantalla).

### 4.4 `GlassCard` (tarjeta translúcida)
- Fondo `#FFFFFF99`, stroke `#FFFFFF` 1px, radio 22.
- Variantes de radio: 22 (listas/boards), 28 (métricas perfil), 34 (ProfileCard, FormCard), 42 (LoginCard).

### 4.5 `Avatar`
- Círculo `#B9D9F4` con iniciales centradas `#3E3030`.
- Tamaños según contexto: 92 (Asistencia, 36/400), 95 (Alumnos, 38/400), 98 (Mails, 36/400), 90 (Anotaciones, 34/400), 108 (ProfileCard, 34/700), 96 (Perfil Alumno, 28/700), 66 (Tareas, 25/400), 56 (StudentSelector, 18/700).

### 4.6 `Fab` (botón flotante de alta)
- `(613, 1115)`, 120×120, **radio 60**, fondo `#403034`.
- Contenido "+" Arial 64/300 blanco — excepto Mails (ver 4.7).
- Variantes: `AddStudent`, `AddTask`, `AddAnnotation`, `AddClass`.
- Nodos: `n1525`, `n1264`, `n1577`, `n2073`.

### 4.7 `ComposeFab` (FAB de Mails)
- Mismas dimensiones/posición que `Fab`, con sombra adicional `4/4/8` `#00000040`.
- Icono `ComposeIcon` 52×52: sobre (sobre blanco 44×32 con pliegue `#403034`) + badge plus 18×18 `#403034` con trazos blancos. Nodo `n989`.

### 4.8 `StatusCell` (celda de matriz Asistencia/Tareas)
- 108×88, radio 22, centrado de contenido. Estados por fondo:
  - **Done:** fondo `#A8D5BA`.
  - **Undone:** fondo `#F2A7A0`.
  - **Pending (Asistencia):** fondo `#F8EEE5`. **Pending (Tareas):** sin fondo.
- **Botón interior** 52×52, radio 26, `#403034`:
  - Done → "✓" Arial 30/700 blanco.
  - Undone → "×" Arial 34/700 blanco.
  - Pending → círculo interior 44×44 blanco con "⌛" 26/400 `#403034`.

### 4.9 Botones de acción de fila (Alumnos)
- **ViewButton** 76×55, radio 15, fondo `#B9D9F4`, icono ojo `#403034`.
- **Warn:** triángulo de aviso (path 52×46) `#C89A31`.
- **DeleteButton** 62×55, radio 15, fondo `#F5C7C7`, icono papelera 36×40 `#C76D6D`.

### 4.10 Botones de acción de fila (Anotaciones)
- **ViewButton** igual que 4.9.
- **Send** 52×52: sobre 44×32 `#223866` con pliegue blanco + badge plus `#223866`.
- **Confirm** 52×52, radio 26, `#55B875`, check blanco 32×24.

### 4.11 `ProfileCard` (tarjeta de cuenta docente)
- 696×160, radio 34, fondo `#FFFFFFD6`, stroke blanco 1px, sombra `0/12/34` `#69453624`.
- Contenido (coordenadas locales): avatar elipse 108 `#B9D9F4` en (26,26) con iniciales 34/700; label 14/700 ls2.2 `#C9785D` ("CUENTA DOCENTE"); nombre 30/700 `#3E3030`; email 18/400 `#765D58`; acción 64×56 radio 20 `#FFF1E8` con "→" 26/700 `#C9785D`.
- En Clases `(36, 230)` y Menu Hamburguesa `(36, 186)`. Nodos `n2075` / `n1725`.

### 4.12 `ActiveClassCard` (clase activa del menú)
- 696×104, radio 28, fondo `#FFFFFFD6`, stroke blanco, sombra `0/8/24` `#6945361A`.
- Badge 68×68 radio 22 `#F8C4A6` con texto 22/700 `#403034`; label 13/700 ls2.2 `#C9785D` ("CLASE ACTIVA"); nombre 25/700; materia 16/400 `#846E69`; acción 56×56 radio 20 `#FFF1E8` con "›" 32 `#C9785D`.
- Nodo `n2083`.

### 4.13 `MenuItem` / `MenuItemActive`
- 696×88, radio 28, gap vertical implícito 12 (step 100 entre ítems).
- **Normal:** fondo `#FFFFFFB8`, stroke blanco; ItemIcon 68×68 radio 22 `#F8C4A6` con glifo 28/700 `#403034`; título 24/700 `#3E3030`; subtítulo 16/400 `#846E69`; chevron "›" 32/400 `#C9785D`.
- **Activo (Inicio):** fondo `#403034`; icono fondo `#FFFFFF26`, glifo blanco; título blanco; subtítulo `#FFFFFFB8`; chevron blanco.

### 4.14 `LogoutButton`
- 696×88, radio 28, fondo `#FFF7F2B8`, stroke `#E5B4A4`.
- Icono 64×64 radio 20 `#F2A7A0` con "↪" 27/700 `#403034`; texto "Cerrar sesión" 23/700 `#8F4E48`; chevron "›" 32 `#8F4E48`.

### 4.15 `FormCard` (Nueva Anotación / Nuevo Mail)
- 688×960, radio 34, fondo `#FFFFFF99`, stroke blanco, sombra `0/10/28` `#6945361A`, en `(40, 250)`.
- **Labels** de sección: Arial 18/700 `#3E3030`.
- **Fields:** fondo `#FFF9F4`, stroke `#E7CEC1` 1px, radio 22.
- **Editor:** radio 24, mismo fondo/stroke, con contador "0 / 500" o "0 / 1000" Arial 14/400 abajo-derecha.
- **Composer:** 616×92, radio 28, blanco, stroke `#E7CEC1`; hint 18/600; SendButton 72×72 radio 24 `#403034` con sombra `0/5/12` `#40303433`.

### 4.16 `OptionRow` (tipo de anotación)
- 616×68, radio 20, fondo `#FFF9F4`, stroke blanco; indicador elipse 32×32 con stroke 3px del color de la opción; label 21/600 `#3E3030`.
- Colores: contrarias `#F4A460`, agravantes `#E9967A`, positivas `#8FBC8F`.
- **Estado seleccionado** (PositiveOption): fondo `#8FBC8F`, stroke `#8FBC8F`, indicador blanco con "✓" 20/700 `#3E3030`, label 21/700.

### 4.17 `MetricRing` (Perfil Alumno)
- Elipse 88×88, stroke 9px, fondo `#FFF9F4`.
- Colores: éxito `#8FBC8F`, aviso `#F4A460`, peligro `#E9967A`.
- Valor 23/700 `#3E3030` centrado en el anillo; etiqueta 16/600 debajo (ancho 184, centrada).

### 4.18 `Chip` (destinatarios de Nuevo Mail)
- Alto 58, radio 18, texto 17/700 centrado.
- **Acción** ("+ Familias" / "+ Grupos"): blanco, stroke `#E7CEC1`.
- **Seleccionado familia:** `#B9D9F4`, stroke `#403034`, texto con "×" final.
- **Seleccionado grupo:** `#F8C4A6`, stroke `#403034`, texto con "×" final.

---

## 5. Pantallas definitivas

### 5.1 Home — `page n12` · raíz `n865` (HomeScreen)

Sin status bar mock. Header común. TabBar con HomeTab activo.

| Elemento | Detalle |
|---|---|
| Fondo | Degradado global (ver §2) |
| Logo | `(35, 90)` "LOGO" 38/700 `#3E3030` |
| MenuIcon | `(681, 90)` (§4.1) |
| Title | `(312, 220)` "HOME" 48/700 `#3E3030` |
| TitleUnderline | `(294, 276)` 180×4 r2 `#3E3030` |
| Greeting | `(40, 350)` 545×135, **r44**, fondo `#FFFDFC`; dos líneas "Buenas 👋 ¿En qué te puedo / ayudar?" 32/400 `#3E3030` |
| MessageField | `(40, 1148)` 584×88, r44, blanco; placeholder "Compañero, escríbeme aquí…" 28/400 `#3E3030` |
| SendButton | `(638, 1145)` 94×94, r47, `#403034`; "➤" 38/700 blanco |
| TabBar | `(184, 1260)` (§4.2), HomeTab activo |

Área central (entre saludo y campo de mensaje) reservada para la conversación; en el diseño aparece vacía.

### 5.2 Asistencia — `page n32` · raíz `n1053` (AsistenciaScreen)

| Elemento | Detalle |
|---|---|
| StatusBar mock | `iOSStatusBar` 768×42: Signal "▮▮▮ IOS ◔" 19/600 `(12,7)`; Time "9:37 AM" 20/700 `(337,6)`; Battery "100% ▰" 19/500 `(651,7)`; todos `#3E3030` |
| Header común | Logo `(35,90)` + MenuIcon `(681,90)` |
| Title | `(241.5, 118)` "ASISTENCIA" 48/700 |
| TitleUnderline | `(254, 170)` 260×4 r2 `#3E3030` |
| AttendanceBoard | `(18, 193)` 732×1034, r22, `#FFFFFF99`, stroke blanco |
| TabBar | `(184, 1260)`, ambas pestañas inactivas |

**AttendanceBoard (n1060):**
- **5 DayHeader** 111×103 r12 `#F8C4A6`, en `y=12` local, `x = 124, 245, 366, 487, 609`; texto "Día 1..5" 25/400 centrado `#3E3030`.
- **7 AttendanceRow** 732×92 en `y = 147, 274, 401, 528, 655, 782, 909` (step 127):
  - Avatar 92×92 r46 `#B9D9F4` en `x=12`, iniciales 36/400.
  - 5 AttendanceCell (§4.8) 108×88 en `x = 127, 248, 369, 490, 612`.
  - Los estados de las celdas del mock (done/undone/pending) son datos de ejemplo, no patrón fijo.

### 5.3 Alumnos — `page n123` · raíz `n883` (AlumnosScreen)

| Elemento | Detalle |
|---|---|
| StatusBar mock | Igual que Asistencia |
| Header común | Logo + MenuIcon (y=90) |
| Title | `(265, 121)` "ALUMNOS" 48/700 |
| TitleUnderline | `(239, 171)` 290×4 r2 |
| AddStudent (FAB) | `(613, 1115)` (§4.6) |
| HomeIndicator mock | `(244, 1320)` texto "━" 25/700 `#111` |
| TabBar | `(184, 1260)` |

**6 StudentCard** 698×145 r22 glass en `x=35`, `y = 202, 378, 554, 730, 906, 1082` (step 176). Contenido (local):
- Avatar 95 r47.5 `(45, 25)`, iniciales 38/400.
- Name `(185, 49)` 38/600 `#3E3030` (ej. "Clara").
- ViewButton `(439, 45)` (§4.9).
- Warn path 52×46 `(538, 50)` `#C89A31`.
- DeleteButton `(616, 45)` (§4.9).

### 5.4 Tareas — `page n192` · raíz `n1149` (TareasScreen)

| Elemento | Detalle |
|---|---|
| StatusBar mock | Igual que Asistencia |
| Header común | Logo + MenuIcon |
| Title | `(288, 118)` "TAREAS" 48/700 |
| TitleUnderline | `(282, 170)` 204×4 r2 |
| AddTask (FAB) | `(613, 1115)` |
| TabBar | `(184, 1260)` |

**TaskBoard (n1159)** `(18, 193)` 732×1034 r22 glass:
- **5 TaskHeader** 111×103 r12 `#F8C4A6`, `y=12`, `x = 124, 245, 366, 487, 609`; texto "Task 1..5" 20/400 centrado.
- **6 TaskRow** 732×92 en `y = 147, 274, 401, 528, 655` (step 127):
  - Avatar 66×66 r33 `(25, 0)`, iniciales 25/400.
  - Name `(3, 65)` 22/400 centrado bajo el avatar.
  - 5 TaskCell 108×88 en `x = 127, 248, 369, 490, 612` (§4.8; pendiente sin fondo).

### 5.5 Mails — `page n311` · raíz `n950` (MailsScreen)

Sin status bar mock.

| Elemento | Detalle |
|---|---|
| Header común | Logo `(35,90)` + MenuIcon `(681,90)` |
| Title | `(312, 78)` "MAILS" 48/700 |
| TitleUnderline | `(279, 135)` 210×4 r2 |
| Compose (FAB) | `(613, 1115)` (§4.7) |
| TabBar | `(184, 1260)` |

**6 MailCard** 615×160 r22 glass en `x=77`, `y = 196, 370, 544, 719, 893, 1067` (step ~174). Contenido (local):
- MailAvatar 98 r49 `(29, 31)`, iniciales 36/400.
- Sender `(143, 28)` 30/500 `#3E3030` (ej. "Clara Lopez").
- Date `(460, 30)` 26/400, alineado a la derecha (ej. "11:45 AM").
- Subject `(143, 78)` 25/400 (ej. "Re: Parent Teacher Conference").

### 5.6 Anotaciones — `page n354` · raíz `n991` (AnotacionesScreen)

| Elemento | Detalle |
|---|---|
| StatusBar mock | Igual que Asistencia |
| Header común | Logo + MenuIcon |
| Title | `(209.5, 222)` "ANOTACIONES" 48/700 |
| TitleUnderline | `(229, 266)` 310×4 r2 |
| AddAnnotation (FAB) | `(613, 1115)` |
| TabBar | `(184, 1260)` |

**6 AnnotationCard** 688×140 r22 glass en `x=40`, `y = 309, 465, 621, 776, 932, 1087` (step ~155). Contenido (local):
- Avatar 90 r45 `(29, 25)`, iniciales 34/400.
- Name `(147, 54)` 34/400 `#3E3030`.
- ViewButton `(398, 43)` 76×55 (§4.9).
- Send `(512, 44)` 52×52 (§4.10).
- Confirm `(602, 44)` 52×52 (§4.10).

### 5.7 Clases — `page n1930` · raíz `n1931` (ClassesScreen)

| Elemento | Detalle |
|---|---|
| StatusBar mock | Igual que Asistencia |
| Header común | Logo `(35,90)` + MenuIcon `(681,90)` |
| Title | `(272, 156)` "CLASES" 48/700 centrado |
| TitleUnderline | `(294, 210)` 180×4 r2 |
| ProfileCard | `(36, 230)` (§4.11) — "CUENTA DOCENTE / Laura Martínez / laura@tizaia.es" |
| AddClass (FAB) | `(613, 1115)` |
| TabBar | `(184, 1260)` |

**6 ClassCard** 688×114 r22 glass en `x=40`, `y = 414, 540, 666, 792, 918, 1044` (step 126). Contenido (local):
- GroupName `(32, 15)` 34/700 `#3E3030` (ej. "2 ESO G").
- Subject `(32, 65)` 24/400 `#3E3030` (ej. "Tecnología").

### 5.8 Login — `page n1680` · raíz `n1681` (LoginScreen)

Sin header común ni TabBar. `clipContent: true` (degradado con parada 0.52).

| Elemento | Detalle |
|---|---|
| Time / Status mock | `(36, 28)` y `(640, 28)` |
| BrandMark | `(300, 108)` 168×168 r84 `#FFFFFFC7`, stroke blanco, sombra `0/12/34` `#8D5A4330`; LogoHalo elipse 120 `#F8C4A6` `(24,24)`; LogoLetter "T" 64/700 `#403034` |
| Brand | `(184, 292)` "TIZAIA" 44/700 ls7 `#3E3030` centrado |
| BrandTagline | `(134, 346)` "Tu aula, más cerca" 20/400 `#765D58` centrado |
| Privacy | `(94, 1282)` "Al continuar, aceptas las condiciones y la privacidad de Tizaia." 15/400 `#765D58` centrado |
| DecorTop | Elipse 250 `#FFFFFF2E` en `(-92, 82)` |
| DecorBottom | Elipse 230 `#F8C4A64D` en `(620, 1180)` |

**LoginCard (n1691)** `(40, 410)` 688×832 **r42** `#FFFFFFE6`, stroke blanco, sombra `0/16/44` `#5C3B3026`:
- Eyebrow `(48,48)` "BIENVENIDO DE NUEVO" 16/700 ls2.4 `#C9785D`.
- Title "Iniciar sesión" 44/700 `#3E3030`; Subtitle "Continúa donde lo dejaste." 22/400 `#765D58`.
- **EmailField** 592×82 r22: icono 48×48 r16 `#F8C4A6` con "@" 24/700 `#403034`; placeholder "profesor@email.com" 20/400 `#8C7772`.
- **PasswordField** 592×82 r22: icono candado; placeholder "••••••••" 23/700 ls4 `#8C7772`; toggle "◉" 20/700 `#765D58` a la derecha.
- Labels "Correo electrónico" / "Contraseña" 17/700 `#3E3030`.
- ForgotPassword "¿Olvidaste tu contraseña?" 17/700 `#C9785D` alineado a la derecha.
- **LoginButton** 592×86 r26 `#403034`, sombra `0/8/20` `#40303433`; texto "Iniciar sesión" 22/700 blanco centrado + "→" 28/700 blanco a la derecha.
- **Divider:** líneas 1px `#DDC9BE` (244px izq / 292px der) con "o" 20/400 `#8C7772` centrado.
- **GoogleButton** 592×82 r24 blanco, stroke `#D9C5BB`: GoogleMark elipse 40 `#FFF9F4` stroke `#E7CEC1` con "G" 22/700 `#C9785D`; texto "Continuar con Google" 20/700 `#3E3030`.

### 5.9 Menu Hamburguesa — `page n1682` · raíz `n1683` (MenuScreen)

Sin TabBar. `clipContent: true`. Equivalente visual del drawer de navegación a pantalla completa.

| Elemento | Detalle |
|---|---|
| Time / Status mock | `(36, 28)` y `(640, 28)` |
| Logo | `(36, 86)` "TIZAIA" 38/700 ls5 `#3E3030` |
| CloseButton | `(656, 78)` 76×76 r38 `#FFFFFFB8` stroke blanco; "×" 38/400 `#403034` |
| ProfileCard | `(36, 186)` (§4.11) |
| ActiveClassCard | `(36, 374)` (§4.12) — "1.º / CLASE ACTIVA / 1.º BACHILLER D / Tecnología" |
| MenuEyebrow | `(48, 500)` "NAVEGACIÓN" 15/700 ls2.5 `#8D6A61` |
| MenuItemActive | `(36, 532)` (§4.13) — ⌂ "Inicio / Tu espacio principal" |
| 6 MenuItem | `(36, 632…1032)` step 100 (§4.13, ver listado) |
| LogoutButton | `(36, 1144)` (§4.14) |
| Version | `(36, 1290)` "Tizaia · versión 1.0" 15/400 `#8D6A61` centrado |
| DecorTop | Elipse 280 `#FFFFFF26` en `(570, -80)` |
| DecorBottom | Elipse 300 `#F8C4A633` en `(-120, 1160)` |

**Ítems del menú (título / subtítulo / glifo):**
1. Inicio / Tu espacio principal / ⌂ (activo)
2. Asistencia / Control diario del aula / ✓
3. Alumnos / Perfiles y seguimiento / A
4. Tareas / Planifica y revisa / ◆
5. Mails / Mensajes del centro / ✉
6. Anotaciones / Ideas y observaciones / ✎

### 5.10 Nueva Anotación — `page n1778` · raíz `n1779` (NewAnnotationScreen)

`clipContent: true`. Header común + TabBar.

| Elemento | Detalle |
|---|---|
| Header común | Logo `(35,90)` + MenuIcon `(681,90)` |
| Title | `(154, 160)` "NUEVA ANOTACIÓN" **42/700** centrado |
| TitleUnderline | `(238, 214)` 292×4 r2 |
| AnnotationFormCard | `(40, 250)` 688×960 (§4.15) |
| TabBar | `(184, 1260)` |

**AnnotationFormCard (n1789):**
- "Alumno" 18/700 → **StudentSelector** 616×82 r22: avatar 56 `#B9D9F4` "ED" 18/700; "Esteban Domínguez" 23/700; "2º ESO C/D" 16/400; chevron "›" 30/400.
- "Tipo de anotación" 18/700 → 3 **OptionRow** (§4.16): "Conductas contrarias" `#F4A460`, "Conductas agravantes" `#E9967A`, "Refuerzo positivo" `#8FBC8F` (seleccionada).
- "Descripción" 18/700 → **AnnotationEditor** 616×300 r24, placeholder "Escribe aquí los detalles de la anotación…" 20/400; contador "0 / 500" 14/400.
- **AnnotationComposer** 616×92 r28: hint "Lista para guardar" 18/600 + SendButton 72×72 r24 `#403034`.

### 5.11 Nuevo Mail — `page n1824` · raíz `n1825` (NewMailScreen)

`clipContent: true`. Header común + TabBar.

| Elemento | Detalle |
|---|---|
| Header común | Logo `(35,90)` + MenuIcon `(681,90)` |
| Title | `(204, 160)` "NUEVO MAIL" **42/700** centrado |
| TitleUnderline | `(264, 214)` 240×4 r2 |
| MailFormCard | `(40, 250)` 688×960 (§4.15) |
| TabBar | `(184, 1260)` |

**MailFormCard (n1835):**
- "Para" 18/700 → chips (§4.18): "+ Familias" (264×58), "+ Grupos" (300×58); seleccionados: "Familia de Eva ×" (`#B9D9F4`), "2º ESO C/D ×" (`#F8C4A6`).
- "Asunto" 18/700 → **SubjectField** 616×76 r22, placeholder "Escribe el asunto del mensaje" 19/400.
- "Mensaje" 18/700 → **MailEditor** 616×384 r24, placeholder "Escribe aquí…" 20/400; contador "0 / 1000" 14/400.
- **MailComposer** 616×92 r28: AttachmentButton 72×72 r24 `#FFF1E8`; hint "Borrador guardado" 18/600; SendButton 72×72 r24 `#403034`.

### 5.12 Perfil Alumno — `page n1866` · raíz `n1867` (StudentProfileScreen)

`clipContent: true`. Header común + TabBar.

| Elemento | Detalle |
|---|---|
| Header común | Logo `(35,90)` + MenuIcon `(681,90)` |
| Title | `(244, 160)` "ALUMNO" **42/700** centrado |
| TitleUnderline | `(284, 214)` 200×4 r2 |
| EditStudentButton | `(648, 148)` 72×72 r24 `#403034`, sombra `0/5/12` `#40303433`; icono lápiz (path 34×35) blanco |
| TabBar | `(184, 1260)` |

**Tarjetas (todas r28 glass, sombra `0/7/20` `#69453614`):**
- **StudentSummaryCard** `(40, 250)` 688×150: avatar elipse 96 "ED" 28/700; "Esteban Domínguez" 29/700; "2º ESO C/D" 19/600; ActiveBadge 138×34 r17 `#8FBC8F` con "ACTIVO" 14/700 `#3E3030`.
- **AttendanceMetricsCard** `(40, 420)` 688×190, título "ASISTENCIA" 19/700; 3 MetricRing (§4.17): 92% Asistencia `#8FBC8F`, 5 Faltas `#E9967A`, 3 Retrasos `#F4A460`.
- **DescriptionCard** `(40, 630)` 688×165, título "DESCRIPCIÓN" 19/700; texto libre 18/400 `#3E3030` (ej. "Alumno participativo y creativo…").
- **BehaviorMetricsCard** `(40, 815)` 688×190, título "ANOTACIONES DE COMPORTAMIENTO" 18/700; anillos: 8 Positivas `#8FBC8F`, 2 Contrarias `#F4A460`, 0 Graves `#E9967A`.
- **TaskMetricsCard** `(40, 1025)` 688×195, título "TAREAS" 19/700; anillos: 18 Completadas `#8FBC8F`, 3 Pendientes `#F4A460`, 1 Sin entregar `#E9967A`.

---

## 6. Trazabilidad con `Tizaia.op`

| Pantalla | Página | Frame raíz |
|---|---|---|
| Home | `n12` | `n865` |
| Asistencia | `n32` | `n1053` |
| Alumnos | `n123` | `n883` |
| Tareas | `n192` | `n1149` |
| Mails | `n311` | `n950` |
| Anotaciones | `n354` | `n991` |
| Clases | `n1930` | `n1931` |
| Login | `n1680` | `n1681` |
| Menu Hamburguesa | `n1682` | `n1683` |
| Nueva Anotación | `n1778` | `n1779` |
| Nuevo Mail | `n1824` | `n1825` |
| Perfil Alumno | `n1866` | `n1867` |
| ~~Components~~ | `n418` | **Excluida** |

Nodos de referencia citados en el texto: TabBar `n1529`, ProfileCard `n1725`/`n2075`, ActiveClassCard `n2083`, MenuItem `n1740`, LogoutButton `n1770`, LoginCard `n1691`, AnnotationFormCard `n1789`, MailFormCard `n1835`, FABs `n1525`/`n1264`/`n1577`/`n2073`/`n989`.

---

## 7. Notas de implementación

1. **Escala:** el canvas es 768 de ancho. En React Native usar dimensión base 768 o escalar por `anchoPantalla / 768`; las proporciones relativas deben conservarse.
2. **Mocks del sistema:** status bar y home indicator del `.op` no se implementan como componentes.
3. **Textos de ejemplo:** nombres ("Clara", "Esteban Domínguez", "Laura Martínez"), horas ("11:45 AM"), asuntos y valores de métricas son datos mock del diseño. La maqueta (tipografía, color, posición, cantidades) sí es normativa.
4. **Estados de celdas:** la distribución done/undone/pending de las matrices es ejemplo; los tres estados y sus estilos (§4.8) son el contrato.
5. **TabBar OverviewTab:** solo existe representación del estado inactivo; si se necesita estado activo, seguir el patrón del HomeTab (fondo `#403034`, icono blanco).
6. **Gradiente:** las variables `surface-gradient-*` (`#FAF0E8 → #FCF9F3`) no coinciden con el degradado pintado en las pantallas (`#FBC7A5 → #FCE0C3 → #FFF8EC`). Mandan los valores pintados.
