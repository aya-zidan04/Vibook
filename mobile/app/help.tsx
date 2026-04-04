import { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { openSupportEmail } from '@/utils/supportEmail';
import { radii, spacing, typography, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_IDS = ['help.q1', 'help.q2', 'help.q3', 'help.q4', 'help.q5', 'help.q6'] as const;

function AnswerWithHighlights({ text }: { text: string }) {
  const colors = useThemeColors();
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={[typography.body, { color: colors.textSecondary }]}>
      {parts.map((part, i) => {
        const m = /^\*\*([^*]+)\*\*$/.exec(part);
        if (m) {
          return (
            <Text key={i} style={{ fontWeight: '700', color: colors.primary }}>
              {m[1]}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export default function HelpScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <Screen scroll contentStyle={styles.pad} header={<DetailHeader title={t('help.title')} />}>
      <AppText variant="body" color="textSecondary" style={styles.intro}>
        {t('help.intro')}
      </AppText>

      <View style={styles.accordion}>
        {FAQ_IDS.map((qKey, index) => {
          const aKey = qKey.replace('.q', '.a') as `help.a${number}`;
          const expanded = openId === qKey;
          const isLast = index === FAQ_IDS.length - 1;
          return (
            <View key={qKey} style={[styles.faqItem, !isLast && styles.faqItemDivider]}>
              <Pressable
                onPress={() => toggle(qKey)}
                style={({ pressed }) => [styles.faqHeader, pressed && styles.faqHeaderPressed]}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <AppText variant="bodyMedium" color="text" style={styles.faqQuestion}>
                  {t(qKey)}
                </AppText>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.textMuted}
                  style={styles.faqChevron}
                />
              </Pressable>
              {expanded ? (
                <View style={styles.faqAnswer}>
                  <AnswerWithHighlights text={t(aKey)} />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.supportBlock}>
        <PrimaryButton
          title={t('help.contactCta')}
          onPress={() => void openSupportEmail('Vibook — Help')}
          style={styles.cta}
        />
        <AppText variant="caption" color="textMuted" style={styles.contactFooter}>
          {t('help.contactFooter')}
        </AppText>
      </View>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: {
      paddingTop: spacing.md,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    intro: {
      lineHeight: 20,
      marginBottom: -spacing.xs,
    },
    accordion: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    faqItem: {
      paddingHorizontal: spacing.md,
    },
    faqItemDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    faqHeaderPressed: {
      opacity: 0.85,
    },
    faqQuestion: {
      flex: 1,
      lineHeight: 22,
    },
    faqChevron: {
      flexShrink: 0,
    },
    faqAnswer: {
      paddingBottom: spacing.md,
      paddingTop: 0,
    },
    supportBlock: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    cta: {
      alignSelf: 'stretch',
      width: '100%',
    },
    contactFooter: {
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: spacing.md,
    },
  });
}
