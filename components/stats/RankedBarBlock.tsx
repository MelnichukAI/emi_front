import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

type Row = { label: string; count: number };

type Props = {
  title: string;
  rows: Row[];
  /** Подпись под заголовком (например про источник данных) */
  subtitle?: string;
};

export default function RankedBarBlock({ title, rows, subtitle }: Props) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.list}>
        {rows.map((row) => {
          const widthPct = Math.round((row.count / max) * 100);
          return (
            <View key={row.label} style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.label} numberOfLines={1}>
                  {row.label}
                </Text>
                <Text style={styles.count}>{row.count}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${widthPct}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
  },
  list: {
    marginTop: 16,
    gap: 14,
  },
  row: {
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },
  count: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary,
    minWidth: 4,
  },
});
