import { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing, useThemeColors } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_IDS = ['help.q1', 'help.q2', 'help.q3', 'help.q4'] as const;

function AnswerWithHighlights({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <AppText variant="body" color="textSecondary">
      {parts.map((part, i) => {
        const m = /^\*\*([^*]+)\*\*$/.exec(part);
        if (m) {
          return (
            <AppText key={i} variant="body-em" color="primary">
              {m[1]}
            </AppText>
          );
        }
        return (
          <AppText key={i} variant="body" color="textSecondary">
            {part}
          </AppText>
        );
      })}
    </AppText>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <PremiumScreen title={t('help.title')}>
      <AppText variant="body" color="textSecondary">
        {t('help.intro')}
      </AppText>

      <View style={styles.faqCard}>
        {FAQ_IDS.map((qKey, index) => {
          const aKey = qKey.replace('.q', '.a') as `help.a${number}`;
          const expanded = openId === qKey;
          const isLast = index === FAQ_IDS.length - 1;
          return (
            <View
              key={qKey}
              style={{
                paddingHorizontal: spacing.md,
                borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }}
            >
              <Pressable
                onPress={() => toggle(qKey)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  gap: spacing.sm,
                  opacity: pressed ? 0.85 : 1,
                })}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { width: 44, height: 44, borderRadius: 14 },
                  ]}
                >
                  <Ionicons name="help-circle-outline" size={22} color={colors.primaryLight} />
                </View>
                <AppText variant="body-em" color="text" style={{ flex: 1 }}>
                  {t(qKey)}
                </AppText>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.chevron}
                />
              </Pressable>
              {expanded ? (
                <View style={{ paddingBottom: spacing.md, paddingStart: 44 + spacing.md }}>
                  <AnswerWithHighlights text={t(aKey)} />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <PrimaryButton
        title={t('help.reportProblem')}
        onPress={() => router.push('/report-problem')}
        style={styles.sheetButton}
      />
    </PremiumScreen>
  );
}
