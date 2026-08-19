import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  Fab,
  GlassCard,
  ProfileCard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
} from '../../../shared/components';
import { MOCK_TEACHER_PROFILE } from '../../../shared/mock/teacher';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import { schoolRepository } from '../../../infrastructure/in-memory';

/**
 * Clases definitiva (DESIGN.md §5.7, frame n1931 de Tizaia.op): ProfileCard
 * docente, lista de clases (grupo + materia), FAB de alta y TabBar.
 * La selección de clase activa y los datos reales quedan para la fase
 * funcional.
 */
export function ClassesScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();
  const classes = schoolRepository.getClasses();

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>CLASES</ScreenTitle>
      </View>
      <View style={styles.profile}>
        <ProfileCard
          email={MOCK_TEACHER_PROFILE.email}
          initials={MOCK_TEACHER_PROFILE.initials}
          label={MOCK_TEACHER_PROFILE.label}
          name={MOCK_TEACHER_PROFILE.name}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={classes}
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
