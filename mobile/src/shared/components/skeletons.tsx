import { StyleSheet, View } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';
import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton';

/**
 * Skeletons semánticos (issue #85, refactor #89): composiciones de `Skeleton*`
 * que imitan la geometría de las tarjetas reales (DESIGN.md, `tizaiaTheme.ts`)
 * para que la primera carga "cargue la estructura" en vez de un spinner genérico.
 *
 * Geometría por pantalla:
 * - Alumnos: tarjeta height 145 (radius 22), avatar 95, botones 76/52/62.
 * - Correo: tarjeta minHeight 170 (radius 22), avatar 98, 3 líneas.
 * - Anotaciones: tarjeta minHeight 150 (radius 22), avatar 90, 3 líneas + 3 acciones.
 * - Clases: ProfileCard 160 (radius 34) + tarjetas de clase height 114 (radius 22).
 * - Tareas/Asistencia: matriz (cabecera 111×103 + filas con avatar 66/92 y celdas 108×88).
 *
 * Los bloques heredan de `Skeleton`: pulso de opacidad con Reanimated, ocultos
 * al lector de pantalla y respetuosos con "reducir movimiento". El contenedor
 * accesible ("Cargando contenido") lo pone `DataStateView`.
 *
 * Regla viewport (#89): los skeletons representan el viewport y la geometría
 * esperada, no el volumen real de registros. Asistencia usa `rows={7}` y
 * Tareas `rows={6}` (valores explícitos por pantalla, KISS) para llenar el
 * área visible sin predecir el número de alumnos ni calcular dinámicamente.
 */

type ListSkeletonProps = {
  /** Número de filas de ejemplo que se muestran durante la carga. */
  rows?: number;
};

/**
 * Perfil de alumno (DESIGN.md §5.6): tarjeta resumen con avatar 96 y
 * secciones de métricas de asistencia/anotaciones/tareas con anillos.
 */
export function StudentProfileSkeleton(): React.JSX.Element {
  const metricSections = 3;
  return (
    <View style={styles.profileList}>
      <View style={styles.profileSectionCard}>
        <View style={styles.summaryRow}>
          <SkeletonCircle size={dp(96)} />
          <View style={styles.summaryBody}>
            <SkeletonText height={dp(34)} width="60%" />
            <SkeletonText height={dp(24)} width="40%" />
            <Skeleton borderRadius={dp(17)} height={dp(34)} width={dp(138)} />
          </View>
        </View>
      </View>
      {Array.from({ length: metricSections }, (_, index) => (
        <View key={index} style={styles.profileSectionCard}>
          <SkeletonText height={dp(22)} width="45%" />
          <View style={styles.metricRow}>
            {[0, 1, 2].map((ring) => (
              <View key={ring} style={styles.metricGroup}>
                <SkeletonCircle size={dp(64)} />
                <SkeletonText height={dp(14)} width="80%" />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function StudentListSkeleton({
  rows = 8,
}: ListSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.studentList}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.studentCard}>
          <SkeletonCircle size={dp(95)} />
          <View style={styles.studentName}>
            <SkeletonText height={dp(38)} width="60%" />
          </View>
          <View style={styles.cardActions}>
            <Skeleton borderRadius={dp(15)} height={dp(55)} width={dp(76)} />
            <Skeleton borderRadius={dp(15)} height={dp(55)} width={dp(52)} />
            <Skeleton borderRadius={dp(15)} height={dp(55)} width={dp(62)} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function MailListSkeleton({
  rows = 6,
}: ListSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.mailList}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.mailCard}>
          <SkeletonCircle size={dp(98)} />
          <View style={styles.mailBody}>
            <SkeletonText height={dp(30)} width="55%" />
            <SkeletonText height={dp(24)} width="85%" />
            <SkeletonText height={dp(20)} width="60%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function AnnotationListSkeleton({
  rows = 8,
}: ListSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.annotationList}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.annotationCard}>
          <SkeletonCircle size={dp(90)} />
          <View style={styles.annotationBody}>
            <SkeletonText height={dp(30)} width="55%" />
            <SkeletonText height={dp(17)} width="40%" />
            <SkeletonText height={dp(20)} width="90%" />
          </View>
          <View style={styles.cardActions}>
            <Skeleton borderRadius={dp(15)} height={dp(55)} width={dp(76)} />
            <Skeleton borderRadius={dp(15)} height={dp(52)} width={dp(52)} />
            <Skeleton borderRadius={dp(26)} height={dp(52)} width={dp(52)} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ClassListSkeleton({
  rows = 4,
}: ListSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.classList}>
      <View style={styles.profileCard}>
        <SkeletonCircle size={dp(108)} />
        <View style={styles.profileBody}>
          <SkeletonText height={dp(14)} width="30%" />
          <SkeletonText height={dp(30)} width="55%" />
          <SkeletonText height={dp(18)} width="75%" />
        </View>
        <Skeleton borderRadius={dp(20)} height={dp(56)} width={dp(64)} />
      </View>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.classCard}>
          <SkeletonText height={dp(34)} width="45%" />
          <SkeletonText height={dp(24)} width="70%" />
        </View>
      ))}
    </View>
  );
}

