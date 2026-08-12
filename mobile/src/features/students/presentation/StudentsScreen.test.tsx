import { act } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { getInitials, StudentAvatar } from './components/StudentAvatar';
import { EyeIcon } from './components/icons/EyeIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { WarningIcon } from './components/icons/WarningIcon';
import { MOCK_STUDENTS } from './mockStudents';
import { StudentsScreen } from './StudentsScreen';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// FlatList (VirtualizedList) programa _updateCellsToRender en un timeout; con
// temporizadores falsos ese setState no se dispara tras el teardown del test.
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

function renderScreen(): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(<StudentsScreen />);
  });
  return renderer;
}

/**
 * Pressable se exporta memoizado; los botones se buscan como componentes
 * compuestos con rol accesible "button", etiqueta y manejador onPress.
 */
function findButtonByLabel(
  renderer: ReactTestRenderer,
  label: string,
): ReactTestInstance {
  const button = renderer.root
    .findAll(
      (node) =>
        typeof node.type !== 'string' &&
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(0);
  if (!button) throw new Error(`Botón no encontrado: ${label}`);
  return button;
}

function findRow(
  renderer: ReactTestRenderer,
  studentId: string,
): ReactTestInstance | null {
  return (
    renderer.root
      .findAllByProps({ testID: `student-row-${studentId}` })
      .at(0) ?? null
  );
}

describe('getInitials', () => {
  it('devuelve la inicial del nombre y del último apellido en mayúsculas', () => {
    expect(getInitials('Lucía García Pérez')).toBe('LP');
    expect(getInitials('mateo fernández')).toBe('MF');
  });

  it('devuelve una única inicial para nombres simples y cadena vacía si no hay nombre', () => {
    expect(getInitials('Sofía')).toBe('S');
    expect(getInitials('   ')).toBe('');
  });
});

describe('StudentsScreen (diseño visual HU-005/HU-006)', () => {
  it('muestra el título ALUMNOS como cabecera accesible', () => {
    const renderer = renderScreen();
    const title = renderer.root.findByProps({ accessibilityRole: 'header' });
    expect(title.props.children).toBe('ALUMNOS');
  });

  it('renderiza la lista vertical con los alumnos mock iniciales', () => {
    const renderer = renderScreen();
    expect(renderer.root.findByProps({ testID: 'students-list' })).toBeTruthy();
    // FlatList renderiza el primer lote; los primeros alumnos deben existir.
    const first = MOCK_STUDENTS[0]!;
    const row = findRow(renderer, first.id);
    expect(row).toBeTruthy();
    expect(row!.findAllByType(Text).map((t) => t.props.children)).toContain(
      first.name,
    );
    expect(row!.findAllByType(StudentAvatar)).toHaveLength(1);
  });

  it('cada fila expone las tres acciones con iconos y etiquetas accesibles', () => {
    const renderer = renderScreen();
    const first = MOCK_STUDENTS[0]!;
    const viewButton = findButtonByLabel(
      renderer,
      `Ver detalle de ${first.name}`,
    );
    const annotationButton = findButtonByLabel(
      renderer,
      `Añadir anotación a ${first.name}`,
    );
    const deleteButton = findButtonByLabel(
      renderer,
      `Eliminar a ${first.name}`,
    );
    expect(viewButton.findAllByType(EyeIcon)).toHaveLength(1);
    expect(annotationButton.findAllByType(WarningIcon)).toHaveLength(1);
    expect(deleteButton.findAllByType(TrashIcon)).toHaveLength(1);
  });

  it('las acciones tienen un área táctil mínima de 48x48', () => {
    const renderer = renderScreen();
    const first = MOCK_STUDENTS[0]!;
    for (const label of [
      `Ver detalle de ${first.name}`,
      `Añadir anotación a ${first.name}`,
      `Eliminar a ${first.name}`,
    ]) {
      const button = findButtonByLabel(renderer, label);
      const style = StyleSheet.flatten(
        typeof button.props.style === 'function'
          ? button.props.style({ pressed: false })
          : button.props.style,
      );
      expect(style.minHeight).toBeGreaterThanOrEqual(48);
      expect(style.minWidth).toBeGreaterThanOrEqual(48);
    }
  });

  it('la papelera elimina solo la fila del estado local, sin tocar al resto', () => {
    const renderer = renderScreen();
    const first = MOCK_STUDENTS[0]!;
    const second = MOCK_STUDENTS[1]!;
    act(() => {
      findButtonByLabel(renderer, `Eliminar a ${first.name}`).props.onPress();
    });
    expect(findRow(renderer, first.id)).toBeNull();
    expect(findRow(renderer, second.id)).toBeTruthy();
    // El fixture permanece intacto: no hay persistencia.
    expect(MOCK_STUDENTS.some((s) => s.id === first.id)).toBe(true);
  });

  it('ojo y warning no modifican la lista (rutas StudentDetail/NewAnnotation pendientes)', () => {
    const renderer = renderScreen();
    const first = MOCK_STUDENTS[0]!;
    act(() => {
      findButtonByLabel(
        renderer,
        `Ver detalle de ${first.name}`,
      ).props.onPress();
      findButtonByLabel(
        renderer,
        `Añadir anotación a ${first.name}`,
      ).props.onPress();
    });
    expect(findRow(renderer, first.id)).toBeTruthy();
  });

  it('muestra el estado vacío cuando se eliminan todas las filas', () => {
    const renderer = renderScreen();
    let deleteButtons = renderer.root.findAll(
      (node) =>
        typeof node.type !== 'string' &&
        node.props.accessibilityRole === 'button' &&
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Eliminar a ') &&
        typeof node.props.onPress === 'function',
    );
    while (deleteButtons.length > 0) {
      act(() => {
        deleteButtons[0]!.props.onPress();
      });
      deleteButtons = renderer.root.findAll(
        (node) =>
          typeof node.type !== 'string' &&
          node.props.accessibilityRole === 'button' &&
          typeof node.props.accessibilityLabel === 'string' &&
          node.props.accessibilityLabel.startsWith('Eliminar a ') &&
          typeof node.props.onPress === 'function',
      );
    }
    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(texts).toContain('No hay alumnos en la lista.');
  });
});
