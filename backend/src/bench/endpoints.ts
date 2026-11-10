import type { EndpointSpec } from './types.js';

/**
 * Conjunto representativo de endpoints críticos de #76 / PR #101 (issue #104).
 * Valor de clase/query concreto del seed (`class-1`). NO incluye el asistente
 * real: su coste y latencia dependen del proveedor y consume créditos; se
 * mide en el eval runner de su issue específica.
 */
export const BENCH_ENDPOINTS: readonly EndpointSpec[] = [
  {
    name: '/health',
    method: 'GET',
    path: '/health',
    routeTemplate: '/health',
  },
  {
    name: '/v1/bootstrap',
    method: 'GET',
    path: '/v1/bootstrap',
    routeTemplate: '/v1/bootstrap',
  },
  {
    name: '/v1/me',
    method: 'GET',
    path: '/v1/me',
    routeTemplate: '/v1/me',
  },
  {
    name: '/v1/classes/:classId/students',
    method: 'GET',
    path: '/v1/classes/class-1/students',
    routeTemplate: '/v1/classes/:classId/students',
  },
  {
    name: '/v1/classes/:classId/attendance-board',
    method: 'GET',
    path: '/v1/classes/class-1/attendance-board',
    routeTemplate: '/v1/classes/:classId/attendance-board',
  },
  {
    name: '/v1/classes/:classId/task-board',
    method: 'GET',
    path: '/v1/classes/class-1/task-board',
    routeTemplate: '/v1/classes/:classId/task-board',
  },
  {
    name: '/v1/annotations?classId=class-1',
    method: 'GET',
    path: '/v1/annotations?classId=class-1',
    routeTemplate: '/v1/annotations',
  },
];
