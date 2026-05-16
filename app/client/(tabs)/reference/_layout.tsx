import { colors } from "@/constants/colors";
import { textBody, textHeading } from "@/constants/typography";
import { EmotionDictionaryUiProvider } from "@/lib/emotion-dictionary-ui-context";
import { screenTopPadding } from "@/lib/screen-top-padding";
import { Stack, usePathname, useRouter } from "expo-router";
import { horizontalRule2px } from "@/lib/horizontal-rule-style";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReferenceTabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const onDictionary = pathname.includes("dictionary");

  return (
    <EmotionDictionaryUiProvider>
    <View style={styles.root}>
      <View
        style={[styles.segmentOuter, { paddingTop: screenTopPadding(insets.top) }]}
      >
        <View style={[styles.segmentInner, { paddingBottom: 12 }]}>
          <View style={styles.segment}>
          <Pressable
            onPress={() => router.replace("/client/reference/compass")}
            style={({ pressed }) => [
              styles.segmentHalf,
              !onDictionary && styles.segmentHalfActive,
              pressed && styles.segmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: !onDictionary }}
            accessibilityLabel="Компас"
          >
            <Text
              style={[
                styles.segmentLabel,
                !onDictionary && styles.segmentLabelActive,
              ]}
            >
              Компас
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/client/reference/dictionary")}
            style={({ pressed }) => [
              styles.segmentHalf,
              onDictionary && styles.segmentHalfActive,
              pressed && styles.segmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: onDictionary }}
            accessibilityLabel="Словарь"
          >
            <Text
              style={[
                styles.segmentLabel,
                onDictionary && styles.segmentLabelActive,
              ]}
            >
              Словарь
            </Text>
          </Pressable>
          </View>
        </View>
        <View style={styles.segmentBottomRule} />
      </View>
      <View style={styles.stackWrap}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
    </EmotionDictionaryUiProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmentOuter: {
    position: "relative",
    backgroundColor: colors.background,
    zIndex: Platform.OS === "web" ? 100 : 10,
    elevation: 10,
    ...(Platform.OS === "web" ? { isolation: "isolate" as const } : null),
  },
  segmentInner: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  segmentBottomRule: horizontalRule2px(colors.text),
  segment: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.15)",
  },
  segmentHalf: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  segmentHalfActive: {
    backgroundColor: colors.text,
  },
  segmentPressed: {
    opacity: 0.9,
  },
  segmentLabel: {
    ...textBody,
    fontSize: 16,
    fontWeight: "600",
    color: colors.subtext,
  },
  segmentLabelActive: {
    ...textHeading,
    color: colors.surface,
  },
  stackWrap: {
    flex: 1,
    position: "relative",
    zIndex: 0,
    ...(Platform.OS === "web" ? { overflow: "hidden" as const } : null),
  },
});
