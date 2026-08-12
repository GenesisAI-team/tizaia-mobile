import { useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors, radius, spacing } from '../theme/designTokens';
import { StatusCircleButton } from './StatusCircleButton';
import { StudentAvatar } from './StudentAvatar';

export type MatrixBoardColumn = {
  id: string;
  label: string;
};

export type MatrixBoardRow = {
  id: string;
  studentName: string;
};

type MatrixBoardProps = {
  actionAccessibilityLabel: (
    row: MatrixBoardRow,
    column: MatrixBoardColumn,
  ) => string;
  columns: MatrixBoardColumn[];
  rows: MatrixBoardRow[];
};

const COLUMN_WIDTH = 88;
const AVATAR_COLUMN_WIDTH = 72;
const VISIBLE_COLUMNS = 3;

/**
 * Matriz visual reutilizable para Asistencia/Tareas: avatar fijo, cabecera y
 * filas con scroll horizontal sincronizado. Solo presentación y datos mock.
 */
export function MatrixBoard({
  actionAccessibilityLabel,
  columns,
  rows,
}: MatrixBoardProps): React.JSX.Element {
  const headerScrollRef = useRef<ScrollView | null>(null);
  const rowScrollRefs = useRef(new Map<string, ScrollView>());
  const syncingRef = useRef(false);
  const [pressedCells, setPressedCells] = useState<Record<string, boolean>>({});

  const syncHorizontalScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
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
  };

  const toggleCell = (cellId: string): void => {
    setPressedCells((current) => ({
      ...current,
      [cellId]: !current[cellId],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarSpacer} />
        <ScrollView
          horizontal
          onScroll={syncHorizontalScroll}
          ref={headerScrollRef}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator
          style={styles.horizontalScroll}
        >
          {columns.map((column) => (
            <View key={column.id} style={styles.columnCell}>
              <Text numberOfLines={1} style={styles.columnLabel}>
                {column.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={rows}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(row) => row.id}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            <View style={styles.avatarCell}>
              <StudentAvatar
                accessibilityLabel={`Foto de ${row.studentName}`}
                initials={row.studentName.slice(0, 2).toUpperCase()}
              />
            </View>
            <ScrollView
              horizontal
              onScroll={syncHorizontalScroll}
              ref={(scrollView) => {
                if (scrollView) rowScrollRefs.current.set(row.id, scrollView);
                else rowScrollRefs.current.delete(row.id);
              }}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {columns.map((column) => {
                const cellId = `${row.id}:${column.id}`;
                const isPressed = pressedCells[cellId] ?? false;
                return (
                  <View key={column.id} style={styles.columnCell}>
                    <StatusCircleButton
                      accessibilityLabel={actionAccessibilityLabel(row, column)}
                      color={
                        isPressed ? colors.surfaceMuted : colors.background
                      }
                      onPress={() => toggleCell(cellId)}
                      testID={`matrix-cell-${cellId}`}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        showsVerticalScrollIndicator
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
  columnLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    maxWidth: COLUMN_WIDTH - spacing.sm,
    textAlign: 'center',
  },
  container: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    maxWidth: 520,
    overflow: 'hidden',
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
  },
  horizontalScroll: {
    maxWidth: COLUMN_WIDTH * VISIBLE_COLUMNS,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 72,
    paddingVertical: spacing.sm,
  },
  rows: {
    flex: 1,
  },
  separator: {
    backgroundColor: colors.border,
    height: 1,
    marginLeft: AVATAR_COLUMN_WIDTH,
  },
});
