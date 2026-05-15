import { Platform, type ViewStyle } from "react-native";

/** Горизонтальная линия 2px: на web — border (не схлопывается при скролле), на native — height. */
export function horizontalRule2px(color: string): ViewStyle {
  return Platform.select({
    web: {
      flexShrink: 0,
      alignSelf: "stretch",
      height: 0,
      borderBottomWidth: 2,
      borderBottomStyle: "solid",
      borderBottomColor: color,
    },
    default: {
      flexShrink: 0,
      alignSelf: "stretch",
      height: 2,
      backgroundColor: color,
    },
  }) as ViewStyle;
}
