# HU-002 — Consultar el asistente de IA

Como profesor/a autenticado/a, quiero enviar consultas y recibir respuestas contextualizadas en una conversación única. **Criterios:** Home muestra área e historial; enviar texto inicia el flujo del asistente vía el backend propio (`POST /v1/assistant/messages`); el backend usa AI SDK con proveedor directo y consulta los datos de apoyo (almacén en memoria con seeds deterministas); la respuesta aparece en el chat. RF-CHAT-001..006, INT-BACKEND-001, INT-ASSISTANT-001. RAG queda aplazado (fuera de alcance del MVP mientras los datos sean estructurados, [RFC-001](../07-assistant-backend-rfc.md)). Latencia, límites, errores y calidad quedan abiertos.

## Estado de implementación (AI-001, #69)

- **Backend**: `POST /v1/assistant/messages` no streaming con AI SDK 7
  (proveedor directo configurable), conversaciones en memoria
  (`conversationId` opaco, TTL y límite de mensajes) y 20 tools de lectura
  que consultan los mismos servicios de aplicación que la API REST. Errores
  estables: `400` payload inválido, `404` conversación inexistente/expirada,
  `503` sin proveedor configurado, `504` timeout y `502` fallo del proveedor.
- **Móvil**: `ApiAssistantGateway` consume el endpoint reutilizando
  `apiClient`; `EXPO_PUBLIC_ASSISTANT_MODE=api|fake` selecciona la
  implementación en la raíz de composición y `HomeScreen` mantiene la
  continuidad por `conversationId` mostrando errores recuperables.
- **Pruebas sin modelo real**: unitarias por tool y del store; integración del
  endpoint con modelo simulado (selección de tools, argumentos y errores);
  CI no realiza llamadas al proveedor ni consume créditos. La prueba manual
  con proveedor real requiere `OPENAI_API_KEY` en el backend.
