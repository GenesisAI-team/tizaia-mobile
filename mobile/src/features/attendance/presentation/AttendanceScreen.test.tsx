import { act } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { CircularStatusButton } from '../../../shared/components/CircularStatusButton';
import { StudentAvatar } from '../../../shared/components/StudentAvatar';
import { AttendanceScreen } from './AttendanceScreen';
import {
  ATTENDANCE_DATE_COUNT,
  AVATAR_COLUMN_WIDTH,
  computeDateCellWidth,
} from './attendanceLayout';
import { MOCK_STUDENTS } from './mockAttendance';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function renderScreen(): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(<AttendanceScreen />);
  });
  return renderer;
}

/**
 * Los componentes nativos (View, ScrollView…) aparecen duplicados en el árbol
 * de react-test-renderer (capas compuestas + host). Filtramos por el tipo
 * exacto del componente React importado para quedarnos con una sola capa.
 */
function findCompositeByTestId(
  renderer: ReactTestRenderer,
  type: typeof View | typeof ScrollView,
  testID: string,
): ReactTestInstance {
  const matches = renderer.root.findAll(
    (node) => node.type === type && node.props.testID === testID,
  );
  if (matches.length !== 1) {
    throw new Error(
      `testID ${testID}: esperado 1, encontrados ${matches.length}`,
    );
  }
  return matches[0]!;
}

function findDateCells(renderer: ReactTestRenderer): ReactTestInstance[] {
  return renderer.root.findAll(
    (node) =>
      node.type === View &&
      typeof node.props.accessibilityLabel === 'string' &&
      node.props.accessibilityLabel.startsWith('Fecha '),
  );
}

function flattenStyleWidth(style: unknown): number | undefined {
  const entries = Array.isArray(style) ? style : [style];
  for (const entry of entries) {
    if (entry && typeof entry === 'object' && 'width' in entry) {
      const width = (entry as { width?: unknown }).width;
      if (typeof width === 'number') return width;
    }
  }
  return undefined;
}

describe('AttendanceScreen (diseño visual, issue #17)', () => {
  it('muestra el título visual ASISTENCIA', () => {
    const renderer = renderScreen();
    const texts = renderer.root
      .findAllByType(Text)
      .map((node) => node.props.children);
    expect(texts).toContain('ASISTENCIA');
  });

  it('renderiza exactamente cinco cabeceras de fecha', () => {
    const renderer = renderScreen();
    expect(findDateCells(renderer)).toHaveLength(ATTENDANCE_DATE_COUNT);
  });

  it('dimensiona las celdas para ver tres columnas junto a la columna fija', () => {
    const renderer = renderScreen();
    const windowWidth = Dimensions.get('window').width;
    const expectedWidth = computeDateCellWidth(
      windowWidth - AVATAR_COLUMN_WIDTH,
    );
    for (const cell of findDateCells(renderer)) {
      expect(flattenStyleWidth(cell.props.style)).toBe(expectedWidth);
    }
  });

  it('mantiene la columna de avatares fuera del scroll horizontal de celdas', () => {
    const renderer = renderScreen();
    const avatarColumn = findCompositeByTestId(
      renderer,
      View,
      'attendance-avatar-column',
    );
    expect(avatarColumn.findAllByType(StudentAvatar)).toHaveLength(
      MOCK_STUDENTS.length,
    );

    const cellsScroll = findCompositeByTestId(
      renderer,
      ScrollView,
      'attendance-cells-scroll',
    );
    // La foto queda fija: ningún avatar vive dentro del scroll de celdas.
    expect(cellsScroll.findAllByType(StudentAvatar)).toHaveLength(0);
  });

  it('renderiza un botón circular por alumno y fecha en la matriz', () => {
    const renderer = renderScreen();
    expect(renderer.root.findAllByType(CircularStatusButton)).toHaveLength(
      MOCK_STUDENTS.length * ATTENDANCE_DATE_COUNT,
    );
  });

  it('sincroniza el scroll horizontal: las celdas conducen y la cabecera sigue fija', () => {
    const renderer = renderScreen();
    const datesScroll = findCompositeByTestId(
      renderer,
      ScrollView,
      'attendance-dates-scroll',
    );
    const cellsScroll = findCompositeByTestId(
      renderer,
      ScrollView,
      'attendance-cells-scroll',
    );
    // La cabecera no se desplaza sola: la arrastra el onScroll de las celdas.
    expect(datesScroll.props.scrollEnabled).toBe(false);
    expect(typeof cellsScroll.props.onScroll).toBe('function');
    expect(cellsScroll.props.horizontal).toBe(true);
  });

  it('el cuerpo vertical contiene la columna de avatares y el scroll de celdas', () => {
    const renderer = renderScreen();
    const bodyScroll = findCompositeByTestId(
      renderer,
      ScrollView,
      'attendance-body-scroll',
    );
    expect(
      bodyScroll.findAll(
        (node) =>
          node.type === View &&
          node.props.testID === 'attendance-avatar-column',
      ),
    ).toHaveLength(1);
    expect(
      bodyScroll.findAll(
        (node) =>
          node.type === ScrollView &&
          node.props.testID === 'attendance-cells-scroll',
      ),
    ).toHaveLength(1);
    // La cabecera de fechas queda fuera del scroll vertical (fija).
    expect(
      bodyScroll.findAll(
        (node) =>
          node.type === ScrollView &&
          node.props.testID === 'attendance-dates-scroll',
      ),
    ).toHaveLength(0);
  });

  it('los botones informan de alumno, fecha y estado sin persistir cambios', () => {
    const renderer = renderScreen();
    const cellsScroll = findCompositeByTestId(
      renderer,
      ScrollView,
      'attendance-cells-scroll',
    );
    const buttons = cellsScroll.findAllByType(CircularStatusButton);
    const labels = buttons.map(
      (button) => button.props.accessibilityLabel as string,
    );
    expect(
      labels.some(
        (label) =>
          label.includes(MOCK_STUDENTS[0]!.name) &&
          /(Asistido|No asistido|Tarde|Sin marcar)/.test(label),
      ),
    ).toBe(true);
  });

  it('los avatares se apoyan en el contenedor de fila esperado', () => {
    const renderer = renderScreen();
    const avatarColumn = findCompositeByTestId(
      renderer,
      View,
      'attendance-avatar-column',
    );
    const avatarCells = avatarColumn.findAllByType(View);
    expect(avatarCells.length).toBeGreaterThanOrEqual(MOCK_STUDENTS.length);
  });

  it('no monta ScrollViews anidados inesperados fuera del contrato visual', () => {
    const renderer = renderScreen();
    const scrolls = renderer.root.findAllByType(ScrollView);
    const testIds = scrolls.map((scroll) => scroll.props.testID);
    expect(testIds.sort()).toEqual([
      'attendance-body-scroll',
      'attendance-cells-scroll',
      'attendance-dates-scroll',
    ]);
  });
});
