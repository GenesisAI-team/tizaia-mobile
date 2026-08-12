# HU-010 — Consultar bandeja de correos

Mails muestra diez mensajes recientes descendentes con asunto, remitente, fragmento y fecha. No leído va en negrita; leído normal/atenuado. Pulsar abre detalle y marca leído; al superar diez, carga bloques de diez. RF-MAIL-001..009, DAT-MAIL-001. Detalle mail: Q-005.

## Implementación

### Fase de diseño visual (issue #21)

`MailScreen` reproduce la estructura aprobada: header compartido existente (HU-003), título visual `MAILS` (`ScreenTitle` de UI-000), `FlatList` vertical con hasta diez correos mock (`mockMails.ts`, `MAX_VISIBLE_MAILS = 10`) y botón correo+ centrado abajo (`ActionIconButton` + `MailPlusIcon` compartidos). Cada fila (`MailListItem`) muestra avatar del remitente (`StudentAvatar` de UI-000 con iniciales derivadas por `getSenderInitials`), nombre, hora/fecha ya formateada, asunto y fragmento; el estilo no leído/leído es solo presentación estática del mock. La pantalla consume los contratos compartidos de UI-000 (#16): `designTokens` (colores/espaciados/radios/tipografía), `StudentAvatar`, `ScreenTitle`, `ActionIconButton` e `icons/MailPlusIcon`.

Pendiente (fuera de alcance de la fase): lectura real/no leído, detalle de correo (Q-005), paginación real en bloques de diez, proveedor de correo (Q-011), alcances (Q-008), Supabase y la ruta/pantalla de composición (HU-011); el botón correo+ queda cableado a una acción vacía documentada.

