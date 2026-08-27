import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  ClassListSkeleton,
  DataStateView,
  Fab,
  GlassCard,
  ProfileCard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
} from '../../../shared/components';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import { useSchoolRepository } from '../../../app/AppDependenciesProvider';
import { useSchoolResource } from '../../../shared/state/schoolDataProvider';
import { getNameInitials } from '../../../domain/school/models';

/**
 * Clases definitiva (DESIGN.md §5.7, frame n1931 de Tizaia.op): ProfileCard
 * docente real (`/v1/me`), lista de clases desde la API (#67) con estados de
 * carga/vacío/error y reintento, FAB de alta y TabBar.
 */
export function ClassesScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();

  const resource = useSchoolResource(async () => {
    const [me, classes] = await Promise.all([
      schoolRepository.getMe(),
      schoolRepository.getClasses(),
    ]);
    return { teacher: me.teacher, activeClass: me.activeClass, classes };
  }, []);

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>CLASES</ScreenTitle>
      </View>
      <DataStateView
        emptyMessage="No hay clases disponibles."
        onRetry={resource.reload}
        skeleton={<ClassListSkeleton />}
        state={resource.state}
      />
      {resource.state.status === 'success' && (
        <>
          <View style={styles.profile}>
            <ProfileCard
              email={resource.state.data.teacher.email}
              initials={getNameInitials(resource.state.data.teacher.name)}
              label="CUENTA DOCENTE"
              name={resource.state.data.teacher.name}
            />
          </View>
          <FlatList
            contentContainerStyle={styles.listContent}
            data={resource.state.data.classes}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GlassCard cornerRadius={22} style={styles.classCard}>
                <Text numberOfLines={1} style={styles.groupName}>
                  {item.groupName}
                </Text>
                <Text numberOfLines={1} style={styles.subject}>
                  {item.subject}
                </Text>
              </GlassCard>
            )}
            style={styles.list}
          />
        </>
      )}
      <Fab accessibilityLabel="Añadir clase" style={styles.fab} />
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  classCard: {
    height: dp(114),
    justifyContent: 'center',
    paddingHorizontal: dp(32),
  },
  fab: {
    bottom: dp(141),
    position: 'absolute',
    right: dp(35),
  },
  groupName: {
    color: tizaiaColors.ink,
    fontSize: dp(34),
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: dp(280),
    paddingHorizontal: dp(40),
  },
  profile: {
    marginBottom: dp(24),
    paddingHorizontal: dp(36),
  },
  separator: {
    height: dp(12),
  },
  subject: {
    color: tizaiaColors.ink,
    fontSize: dp(24),
    marginTop: dp(10),
  },
  tabBar: {
    alignSelf: 'center',
    marginBottom: dp(24),
    marginTop: dp(16),
  },
  titleBlock: {
    marginBottom: dp(24),
    marginTop: dp(24),
  },
});
