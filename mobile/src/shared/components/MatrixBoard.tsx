import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ListRenderItemInfo,
} from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';
import { StatusCell, type StatusCellState } from './StatusCell';
import { StudentAvatar } from './StudentAvatar';

export type MatrixBoardColumn = {
  id: string;
  label: string;
  /** Segunda línea de la cabecera (p. ej. la fecha `19/08`). */
  secondaryLabel?: string;
};

export type MatrixBoardRow = {
  id: string;
  studentName: string;
  /** Iniciales explícitas; por defecto se derivan de `studentName`. */
  initials?: string;
};

type MatrixBoardProps = {
  actionAccessibilityLabel: (
    row: MatrixBoardRow,
    column: MatrixBoardColumn,
  ) => string;
  /** Estados por celda (`${row.id}:${column.id}`); por defecto pending. */
  cellStates?: Record<string, StatusCellState>;
  columns: MatrixBoardColumn[];
  /** Pulsación de celda controlada por la pantalla (persistencia en API). */
  onCellPress?: (row: MatrixBoardRow, column: MatrixBoardColumn) => void;
  /** En Tareas el pendiente no tiene fondo (DESIGN.md §4.8). */
  pendingTransparent?: boolean;
  rows: MatrixBoardRow[];
  /** Tareas muestra el nombre bajo el avatar (DESIGN.md §5.4). */
  showRowNames?: boolean;
};

const AVATAR_COLUMN_WIDTH = dp(115);
const COLUMN_WIDTH = dp(121);
const MAX_VISIBLE_COLUMNS = 5;

