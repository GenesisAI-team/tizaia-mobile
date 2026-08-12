import { StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../theme/designTokens';

type ScreenTitleProps = {
  children: string;
};

export function ScreenTitle({ children }: ScreenTitleProps): React.JSX.Element {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    paddingVertical: spacing.md,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
