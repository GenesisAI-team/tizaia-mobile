# HU-007 — Registrar entrega de tareas

Tareas muestra alumnos y cinco tareas recientes descendentes; tres son visibles inicialmente y el resto tiene scroll horizontal. No entregada/rojo alterna con Entregada/verde y persiste alumno, tarea/fecha y estado. RF-TASK-001..006, BR-TASK-001, DAT-TASK-001. No incluye creación de tareas ni selección de clase.

## Implementación fase 1 (diseño visual, issue #19)

La pantalla Tareas reproduce la estructura de matriz aprobada (equivalente a Asistencia): título `TAREAS`, columna fija de avatar de alumno, cabecera con las cinco tareas recientes ordenadas de más reciente a más antigua (título + fecha dd/MM), tres columnas visibles (`getTaskColumnWidth` = (ancho ventana − columna avatar − padding) / 3) y botones circulares por celda. Scroll horizontal sincronizado entre cabecera y filas mediante `createHorizontalScrollSync` (registro de ScrollView + `syncFrom` con guarda de reentrada); scroll vertical de alumnos con cabecera fija. Datos 100% mock locales (`tasksMockData.ts`): 5 tareas y 8 alumnos con estados Entregada/verde y No entregada/rojo. Botones visualmente pulsables (feedback pressed) sin alternancia real ni persistencia: RF-TASK-001..006, BR-TASK-001 y DAT-TASK-001 siguen pendientes.

Como UI-000 (#16) aún no estaba mergeado, esta fase introduce el subconjunto mínimo de sus contratos compartidos, con los mismos nombres descritos en la issue: `shared/theme.ts` (colors/spacing/radii/typography), `shared/components/StudentAvatar.tsx` (iniciales o foto, etiqueta accesible) y `shared/components/CircularStateButton.tsx` (botón circular de estado, puramente visual). Deben reconciliarse con el contrato definitivo cuando UI-000 aterrice.

