export type MockStudent = {
  id: string;
  name: string;
};

/**
 * Datos mock exclusivos del diseño visual de Alumnos (HU-005, issue #18).
 * Sin persistencia ni backend: viven solo en el estado local de la pantalla.
 * Serán sustituidos por el repositorio real cuando se implementen
 * RF-ALUM-001..007.
 */
export const MOCK_STUDENTS: readonly MockStudent[] = [
  { id: 'mock-01', name: 'Lucía García Pérez' },
  { id: 'mock-02', name: 'Mateo Fernández López' },
  { id: 'mock-03', name: 'Sofía Martínez Sánchez' },
  { id: 'mock-04', name: 'Diego Rodríguez Gómez' },
  { id: 'mock-05', name: 'Valeria López Díaz' },
  { id: 'mock-06', name: 'Daniel Sánchez Romero' },
  { id: 'mock-07', name: 'Carmen Pérez Navarro' },
  { id: 'mock-08', name: 'Hugo Gómez Torres' },
  { id: 'mock-09', name: 'Martina Díaz Ramos' },
  { id: 'mock-10', name: 'Adrián Romero Castro' },
  { id: 'mock-11', name: 'Julia Navarro Ortiz' },
  { id: 'mock-12', name: 'Pablo Torres Vargas' },
];
