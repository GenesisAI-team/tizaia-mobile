import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';
import { MailPlusIcon } from './icons/MailPlusIcon';

type FabProps = {
  accessibilityLabel: string;
  /** `plus` (alta genérica) o `compose` (redactar mail, con sombra). */
  icon?: 'plus' | 'compose';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
};

/**
 * Botón flotante circular de acción (DESIGN.md §4.6/§4.7): 120×120 #403034.
 * La pantalla lo posiciona mediante `style`.
 */
export function Fab({
  accessibilityLabel,
  icon = 'plus',
  onPress,
  style,
  testID,
}: FabProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        icon === 'compose' && styles.composeShadow,
        pressed && styles.pressed,
        style,
      ]}
      testID={testID}
    >
      {icon === 'compose' ? (
        <MailPlusIcon color={tizaiaColors.white} size={26} />
      ) : (
        <Text style={styles.plus}>+</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(60),
    height: dp(120),
    justifyContent: 'center',
    width: dp(120),
  },
  composeShadow: {
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  plus: {
    color: tizaiaColors.white,
    fontSize: dp(64),
    fontWeight: '300',
    lineHeight: dp(78),
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
