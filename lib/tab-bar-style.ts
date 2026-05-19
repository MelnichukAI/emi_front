import { colors } from "@/constants/colors";
import { Platform, type ViewStyle } from "react-native";

const TAB_BAR_CONTENT_HEIGHT_IOS = 52;
const TAB_BAR_CONTENT_HEIGHT_ANDROID = 58;

/**
 * На Android с edge-to-edge insets.bottom иногда 0 в release —
 * минимальный отступ, чтобы таббар не заходил под системную навигацию.
 */
const ANDROID_FALLBACK_BOTTOM_INSET = 32;

export function resolveTabBarBottomInset(insetBottom: number): number {
  if (insetBottom > 0) return insetBottom;
  if (Platform.OS === "android") return ANDROID_FALLBACK_BOTTOM_INSET;
  return 0;
}

type BuildTabBarStyleOptions = {
  bottomInset: number;
  hideTopBorder?: boolean;
  backgroundColor?: string;
};

export function buildTabBarStyle({
  bottomInset,
  hideTopBorder = false,
  backgroundColor = colors.tabBar,
}: BuildTabBarStyleOptions): ViewStyle {
  const safeBottom = resolveTabBarBottomInset(bottomInset);
  const contentHeight =
    Platform.OS === "ios"
      ? TAB_BAR_CONTENT_HEIGHT_IOS
      : TAB_BAR_CONTENT_HEIGHT_ANDROID;

  return Platform.select({
    ios: {
      backgroundColor,
      borderTopWidth: hideTopBorder ? 0 : 2,
      borderTopColor: colors.primary,
      height: contentHeight + safeBottom,
      paddingTop: 6,
      paddingBottom: safeBottom,
    },
    default: {
      backgroundColor,
      borderTopWidth: hideTopBorder ? 0 : 2,
      borderTopColor: colors.primary,
      height: contentHeight + safeBottom,
      paddingTop: 8,
      paddingBottom: safeBottom,
    },
  }) as ViewStyle;
}
