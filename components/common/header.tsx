import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { screenTopPadding } from "../../lib/screen-top-padding";
import { colors } from "../../constants/colors";
import { FONT_FAMILIES, textBody, textHeading } from "../../constants/typography";
import type { TextStyle } from "react-native";

export type HeaderProps = {
  /** Основной заголовок экрана */
  title: string;
  /** Подзаголовок под заголовком */
  subtitle?: string;
  /** Слот слева (например «Назад») */
  leading?: ReactNode;
  /** Элементы справа от заголовка (иконки действий и т.п.) */
  trailing?: ReactNode;
  /**
   * `inline` — leading в одной строке с заголовком (по умолчанию).
   * `below` — leading под заголовком (и под подзаголовком, если он есть).
   */
  leadingPlacement?: "inline" | "below";
  /** Цвет заголовка (по умолчанию — primary) */
  titleColor?: string;
  /** Цвет подзаголовка (по умолчанию — subtext) */
  subtitleColor?: string;
  /** Размер заголовка (по умолчанию — 28) */
  titleFontSize?: number;
  /** Толщина заголовка */
  titleFontWeight?: TextStyle["fontWeight"];
  /** Размер подзаголовка (по умолчанию — 18) */
  subtitleFontSize?: number;
  /** Отступ между заголовком и подзаголовком (по умолчанию — 8) */
  subtitleMarginTop?: number;
  /** Нижний отступ блока заголовка (по умолчанию — 8) */
  containerPaddingBottom?: number;
};

const SIDE_BAND = 56;

export default function Header({
  title,
  subtitle,
  leading,
  trailing,
  leadingPlacement = "inline",
  titleColor,
  subtitleColor,
  titleFontSize,
  titleFontWeight,
  subtitleFontSize,
  subtitleMarginTop,
  containerPaddingBottom = 8,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const titleStyle = [
    styles.title,
    titleColor ? { color: titleColor } : null,
    titleFontSize != null ? { fontSize: titleFontSize } : null,
    textHeading,
    titleFontWeight != null
      ? {
          fontWeight: titleFontWeight,
          fontFamily:
            titleFontWeight === "500" || titleFontWeight === 500
              ? FONT_FAMILIES.medium
              : FONT_FAMILIES.regular,
        }
      : null,
  ];
  const subtitleStyle = [
    styles.subtitle,
    subtitleColor ? { color: subtitleColor } : null,
    subtitleFontSize != null ? { fontSize: subtitleFontSize } : null,
    subtitleMarginTop != null ? { marginTop: subtitleMarginTop } : null,
  ];

  const bandSpacer = (
    <View style={styles.sideBand}>
      <View style={[styles.sideBandInner, styles.sideBandSpacer]} />
    </View>
  );

  const leadingBelow = leadingPlacement === "below" && leading;

  let titleBlock: ReactNode;
  if (!leading && !trailing) {
    titleBlock = <Text style={titleStyle}>{title}</Text>;
  } else if (!leading && trailing) {
    titleBlock = (
      <View style={styles.titleRow}>
        <Text style={[titleStyle, styles.titleFlex]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.trailing}>{trailing}</View>
      </View>
    );
  } else if (leadingBelow) {
    titleBlock = trailing ? (
      <View style={styles.titleRow}>
        <Text style={[titleStyle, styles.titleFlex]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.trailing}>{trailing}</View>
      </View>
    ) : (
      <Text style={titleStyle}>{title}</Text>
    );
  } else {
    titleBlock = (
      <View style={styles.titleRow}>
        <View style={styles.sideBand}>
          <View style={styles.sideBandInner}>{leading}</View>
        </View>
        <Text
          style={[titleStyle, styles.titleFlex, styles.titleInThreeColumn]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {trailing ? (
          <View style={styles.sideBand}>
            <View style={[styles.sideBandInner, styles.sideBandTrailing]}>
              {trailing}
            </View>
          </View>
        ) : (
          bandSpacer
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: screenTopPadding(insets.top),
          paddingBottom: containerPaddingBottom,
        },
      ]}
    >
      {titleBlock}
      {subtitle ? (
        <Text style={subtitleStyle}>{subtitle}</Text>
      ) : null}
      {leadingBelow ? (
        <View style={styles.leadingBelowRow}>{leading}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleFlex: {
    flex: 1,
    minWidth: 0,
  },
  titleInThreeColumn: {
    textAlign: "center",
  },
  sideBand: {
    width: SIDE_BAND,
    minWidth: SIDE_BAND,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  sideBandInner: {
    minWidth: SIDE_BAND,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideBandTrailing: {
    alignItems: "flex-end",
  },
  sideBandSpacer: {
    minHeight: 1,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  leadingBelowRow: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    ...textHeading,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    ...textBody,
    color: colors.subtext,
  },
});
