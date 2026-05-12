import { colors } from "@/constants/colors";
import { emotionsByName, type Emotion } from "@/data/emotions";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";

export type EmotionDayMetricChartEntry = {
  emotion?: string | null;
  createdAt?: string | null;
};

export type EmotionDayMetric = "valence" | "energy";

type DayPoint = {
  dateKey: string;
  label: string;
  average: number | null;
  barColor: string | null;
  barFillPct: number;
};

/** Высота зоны столбцов (ось Y: 0 внизу, 5 вверху). */
const BAR_AREA_HEIGHT = 136;
const Y_TICKS = [5, 4, 3, 2, 1, 0] as const;
const BAR_TRACK_BG = "#FFFFFF";
const GRID_STROKE = "#8E97AB";
const GRID_DASH = "1.2 2";
const GRID_VIEWBOX_W = 100;

/** Минимальная высота заливки столбца (% от дорожки), чтобы при 0 был виден столбик и цвет. */
const MIN_BAR_FILL_PCT = 10 / 3;

const DEFAULT_COPY: Record<
  EmotionDayMetric,
  { title: string; subtitle: string }
> = {
  valence: {
    title: "Валентность по дням",
    subtitle: "Средняя валентность эмоций за последние 7 дней (по дате записи)",
  },
  energy: {
    title: "Энергия по дням",
    subtitle: "Средняя энергия эмоций за последние 7 дней (по дате записи)",
  },
};

function pickScalar(emotion: Emotion, metric: EmotionDayMetric): number | null {
  const v = metric === "valence" ? emotion.valence : emotion.energy;
  if (v === null || v === undefined) return null;
  return v;
}

function extractEmotionNames(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.replace(/\s*\d+%?$/g, "").trim())
    .filter(Boolean);
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getLast7DayKeys(reference = new Date()): string[] {
  const keys: string[] = [];
  const base = new Date(reference);
  base.setHours(12, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    keys.push(localDateKey(d));
  }
  return keys;
}

