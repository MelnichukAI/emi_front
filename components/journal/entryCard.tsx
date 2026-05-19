import { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  emotion: string;
  text: string;
  date: string;
  /** Без горизонтальных отступов — для встроенных списков (профиль и т.п.) */
  noOuterMargin?: boolean;
  /** Компактная карточка для сетки «плитками» */
  compact?: boolean;
  /** Число строк основного текста (вне compact; по умолчанию 2) */
  bodyLines?: number;
  /** Цвет заголовка карточки (эмоция; по умолчанию text) */
  emotionColor?: string;
  /** Цвет основного текста карточки (по умолчанию textThird) */
  bodyColor?: string;
  /** Дополнительный блок внутри карточки снизу (например, переключатель видимости) */
  footer?: ReactNode;
  /** Нажатие по основному содержимому карточки (футер не входит в зону нажатия). */
  onPress?: () => void;
};

/** Тень «под» карточкой: веб — только boxShadow; iOS — shadow*; Android — elevation. */
const cardDropShadow = Platform.select({
  web: {
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)",
  },
  ios: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  default: {
    elevation: 8,
  },
});

export default function EntryCard({
  emotion,
  text,
  date,
  noOuterMargin,
  compact,
  bodyLines = 2,
  emotionColor,
  bodyColor,
  footer,
  onPress,
}: Props) {
  const emotionTint = emotionColor ? { color: emotionColor } : null;
  const bodyTint = bodyColor ? { color: bodyColor } : null;

  const mainContent = (
    <>
      <View style={styles.header}>
        <Text style={[styles.emotion, emotionTint]} numberOfLines={1}>
          {emotion}
        </Text>
        <Text style={styles.date} numberOfLines={1}>
          {date}
        </Text>
      </View>

      <Text
        style={[styles.text, bodyTint]}
        numberOfLines={compact ? 2 : bodyLines}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </>
  );

  const mainBlock = onPress ? (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.mainPressed}
      accessibilityRole="button"
    >
      {mainContent}
    </Pressable>
  ) : (
    mainContent
  );

  const cardBody = (
    <>
      {mainBlock}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  if (compact) {
    return (
      <View
        style={[
          styles.cardCompactRoot,
          noOuterMargin && styles.cardNoOuterMargin,
        ]}
      >
        {cardBody}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.shadowWrap,
        styles.shadowWrapElevated,
        noOuterMargin && styles.shadowWrapNoMargin,
      ]}
    >
      <View style={styles.cardFace}>{cardBody}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 20,
    backgroundColor: colors.entryCard,
    marginHorizontal: 20,
    marginTop: 12,
  },
  shadowWrapElevated: {
    ...cardDropShadow,
  },
  shadowWrapNoMargin: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  /** Белая «лицевая» часть без border — объём только за счёт тени снаружи */
  cardFace: {
    borderRadius: 20,
    backgroundColor: colors.entryCard,
    padding: 16,
    overflow: "hidden",
  },
  cardCompactRoot: {
    backgroundColor: colors.entryCard,
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 12,
  },
  cardNoOuterMargin: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  emotion: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.subtext,
    flexShrink: 0,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textThird,
    marginTop: 0,
  },
  footer: {
    marginTop: 12,
  },
  mainPressed: {
    opacity: 0.86,
  },
});
