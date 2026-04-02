import type { ViewStyle } from 'react-native';

/**
 * Wrap headers / back rows with this so chevrons & close stay on the **physical left**
 * when the app locale is Arabic (RTL). Screen body can remain RTL.
 */
export const ltrNavigationChrome: ViewStyle = {
  direction: 'ltr',
  width: '100%',
};
