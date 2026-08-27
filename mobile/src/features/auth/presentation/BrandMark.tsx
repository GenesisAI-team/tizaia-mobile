/**
 * Alias de compatibilidad hacia la fuente única del logotipo.
 *
 * La marca vive en `shared/components/BrandMark.tsx` con variantes
 * login/header/loading. Este archivo re-exporta para no romper los imports
 * existentes de Login (pantalla y tests).
 */
export { BrandMark } from '../../../shared/components/BrandMark';
export type { BrandMarkVariant } from '../../../shared/components/BrandMark';
