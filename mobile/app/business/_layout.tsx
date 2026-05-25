import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { fetchMyBusinessProfile } from '@/api/businessProfileApi';
import { nativeStackDrillInTransition } from '@/navigation/transitionPresets';
import { useAppStore } from '@/store/appStore';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { useThemeColors } from '@/theme';

export default function BusinessStackLayout() {
  const colors = useThemeColors();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const syncBusinessApprovalFromApi = useBusinessHubStore((s) => s.syncBusinessApprovalFromApi);
  const [gateReady, setGateReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setGateReady(false);
      void (async () => {
        if (!isAuthenticated) {
          syncBusinessApprovalFromApi(null);
          if (active) setGateReady(true);
          return;
        }
        try {
          const profile = await fetchMyBusinessProfile();
          if (active) syncBusinessApprovalFromApi(profile);
        } catch {
          if (active) syncBusinessApprovalFromApi(undefined);
        } finally {
          if (active) setGateReady(true);
        }
      })();
      return () => {
        active = false;
      };
    }, [isAuthenticated, syncBusinessApprovalFromApi]),
  );

  if (!gateReady) {
    return (
      <View style={[styles.boot, { backgroundColor: 'transparent' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        ...nativeStackDrillInTransition,
      }}
    />
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