type MatrixBoardRowItemProps = {
  actionAccessibilityLabel: MatrixBoardProps['actionAccessibilityLabel'];
  cellStates?: MatrixBoardProps['cellStates'];
  columns: MatrixBoardColumn[];
  onCellPress: MatrixBoardProps['onCellPress'];
  pendingTransparent: boolean;
  row: MatrixBoardRow;
  rowScrollRefs: RefObject<Map<string, ScrollView>>;
  showRowNames: boolean;
  syncHorizontalScroll: (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => void;
  visibleColumnsWidth: number;
};

const getCellState = (
  cellStates: MatrixBoardProps['cellStates'],
  cellId: string,
): StatusCellState => cellStates?.[cellId] ?? 'pending';

const getMatrixBoardRowKey = (row: MatrixBoardRow): string => row.id;

const areMatrixBoardRowItemPropsEqual = (
  previous: MatrixBoardRowItemProps,
  next: MatrixBoardRowItemProps,
): boolean => {
  if (
    previous.actionAccessibilityLabel !== next.actionAccessibilityLabel ||
    previous.onCellPress !== next.onCellPress ||
    previous.pendingTransparent !== next.pendingTransparent ||
    previous.row.id !== next.row.id ||
    previous.row.studentName !== next.row.studentName ||
    previous.row.initials !== next.row.initials ||
    previous.rowScrollRefs !== next.rowScrollRefs ||
    previous.showRowNames !== next.showRowNames ||
    previous.syncHorizontalScroll !== next.syncHorizontalScroll ||
    previous.visibleColumnsWidth !== next.visibleColumnsWidth ||
    previous.columns.length !== next.columns.length
  ) {
    return false;
  }

  return previous.columns.every((previousColumn, index) => {
    const nextColumn = next.columns[index];
    if (
      nextColumn === undefined ||
      previousColumn.id !== nextColumn.id ||
      previousColumn.label !== nextColumn.label ||
      previousColumn.secondaryLabel !== nextColumn.secondaryLabel
    ) {
      return false;
    }

    const previousCellId = `${previous.row.id}:${previousColumn.id}`;
    const nextCellId = `${next.row.id}:${nextColumn.id}`;
    return (
      getCellState(previous.cellStates, previousCellId) ===
      getCellState(next.cellStates, nextCellId)
    );
  });
};

const MatrixBoardRowItem = memo(function MatrixBoardRowItem({
  actionAccessibilityLabel,
  cellStates,
  columns,
  onCellPress,
  pendingTransparent,
  row,
  rowScrollRefs,
  showRowNames,
  syncHorizontalScroll,
  visibleColumnsWidth,
}: MatrixBoardRowItemProps): React.JSX.Element {
  const setRowScrollRef = (scrollView: ScrollView | null): void => {
    if (scrollView) rowScrollRefs.current.set(row.id, scrollView);
    else rowScrollRefs.current.delete(row.id);
  };

  return (
    <View style={styles.row}>
      <View style={styles.avatarCell}>
        <StudentAvatar
          accessibilityLabel={`Foto de ${row.studentName}`}
          initials={row.initials ?? row.studentName.slice(0, 2).toUpperCase()}
          size={showRowNames ? dp(66) : dp(92)}
        />
        {showRowNames && (
          <Text numberOfLines={1} style={styles.rowName}>
            {row.studentName}
          </Text>
        )}
      </View>
      <ScrollView
        horizontal
        onScroll={syncHorizontalScroll}
        ref={setRowScrollRef}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={[styles.horizontalScroll, { maxWidth: visibleColumnsWidth }]}
      >
        {columns.map((column) => {
          const cellId = `${row.id}:${column.id}`;
          return (
            <View key={column.id} style={styles.columnCell}>
              <StatusCell
                accessibilityLabel={actionAccessibilityLabel(row, column)}
                onPress={() => onCellPress?.(row, column)}
                pendingTransparent={pendingTransparent}
                state={getCellState(cellStates, cellId)}
                testID={`matrix-cell-${cellId}`}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}, areMatrixBoardRowItemPropsEqual);

/** Ciclo visual local de estado al pulsar una celda (sin lógica de negocio). */
export const getNextStatusCellState = (
  state: StatusCellState,
): StatusCellState => {
  if (state === 'pending') return 'done';
  if (state === 'done') return 'undone';
  return 'pending';
};

/**
 * Matriz visual de Asistencia/Tareas (DESIGN.md §4.8, §5.2, §5.4): columna de
 * avatar fija, cabeceras melocotón y celdas de estado; scroll horizontal
 * sincronizado cabecera/filas y scroll vertical de alumnos.
 * Componente controlado: los estados llegan por `cellStates` y la pulsación
 * se delega en `onCellPress` (la pantalla decide persistencia y rollback).
 */
export function MatrixBoard({
  actionAccessibilityLabel,
  cellStates,
  columns,
  onCellPress,
  pendingTransparent = false,
  rows,
  showRowNames = false,
}: MatrixBoardProps): React.JSX.Element {
  const headerScrollRef = useRef<ScrollView | null>(null);
  const rowScrollRefs = useRef(new Map<string, ScrollView>());
  const syncingRef = useRef(false);
  const onCellPressRef = useRef(onCellPress);
  const { width: windowWidth } = useWindowDimensions();

  useLayoutEffect(() => {
    onCellPressRef.current = onCellPress;
  }, [onCellPress]);

  const visibleColumnsWidth = Math.min(
    COLUMN_WIDTH * MAX_VISIBLE_COLUMNS,
    windowWidth - AVATAR_COLUMN_WIDTH - dp(36),
  );

  const syncHorizontalScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      const offsetX = event.nativeEvent.contentOffset.x;
      headerScrollRef.current?.scrollTo({ animated: false, x: offsetX });
      rowScrollRefs.current.forEach((scrollView) => {
        scrollView.scrollTo({ animated: false, x: offsetX });
      });
      requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    },
    [],
  );

  const handleCellPress = useCallback(
    (row: MatrixBoardRow, column: MatrixBoardColumn): void => {
      onCellPressRef.current?.(row, column);
    },
    [],
  );

  const renderRow = useCallback(
    ({ item: row }: ListRenderItemInfo<MatrixBoardRow>) => (
      <MatrixBoardRowItem
        actionAccessibilityLabel={actionAccessibilityLabel}
        cellStates={cellStates}
        columns={columns}
        onCellPress={handleCellPress}
        pendingTransparent={pendingTransparent}
        row={row}
        rowScrollRefs={rowScrollRefs}
        showRowNames={showRowNames}
        syncHorizontalScroll={syncHorizontalScroll}
        visibleColumnsWidth={visibleColumnsWidth}
      />
    ),
    [
      actionAccessibilityLabel,
      cellStates,
      columns,
      handleCellPress,
      pendingTransparent,
      showRowNames,
      syncHorizontalScroll,
      visibleColumnsWidth,
    ],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarSpacer} />
        <ScrollView
          horizontal
          onScroll={syncHorizontalScroll}
          ref={headerScrollRef}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          style={[styles.horizontalScroll, { maxWidth: visibleColumnsWidth }]}
        >
          {columns.map((column) => (
            <View key={column.id} style={styles.columnCell}>
              <View style={styles.headerChip}>
                <Text numberOfLines={1} style={styles.headerLabel}>
                  {column.label}
                </Text>
                {column.secondaryLabel != null && (
                  <Text numberOfLines={1} style={styles.headerSecondaryLabel}>
                    {column.secondaryLabel}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={rows}
        extraData={cellStates}
        keyExtractor={getMatrixBoardRowKey}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        style={styles.rows}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCell: {
    alignItems: 'center',
    width: AVATAR_COLUMN_WIDTH,
  },
  avatarSpacer: {
    width: AVATAR_COLUMN_WIDTH,
  },
  columnCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: COLUMN_WIDTH,
  },
  container: {
    alignSelf: 'center',
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(22),
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  headerChip: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.peach,
    borderRadius: dp(12),
    height: dp(103),
    justifyContent: 'center',
    width: dp(111),
  },
  headerLabel: {
    color: tizaiaColors.ink,
    fontSize: dp(25),
    textAlign: 'center',
  },
  headerSecondaryLabel: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
    fontWeight: '600',
    marginTop: dp(2),
    textAlign: 'center',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: dp(127),
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: dp(127),
  },
  rowName: {
    color: tizaiaColors.ink,
    fontSize: dp(22),
    marginTop: dp(4),
    textAlign: 'center',
  },
  rows: {
    flex: 1,
  },
});
