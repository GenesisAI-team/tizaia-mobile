import type { MailListItemModel } from './MailListItem';

/**
 * Máximo de correos visibles por estado visual (bandeja de diez, HU-010).
 * La paginación real en bloques de diez queda pendiente de la integración.
 */
export const MAX_VISIBLE_MAILS = 10;

/**
 * Datos de ejemplo puramente visuales para el diseño de Mails (issue #21).
 * Personas y contenidos inventados; sin lectura real, sin proveedor de
 * correo y sin persistencia (Q-005, Q-008 y Q-011 siguen abiertas).
 */
export const mockMails: MailListItemModel[] = [
  {
    id: 'mock-mail-01',
    senderName: 'Marta Jiménez',
    subject: 'Ausencia de Alex el lunes',
    snippet: 'Buenos días, Alex no podrá asistir el lunes por una cita médica…',
    displayDate: '09:41',
    isUnread: true,
  },
  {
    id: 'mock-mail-02',
    senderName: 'Dirección del centro',
    subject: 'Reunión de evaluación',
    snippet: 'Se convoca al claustro a la reunión de evaluación del jueves…',
    displayDate: '08:15',
    isUnread: true,
  },
  {
    id: 'mock-mail-03',
    senderName: 'Carlos Ortega',
    subject: 'Excursión al museo',
    snippet: '¿Falta alguna autorización por entregar? Tengo la de mi hija…',
    displayDate: 'Ayer',
    isUnread: false,
  },
  {
    id: 'mock-mail-04',
    senderName: 'Lucía Fernández',
    subject: 'Duda sobre los deberes',
    snippet: 'Mi hijo no ha entendido bien el ejercicio 3 de matemáticas…',
    displayDate: 'Ayer',
    isUnread: false,
  },
  {
    id: 'mock-mail-05',
    senderName: 'Secretaría',
    subject: 'Calendario de actividades',
    snippet: 'Adjuntamos el calendario de actividades del próximo trimestre…',
    displayDate: '12 may',
    isUnread: false,
  },
  {
    id: 'mock-mail-06',
    senderName: 'Pedro Navarro',
    subject: 'Tutoría individual',
    snippet: '¿Sería posible adelantar la tutoría de la semana que viene?…',
    displayDate: '10 may',
    isUnread: false,
  },
  {
    id: 'mock-mail-07',
    senderName: 'Ana Belén Ruiz',
    subject: 'Material de plástica',
    snippet: '¿Qué material hace falta para el proyecto de esta semana?…',
    displayDate: '9 may',
    isUnread: false,
  },
  {
    id: 'mock-mail-08',
    senderName: 'AMPA',
    subject: 'Fiesta de fin de curso',
    snippet: 'Os escribimos para organizar los turnos de la fiesta final…',
    displayDate: '8 may',
    isUnread: false,
  },
  {
    id: 'mock-mail-09',
    senderName: 'Javier Molina',
    subject: 'Recuperación de inglés',
    snippet: 'Quería confirmar la fecha de la prueba de recuperación…',
    displayDate: '6 may',
    isUnread: false,
  },
  {
    id: 'mock-mail-10',
    senderName: 'Sofía Delgado',
    subject: 'Gracias por la tutoría',
    snippet: 'Muchas gracias por la conversación de ayer, nos quedamos más…',
    displayDate: '5 may',
    isUnread: false,
  },
];
