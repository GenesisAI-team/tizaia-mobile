# HU-004 — Registrar y consultar asistencia

Para una clase, Asistencia muestra alumnos y las cinco fechas recientes descendentes; cada celda usa color según estado. El control recorre Asistido → No asistido → Tarde → Asistido y persiste alumno, fecha y estado. RF-ASIS-001..006, BR-ASIS-001, DAT-ASIS-001. Selección de clase y errores de persistencia: abiertos.

## Fase de diseño visual

La estructura visual aprobada está en revisión en la issue #17/PR #25: título, avatar fijo, cinco fechas recientes con tres visibles, scroll horizontal sincronizado, scroll vertical de alumnos y botones circulares con datos mock. La lógica RF-ASIS, persistencia y selección de clase quedan pendientes.

