import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

import type { AssistantConfig } from '../../config/env.js';

/**
 * Factoría de modelo intercambiable (RFC-001 §5): AI SDK como librería open
 * source, paquete directo del proveedor y sin AI Gateway. Cambiar de
 * proveedor compatible solo toca este fichero; tools y casos de uso quedan
 * intactos. Devuelve `undefined` cuando falta la clave: el endpoint responde
 * entonces 503 estable en lugar de fallar el arranque.
 */
export function createLanguageModel(
  config: AssistantConfig,
): LanguageModel | undefined {
  if (config.apiKey === undefined) {
    return undefined;
  }
  switch (config.provider) {
    case 'openai': {
      // Paquete directo del proveedor; sin Vercel AI Gateway por defecto.
      const openai = createOpenAI({ apiKey: config.apiKey });
      return openai.chat(config.model);
    }
    default: {
      throw new Error(
        `Proveedor de IA no soportado: ${String(config.provider)}`,
      );
    }
  }
}
