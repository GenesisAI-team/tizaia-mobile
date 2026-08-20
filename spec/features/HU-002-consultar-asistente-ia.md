# HU-002 — Consultar el asistente de IA

Como profesor/a autenticado/a, quiero enviar consultas y recibir respuestas contextualizadas en una conversación única. **Criterios:** Home muestra área e historial; enviar texto inicia el flujo del asistente vía el backend propio (`POST /v1/assistant/messages`); el backend usa AI SDK con proveedor directo y consulta los datos de apoyo (almacén en memoria con seeds deterministas); la respuesta aparece en el chat. RF-CHAT-001..006, INT-BACKEND-001, INT-ASSISTANT-001. RAG queda aplazado (fuera de alcance del MVP mientras los datos sean estructurados, [RFC-001](../07-assistant-backend-rfc.md)). Latencia, límites, errores y calidad quedan abiertos.

