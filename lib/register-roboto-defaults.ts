import { FONT_FAMILIES } from "@/constants/typography";
import { StyleSheet, Text, TextInput } from "react-native";

let applied = false;

/**
 * Базовый шрифт для всех Text / TextInput (Roboto Regular).
 * Вызывать один раз после успешной загрузки шрифтов.
 */
export function registerRobotoTextDefaults() {
  if (applied) return;
  applied = true;

  const patch = (Comp: typeof Text | typeof TextInput) => {
    const C = Comp as typeof Text & {
      defaultProps?: { style?: unknown };
    };
    const prev = C.defaultProps ?? {};
    const prevStyle = prev.style;
    C.defaultProps = {
      ...prev,
      style: StyleSheet.flatten([
        { fontFamily: FONT_FAMILIES.regular },
        prevStyle,
      ]),
    };
  };

  patch(Text);
  patch(TextInput);
}
