import AppUsageBlock from "@/components/stats/AppUsageBlock";
import RankedBarBlock from "@/components/stats/RankedBarBlock";
import { colors } from "@/constants/colors";
import { mockUserStatistics } from "@/data/mockStatistics";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function StatsScreen() {
  const stats = mockUserStatistics;

  const emotionRows = stats.topEmotions.map((e) => ({
    label: e.emotion,
    count: e.count,
  }));

  const tagRows = stats.topTags.map((t) => ({
    label: t.tag,
    count: t.count,
  }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Статистика</Text>
        <Text style={styles.pageSubtitle}>
          Персональные данные (сейчас — демо, позже с сервера)
        </Text>
      </View>

      <RankedBarBlock
        title="Топ эмоций"
        subtitle="Какие эмоции чаще всего встречаются в ваших записях"
        rows={emotionRows}
      />

      <RankedBarBlock
        title="Топ тегов"
        subtitle="Темы, которые вы чаще отмечаете в записях"
        rows={tagRows}
      />

      <AppUsageBlock totalEntries={stats.totalEntries} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
});