function shortDayLabel(dateKey: string): string {
  const [y, m, day] = dateKey.split("-").map(Number);
  if (!y || !m || !day) return "";
  const d = new Date(y, m - 1, day);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function barColorForAverage(avg: number, metric: EmotionDayMetric): string {
  if (metric === "energy") {
    if (avg >= 0 && avg < 1) return "#CDBCFE";
    if (avg >= 1 && avg < 2) return "#BDA8FD";
    if (avg >= 2 && avg < 3) return "#AE94FC";
    if (avg >= 3 && avg < 4) return "#9E80FB";
    if (avg >= 4 && avg <= 5) return "#906BFA";
    if (avg > 5) return "#906BFA";
    return "#CDBCFE";
  }
  if (avg <= 2.5) return "#cecff1";
  if (avg < 4) return "#fef5bf";
  return "#ffd4b8";
}

function barFillHeightPct(value: number): number {
  return Math.max(0, Math.min(100, (value / 5) * 100));
}

function buildDayPoints(
  entries: EmotionDayMetricChartEntry[],
  metric: EmotionDayMetric,
  reference = new Date(),
): DayPoint[] {
  const keys = getLast7DayKeys(reference);
  const keySet = new Set(keys);
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.createdAt) continue;
    const t = new Date(entry.createdAt);
    if (Number.isNaN(t.getTime())) continue;
    const key = localDateKey(t);
    if (!keySet.has(key)) continue;

    for (const name of extractEmotionNames(entry.emotion)) {
      const emotion = emotionsByName.get(name.trim());
      if (!emotion) continue;
      const v = pickScalar(emotion, metric);
      if (v === null) continue;
      sums.set(key, (sums.get(key) ?? 0) + v);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return keys.map((dateKey) => {
    const n = counts.get(dateKey) ?? 0;
    if (n === 0) {
      return {
        dateKey,
        label: shortDayLabel(dateKey),
        average: null,
        barColor: null,
        barFillPct: 0,
      };
    }
    const raw = (sums.get(dateKey) ?? 0) / n;
    const average = Math.round(raw * 100) / 100;
    return {
      dateKey,
      label: shortDayLabel(dateKey),
      average,
      barColor: barColorForAverage(average, metric),
      barFillPct: Math.max(barFillHeightPct(average), MIN_BAR_FILL_PCT),
    };
  });
}

type Props = {
  entries: EmotionDayMetricChartEntry[];
  metric?: EmotionDayMetric;
  title?: string;
  subtitle?: string;
};

export default function EmotionDayMetricChart({
  entries,
  metric = "valence",
  title,
  subtitle,
}: Props) {
  const defaults = DEFAULT_COPY[metric];
  const resolvedTitle = title ?? defaults.title;
  const resolvedSubtitle = subtitle ?? defaults.subtitle;
  const points = useMemo(
    () => buildDayPoints(entries, metric),
    [entries, metric],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{resolvedTitle}</Text>
      {resolvedSubtitle ? (
        <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
      ) : null}

      <View style={styles.chartRow}>
        <View style={[styles.yAxis, { height: BAR_AREA_HEIGHT }]}>
          {Y_TICKS.map((tick) => (
            <Text key={tick} style={styles.yTick}>
              {tick}
            </Text>
          ))}
        </View>

        <View style={styles.plotShell}>
          <Svg
            width="100%"
            height={BAR_AREA_HEIGHT}
            viewBox={`0 0 ${GRID_VIEWBOX_W} ${BAR_AREA_HEIGHT}`}
            preserveAspectRatio="none"
            style={styles.gridSvg}
            pointerEvents="none"
          >
            {Y_TICKS.map((tick) => {
              const y = (BAR_AREA_HEIGHT * (5 - tick)) / 5;
              return (
                <Line
                  key={tick}
                  x1={0}
                  y1={y}
                  x2={GRID_VIEWBOX_W}
                  y2={y}
                  stroke={GRID_STROKE}
                  strokeWidth={0.45}
                  strokeDasharray={GRID_DASH}
                  vectorEffect="nonScalingStroke"
                />
              );
            })}
          </Svg>

          <View style={styles.barsRow} pointerEvents="box-none">
            {points.map((p) => (
              <View key={p.dateKey} style={styles.barSlot}>
                <View style={styles.barTrack}>
                  {p.average !== null ? (
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${p.barFillPct}%`,
                          backgroundColor: p.barColor ?? colors.subtext,
                        },
                      ]}
                    />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.xMetaRow}>
        {points.map((p) => (
          <View key={`meta-${p.dateKey}`} style={styles.xMetaCell}>
            {p.average !== null ? (
              <Text style={styles.valueTag} numberOfLines={1}>
                {p.average.toFixed(2)}
              </Text>
            ) : (
              <Text style={styles.valueEmpty}>—</Text>
            )}
            <Text style={styles.xLabel} numberOfLines={1}>
              {p.label}
            </Text>
          </View>
        ))}
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
  chartRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },
  yAxis: {
    width: 24,
    justifyContent: "space-between",
    paddingTop: 2,
    paddingBottom: 2,
  },
  yTick: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.subtext,
    textAlign: "right",
  },
  plotShell: {
    flex: 1,
    minWidth: 0,
    height: BAR_AREA_HEIGHT,
    borderRadius: 8,
    backgroundColor: BAR_TRACK_BG,
    overflow: "hidden",
    position: "relative",
  },
  gridSvg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  barsRow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 4,
  },
  barSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barTrack: {
    width: "100%",
    maxWidth: 34,
    height: "100%",
    borderRadius: 6,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  xMetaRow: {
    flexDirection: "row",
    marginTop: 6,
    marginLeft: 32,
    gap: 4,
  },
  xMetaCell: {
    flex: 1,
    alignItems: "center",
  },
  valueTag: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
  },
  valueEmpty: {
    fontSize: 11,
    color: colors.subtext,
  },
  xLabel: {
    marginTop: 2,
    fontSize: 10,
    color: colors.subtext,
    textAlign: "center",
  },
});
