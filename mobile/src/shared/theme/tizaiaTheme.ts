/**
 * Tema definitivo de Tizaia.
 *
 * Fuente de verdad visual: `design/Tizaia.op`, documentado en `DESIGN.md` (raíz) §3.
 *
 * Escala: el lienzo del diseño es 768×1376 px a densidad 2x, por lo que
 * 1px de diseño equivale a 0.5dp. Los valores de este archivo se expresan en
 * px de diseño para mantener trazabilidad directa con DESIGN.md; los
 * componentes los convierten con `dp()`.
 */

export const DESIGN_CANVAS = { height: 1376, width: 768 } as const;

/** Convierte px del lienzo de diseño (768 de ancho @2x) a dp de React Native. */
export const dp = (designPx: number): number => designPx / 2;

export const tizaiaColors = {
  ink: '#3E3030',
  inkButton: '#403034',
  accent: '#C9785D',
  textSecondary: '#765D58',
  textMenuSecondary: '#846E69',
  placeholder: '#8C7772',
  eyebrowMuted: '#8D6A61',
  avatar: '#B9D9F4',
  peach: '#F8C4A6',
  cellDone: '#A8D5BA',
  cellUndone: '#F2A7A0',
  cellPending: '#F8EEE5',
  cardGlass: '#FFFFFF99',
  cardProfile: '#FFFFFFD6',
  cardMenu: '#FFFFFFB8',
  cardStrong: '#FFFFFFE6',
  fieldBackground: '#FFF9F4',
  fieldBorder: '#E7CEC1',
  actionSoft: '#FFF1E8',
  success: '#8FBC8F',
  warning: '#F4A460',
  danger: '#E9967A',
  warnTriangle: '#C89A31',
  deleteBackground: '#F5C7C7',
  deleteIcon: '#C76D6D',
  sendIcon: '#223866',
  confirm: '#55B875',
  logoutText: '#8F4E48',
  logoutBorder: '#E5B4A4',
  divider: '#DDC9BE',
  googleBorder: '#D9C5BB',
  white: '#FFFFFF',
} as const;

/** Degradado vertical global de pantalla (DESIGN.md §2). */
export const tizaiaGradient = {
  start: '#FBC7A5',
  mid: '#FCE0C3',
  end: '#FFF8EC',
  midOffset: 0.5,
} as const;

/** Espaciados declarados en Tizaia.op (px de diseño). */
export const tizaiaSpacing = {
  1: 8,
  2: 12,
  3: 16,
  4: 24,
} as const;

/** Radios declarados en Tizaia.op (px de diseño). */
export const tizaiaRadius = {
  sm: 10,
  md: 16,
  lg: 24,
} as const;

/** Tipografía base (Arial, px de diseño). */
export const tizaiaTypography = {
  screenTitle: { fontSize: 48, fontWeight: '700' },
  formTitle: { fontSize: 42, fontWeight: '700' },
  eyebrow: { fontSize: 16, fontWeight: '700' },
  cardTitle: { fontSize: 34, fontWeight: '700' },
  body: { fontSize: 32, fontWeight: '400' },
  label: { fontSize: 18, fontWeight: '700' },
} as const;
