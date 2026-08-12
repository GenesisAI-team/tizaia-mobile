import { Dimensions, Text } from 'react-native';
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { CircularStateButton } from '../../../shared/components/CircularStateButton';
import { StudentAvatar } from '../../../shared/components/StudentAvatar';
import { colors } from '../../../shared/theme';
import {
  MOCK_TASK_STUDENTS,
  MOCK_TASKS,
  type TaskDeliveryVisualState,
} from './tasksMockData';
import { getDeliveryStateColor, getTaskColumnWidth } from './tasksLayout';
import { TasksScreen } from './TasksScreen';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function renderTasks(): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<TasksScreen />);
  });
  return renderer;
}

function findScrollView(
  renderer: ReactTestRenderer,
  testID: string,
): ReactTestInstance {
  return renderer.root.findByProps({ testID });
}

describe('TasksScreen (diseño visual HU-007)', () => {
  it('muestra el título visual TAREAS', async () => {
    const renderer = await renderTasks();
    const headers = renderer.root
      .findAllByType(Text)
      .filter(
        (node) =>
          node.props.accessibilityRole === 'header' &&
          node.props.children === 'TAREAS',
      );
    expect(headers).toHaveLength(1);
  });

  it('la cabecera muestra las cinco tareas recientes de más reciente a más antigua', async () => {
    const renderer = await renderTasks();
    const headerScroll = findScrollView(renderer, 'tasks-header-scroll');
    // Cada celda aparece como compuesto y como host; se conserva la externa.
    const isCell = (node: ReactTestInstance): boolean =>
      typeof node.props.testID === 'string' &&
      node.props.testID.startsWith('tasks-header-cell-');
    const cells = headerScroll.findAll(
      (node) => isCell(node) && !(node.parent && isCell(node.parent)),
    );
    expect(cells).toHaveLength(MOCK_TASKS.length);
    const titles = cells.map(
      (cell) =>
        cell.findAllByType(Text).find((t) => t.props.numberOfLines === 2)?.props
          .children,
    );
    const dates = cells.map((cell) =>
      cell
        .findAllByType(Text)
        .map((t) => t.props.children)
        .find(
          (text) => typeof text === 'string' && /^\d{2}\/\d{2}$/.test(text),
        ),
    );
    expect(titles).toEqual([
      'Examen tema 4',
      'Problemas 5.1-5.4',
      'Dibujo acuarela',
      'Ficha de lectura',
      'Redacción',
    ]);
    expect(dates).toEqual(['10/08', '07/08', '05/08', '03/08', '28/07']);
  });

  it('cada columna usa el ancho que deja exactamente tres tareas visibles', async () => {
    const renderer = await renderTasks();
    const expectedWidth = getTaskColumnWidth(Dimensions.get('window').width);
    const headerScroll = findScrollView(renderer, 'tasks-header-scroll');
    const firstCell = headerScroll.findByProps({
      testID: 'tasks-header-cell-task-5',
    });
    const cellStyle = (firstCell.props.style as unknown[]).flat(Infinity);
    const merged = Object.assign(
      {},
      ...(cellStyle.filter(Boolean) as object[]),
    ) as { width: number };
    expect(merged.width).toBe(expectedWidth);
  });

  it('la foto del alumno queda fuera del scroll horizontal (columna fija)', async () => {
    const renderer = await renderTasks();
    expect(renderer.root.findAllByType(StudentAvatar)).toHaveLength(
      MOCK_TASK_STUDENTS.length,
    );
    for (const student of MOCK_TASK_STUDENTS) {
      const rowScroll = findScrollView(
        renderer,
        `tasks-row-scroll-${student.id}`,
      );
      expect(rowScroll.findAllByType(StudentAvatar)).toHaveLength(0);
    }
  });

  it('la cabecera queda fuera del scroll vertical de alumnos', async () => {
    const renderer = await renderTasks();
    const bodyScroll = findScrollView(renderer, 'tasks-body-scroll');
    expect(
      bodyScroll.findAll((node) => node.props.testID === 'tasks-header-scroll'),
    ).toHaveLength(0);
    expect(bodyScroll.findAllByType(StudentAvatar)).toHaveLength(
      MOCK_TASK_STUDENTS.length,
    );
  });

  it('el scroll horizontal de una fila se sincroniza con cabecera y demás filas', async () => {
    const renderer = await renderTasks();
    const headerScroll = findScrollView(renderer, 'tasks-header-scroll');
    const sourceRow = findScrollView(renderer, 'tasks-row-scroll-student-1');
    // El mock de ScrollView comparte un único scrollTo (en el prototipo);
    // espiarlo permite contar los scrollTo programáticos del grupo.
    const scrollToSpy = jest.spyOn(headerScroll.instance, 'scrollTo');
    scrollToSpy.mockClear();

    await act(async () => {
      sourceRow.props.onScroll({
        nativeEvent: { contentOffset: { x: 120, y: 0 } },
      });
    });

    // 9 scrolls registrados (cabecera + 8 filas); se desplazan todos salvo
    // la fila origen. La exclusión por destino se cubre en tasksLayout.test.
    expect(scrollToSpy).toHaveBeenCalledTimes(MOCK_TASK_STUDENTS.length);
    expect(scrollToSpy).toHaveBeenCalledWith({ x: 120, animated: false });
  });

  it('el scroll horizontal de la cabecera también arrastra las filas', async () => {
    const renderer = await renderTasks();
    const headerScroll = findScrollView(renderer, 'tasks-header-scroll');
    const scrollToSpy = jest.spyOn(headerScroll.instance, 'scrollTo');
    scrollToSpy.mockClear();

    await act(async () => {
      headerScroll.props.onScroll({
        nativeEvent: { contentOffset: { x: 75, y: 0 } },
      });
    });

    expect(scrollToSpy).toHaveBeenCalledTimes(MOCK_TASK_STUDENTS.length);
    expect(scrollToSpy).toHaveBeenCalledWith({ x: 75, animated: false });
  });

  it('cada alumno tiene un botón circular por tarea con el color de su estado mock', async () => {
    const renderer = await renderTasks();
    const buttons = renderer.root.findAllByType(CircularStateButton);
    expect(buttons).toHaveLength(MOCK_TASK_STUDENTS.length * MOCK_TASKS.length);

    const expected: [string, string, TaskDeliveryVisualState][] = [
      ['student-1', 'task-3', 'notDelivered'],
      ['student-1', 'task-5', 'delivered'],
      ['student-8', 'task-2', 'delivered'],
    ];
    for (const [studentId, taskId, state] of expected) {
      const button = buttons.find(
        (b) => b.props.testID === `tasks-cell-${studentId}-${taskId}`,
      );
      expect(button).toBeTruthy();
      expect(button!.props.color).toBe(getDeliveryStateColor(state));
    }
  });

  it('los botones son pulsables pero no alternan su estado visual', async () => {
    const renderer = await renderTasks();
    const findButton = () =>
      renderer.root
        .findAllByType(CircularStateButton)
        .find((b) => b.props.testID === 'tasks-cell-student-2-task-5')!;
    const colorBefore = findButton().props.color;
    expect(colorBefore).toBe(colors.danger);

    const pressable = renderer.root
      .findAll(
        (node) =>
          node.props.testID === 'tasks-cell-student-2-task-5' &&
          typeof node.props.onPress === 'function',
      )
      .at(0)!;
    await act(async () => {
      pressable.props.onPress();
    });

    expect(findButton().props.color).toBe(colorBefore);
  });
});
