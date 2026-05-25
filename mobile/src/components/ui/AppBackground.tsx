import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ViewStyle } from 'react-native';
import { APP_BACKGROUND_COLORS } from '@/theme/appBackground';

type Props = {
  children?: ReactNode;
  style?: ViewStyle;
};

export function AppBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[...APP_BACKGROUND_COLORS]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { APP_BACKGROUND_COLORS, APP_BACKGROUND_BASE } from '@/theme/appBackground';
