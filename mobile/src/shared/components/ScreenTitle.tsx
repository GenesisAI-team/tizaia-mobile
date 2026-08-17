import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { dp, tizaiaColors, tizaiaTypography } from '../theme/tizaiaTheme';

type ScreenTitleProps = {
  children: string;
  /** `screen` (48px) en principales; `form` (42px) en formularios/detalle. */
  variant?: 'screen' | 'form';
};

/**
 * Título de pantalla centrado con subrayado (DESIGN.md §4.3): Arial 48/700
 * (42/700 en formularios) y barra de 4px bajo el texto, ajustada a su ancho.
 */
export function ScreenTitle({
  children,
  variant = 'screen',
}: ScreenTitleProps): React.JSX.Element {
  const [textWidth, setTextWidth] = useState(0);

  const onTextLayout = (event: LayoutChangeEvent): void => {
    setTextWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <Text
        accessibilityRole="header"
        onLayout={onTextLayout}
        style={[styles.title, variant === 'form' && styles.titleForm]}
      >
        {children}
      </Text>
      <View style={[styles.underline, textWidth > 0 && { width: textWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    color: tizaiaColors.ink,
    fontSize: dp(tizaiaTypography.screenTitle.fontSize),
    fontWeight: tizaiaTypography.screenTitle.fontWeight,
    textAlign: 'center',
  },
  titleForm: {
    fontSize: dp(tizaiaTypography.formTitle.fontSize),
  },
  underline: {
    backgroundColor: tizaiaColors.ink,
    borderRadius: dp(2),
    height: dp(4),
    marginTop: dp(2),
  },
});
