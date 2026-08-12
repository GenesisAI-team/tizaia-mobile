# HU-005 — Consultar y gestionar alumnos

Alumnos muestra listado vertical con foto, nombre y acciones. Ver abre detalle; Añadir anotación abre formulario con alumno precargado; Eliminar solicita confirmación, elimina información asociada y refresca. RF-ALUM-001..007, BR-DELETE-001. Borrado físico/lógico y retención: Q-007.

## Estado de implementación

- Diseño visual del listado (issue #18): implementado en `mobile/src/features/students/presentation/` con datos mock, scroll vertical, áreas táctiles de 48 dp y etiquetas de accesibilidad.
- `StudentAvatar` e iconos (ojo azul, warning amarillo, papelera roja): copias locales provisionales alineadas con el contrato de UI-000 (#16); pendiente sustituirlas por los componentes compartidos de `mobile/src/shared/` cuando UI-000 se integre.
- Rutas `StudentDetail` (HU-006) y `NewAnnotation` (HU-009): preparadas como constantes en `StudentsScreen` pero no registradas en el navegador en esta iteración (evita conflictos con PRs paralelas); los botones ojo/warning son de momento no-op documentados.
- Pendiente (fuera del alcance de #18): borrado con confirmación (BR-DELETE-001), persistencia, datos reales (RF-ALUM-001..007), Q-007.