type BoardSkeletonProps = {
  /** Número de celdas visibles (máx. `MAX_VISIBLE_COLUMNS` de MatrixBoard). */
  columns?: number;
  /** Filas de ejemplo: representan el viewport, no el total real (#89). */
  rows?: number;
  /** Tareas muestra el nombre bajo el avatar; Asistencia no (DESIGN.md §5.4). */
  showRowNames?: boolean;
};

export function BoardSkeleton({
  columns = 4,
  rows = 4,
  showRowNames = false,
}: BoardSkeletonProps): React.JSX.Element {
  const cells = Array.from({ length: columns }, (_, index) => index);
  const students = Array.from({ length: rows }, (_, index) => index);
  return (
    <View style={styles.boardContainer}>
      <View style={styles.boardRow}>
        <View style={styles.boardAvatarCell} />
        {cells.map((index) => (
          <Skeleton
            borderRadius={dp(12)}
            height={dp(103)}
            key={index}
            width={dp(111)}
          />
        ))}
      </View>
      {students.map((index) => (
        <View key={index} style={styles.boardRow}>
          <View style={styles.boardAvatarCell}>
            <SkeletonCircle size={showRowNames ? dp(66) : dp(92)} />
            {showRowNames && <SkeletonText height={dp(22)} width="85%" />}
          </View>
          {cells.map((cellIndex) => (
            <Skeleton
              borderRadius={dp(12)}
              height={dp(88)}
              key={cellIndex}
              width={dp(108)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  annotationBody: {
    flex: 1,
    gap: dp(16),
    marginLeft: dp(26),
    marginRight: dp(12),
  },
  annotationCard: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(22),
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: dp(150),
    paddingHorizontal: dp(24),
    paddingVertical: dp(16),
  },
  annotationList: {
    gap: dp(16),
  },
  boardAvatarCell: {
    alignItems: 'center',
    gap: dp(8),
    justifyContent: 'center',
    width: dp(115),
  },
  boardContainer: {
    alignSelf: 'center',
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(22),
    borderWidth: 1,
    gap: dp(6),
    padding: dp(12),
    width: '100%',
  },
  boardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(10),
    minHeight: dp(127) - dp(24),
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(16),
  },
  classCard: {
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(22),
    borderWidth: 1,
    height: dp(114),
    justifyContent: 'center',
    paddingHorizontal: dp(32),
  },
  classList: {
    gap: dp(12),
  },
  mailBody: {
    flex: 1,
    gap: dp(8),
    marginLeft: dp(22),
  },
  mailCard: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(22),
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: dp(170),
    paddingHorizontal: dp(29),
    paddingVertical: dp(20),
  },
  mailList: {
    gap: dp(28),
  },
  profileBody: {
    flex: 1,
    gap: dp(8),
  },
  profileList: {
    gap: dp(20),
  },
  profileSectionCard: {
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(28),
    borderWidth: 1,
    padding: dp(24),
  },
  metricGroup: {
    alignItems: 'center',
    gap: dp(8),
    width: dp(184),
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dp(16),
  },
  summaryBody: {
    flex: 1,
    gap: dp(10),
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(24),
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardProfile,
    borderColor: tizaiaColors.white,
    borderRadius: dp(34),
    borderWidth: 1,
    flexDirection: 'row',
    gap: dp(34),
    height: dp(160),
    paddingHorizontal: dp(26),
  },
  studentCard: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardGlass,
    borderColor: tizaiaColors.white,
    borderRadius: dp(22),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(145),
    paddingHorizontal: dp(45),
  },
  studentList: {
    gap: dp(31),
  },
  studentName: {
    flex: 1,
    marginLeft: dp(45),
  },
});
