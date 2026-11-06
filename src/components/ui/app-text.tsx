import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/theme-provider';
import { fonts } from '@/theme/tokens';

type Variant = 'hero' | 'title' | 'subtitle' | 'body' | 'bodyStrong' | 'caption' | 'label';

const variants: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 30 },
  subtitle: { fontFamily: fonts.bodySemiBold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
};

type Props = TextProps & {
  variant?: Variant;
  tone?: 'primary' | 'secondary' | 'accent' | 'onAccent';
};

export function AppText({ variant = 'body', tone = 'primary', style, ...rest }: Props) {
  const { colors } = useTheme();
  const color = {
    primary: colors.text,
    secondary: colors.textSecondary,
    accent: colors.accent,
    onAccent: colors.accentText,
  }[tone];

  return <Text style={[variants[variant], { color }, style]} {...rest} />;
}
