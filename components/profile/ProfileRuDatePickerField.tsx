import { colors } from "@/constants/colors";
import {
  formatLocalDateRu,
  parseRuDateStringToLocalDate,
} from "@/lib/profile-journal-filter";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const MONTH_NAMES_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function mondayIndexFromSunday(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Cell = { kind: "empty" } | { kind: "day"; day: number };

function buildMonthCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const leading = mondayIndexFromSunday(first.getDay());
  const dim = daysInMonth(year, month);
  const cells: Cell[] = [];
  for (let i = 0; i < leading; i++) cells.push({ kind: "empty" });
  for (let d = 1; d <= dim; d++) cells.push({ kind: "day", day: d });
  while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
  while (cells.length < 35) cells.push({ kind: "empty" });
  return cells;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  /** У первого поля в форме — без верхнего отступа у подписи */
  isFirst?: boolean;
};

export default function ProfileRuDatePickerField({
  label,
  value,
  onChange,
  isFirst,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowW } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const parsed = useMemo(
    () => parseRuDateStringToLocalDate(value),
    [value],
  );

  useEffect(() => {
    if (!open) return;
    const base = parsed ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
  }, [open, parsed]);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );
  const rows = chunk(cells, 7);
  const today = new Date();
  const cardMaxW = Math.min(360, windowW - 32);

  const pickDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    onChange(formatLocalDateRu(d));
    setOpen(false);
  };

  const goPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const displayLabel =
    parsed !== null ? formatLocalDateRu(parsed) : "Выберите дату";

  return (
    <>
      <Text style={[styles.fieldLabel, isFirst && styles.fieldLabelFirst]}>
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.fieldRow,
          pressed && styles.fieldRowPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[
            styles.fieldValue,
            parsed === null && styles.fieldPlaceholder,
          ]}
        >
          {displayLabel}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setOpen(false)}
            accessibilityLabel="Закрыть календарь"
          />
          <View
            style={[
              styles.card,
              {
                maxWidth: cardMaxW,
                marginTop: insets.top + 24,
                marginBottom: insets.bottom + 16,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Выбор даты</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.monthNav}>
              <Pressable
                onPress={goPrevMonth}
                style={({ pressed }) => [
                  styles.monthNavBtn,
                  pressed && styles.monthNavBtnPressed,
                ]}
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={26} color={colors.primary} />
              </Pressable>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES_RU[viewMonth]} {viewYear}
              </Text>
              <Pressable
                onPress={goNextMonth}
                style={({ pressed }) => [
                  styles.monthNavBtn,
                  pressed && styles.monthNavBtnPressed,
                ]}
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-forward"
                  size={26}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS_RU.map((w) => (
                <Text key={w} style={styles.weekdayCell}>
                  {w}
                </Text>
              ))}
            </View>

            {rows.map((row, ri) => (
              <View key={ri} style={styles.dayRow}>
                {row.map((cell, ci) => {
                  if (cell.kind === "empty") {
                    return <View key={ci} style={styles.dayCell} />;
                  }
                  const cellDate = new Date(
                    viewYear,
                    viewMonth,
                    cell.day,
                  );
                  const selected =
                    parsed !== null && sameLocalDay(cellDate, parsed);
                  const isToday = sameLocalDay(cellDate, today);
                  return (
                    <Pressable
                      key={ci}
                      onPress={() => pickDay(cell.day)}
                      style={({ pressed }) => [
                        styles.dayCell,
                        styles.dayCellBtn,
                        isToday && styles.dayToday,
                        selected && styles.daySelected,
                        pressed && styles.dayPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selected && styles.dayTextSelected,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <Pressable
              style={({ pressed }) => [
                styles.clearBtn,
                pressed && styles.clearBtnPressed,
              ]}
              onPress={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <Text style={styles.clearBtnText}>Сбросить дату</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  fieldLabelFirst: {
    marginTop: 0,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.15)",
  },
  fieldRowPressed: {
    opacity: 0.92,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  fieldPlaceholder: {
    color: colors.subtext,
  },
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 69, 0.45)",
  },
  card: {
    width: "100%",
    alignSelf: "center",
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.18)",
    zIndex: 2,
    shadowColor: "#2D2A45",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  monthNavBtn: {
    padding: 4,
    borderRadius: 8,
  },
  monthNavBtnPressed: {
    opacity: 0.75,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.subtext,
    paddingVertical: 4,
  },
  dayRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellBtn: {
    margin: 2,
    borderRadius: 10,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  dayPressed: {
    opacity: 0.88,
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.surface,
  },
  clearBtn: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.25)",
    backgroundColor: colors.surface,
  },
  clearBtnPressed: {
    opacity: 0.9,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
