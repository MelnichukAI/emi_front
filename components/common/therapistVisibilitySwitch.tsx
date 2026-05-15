import { colors } from "@/constants/colors";
import type { SwitchProps } from "react-native";
import { Platform, Switch } from "react-native";

/** Серый трек в выключенном состоянии (как у прежнего `Switch`). */
const TRACK_OFF = "#BCC5D8";

export type TherapistVisibilitySwitchProps = Pick<
  SwitchProps,
  "value" | "onValueChange" | "disabled" | "testID" | "style"
>;

/**
 * Тумблер «показать терапевту»: включён — трек `colors.background`, бегунок `colors.primary`.
 */
export default function TherapistVisibilitySwitch({
  value,
  onValueChange,
  disabled,
  testID,
  style,
}: TherapistVisibilitySwitchProps) {
  return (
    <Switch
      testID={testID}
      style={style}
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
      trackColor={{ false: TRACK_OFF, true: colors.background }}
      thumbColor={value ? colors.primary : "#FFFFFF"}
      ios_backgroundColor={TRACK_OFF}
      {...(Platform.OS === "web"
        ? /* react-native-web: во включённом состоянии цвет бегунка берётся из `activeThumbColor`, не из `thumbColor` */
          ({ activeThumbColor: colors.primary } as SwitchProps)
        : {})}
    />
  );
}
