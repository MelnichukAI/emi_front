import EntryCard from "@/components/journal/entryCard";
import { colors } from "@/constants/colors";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

type Entry = {
  id: number | string;
  emotion: string;
  text: string;
  date: string;
  visibleToTherapist: boolean;
  visibilityUpdating?: boolean;
};

type Props = {
  entries: Entry[];
  onEntryPress?: (entryId: string) => void;
  onToggleVisibility?: (entryId: string, nextValue: boolean) => void;
};

type ViewMode = "list" | "tile";

export default function ProfileJournalSection({
  entries,
  onEntryPress,
  onToggleVisibility,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Мои записи</Text>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setViewMode("list")}
          style={[
            styles.modeBtn,
            viewMode === "list" && styles.modeBtnActive,
          ]}
        >
          <Text
            style={[
              styles.modeBtnText,
              viewMode === "list" && styles.modeBtnTextActive,
            ]}
          >
            Списком
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode("tile")}
          style={[
            styles.modeBtn,
            viewMode === "tile" && styles.modeBtnActive,
          ]}
        >
          <Text
            style={[
              styles.modeBtnText,
              viewMode === "tile" && styles.modeBtnTextActive,
            ]}
          >
            Плитками
          </Text>
        </Pressable>
      </View>

      <View style={styles.filtersRow}>
        <Pressable style={styles.filterStub} disabled>
          <Text style={styles.filterStubText}>Фильтр (скоро)</Text>
        </Pressable>
        <Pressable style={styles.filterStub} disabled>
          <Text style={styles.filterStubText}>Сортировка (скоро)</Text>
        </Pressable>
      </View>

      {viewMode === "list" ? (
        <View style={styles.list}>
          {entries.map((entry) => (
            <View key={entry.id}>
              <Pressable
                onPress={() => onEntryPress?.(String(entry.id))}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <EntryCard
                  emotion={entry.emotion}
                  text={entry.text}
                  date={entry.date}
                  noOuterMargin
                />
              </Pressable>
              <View style={styles.visibilityRow}>
                <Text style={styles.visibilityLabel}>Показывать терапевту</Text>
                <Switch
                  value={entry.visibleToTherapist}
                  disabled={entry.visibilityUpdating}
                  onValueChange={(nextValue) =>
                    onToggleVisibility?.(String(entry.id), nextValue)
                  }
                  trackColor={{ false: "#BCC5D8", true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.tileGrid}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.tileCell}>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => onEntryPress?.(String(entry.id))}
              >
                <EntryCard
                  emotion={entry.emotion}
                  text={entry.text}
                  date={entry.date}
                  noOuterMargin
                  compact
                />
              </Pressable>
              <View style={styles.visibilityRowCompact}>
                <Text style={styles.visibilityLabelCompact}>Терапевту</Text>
                <Switch
                  value={entry.visibleToTherapist}
                  disabled={entry.visibilityUpdating}
                  onValueChange={(nextValue) =>
                    onToggleVisibility?.(String(entry.id), nextValue)
                  }
                  trackColor={{ false: "#BCC5D8", true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.subtext,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  modeBtnTextActive: {
    color: "#fff",
  },
  filtersRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  filterStub: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.subtext,
    borderStyle: "dashed",
    alignItems: "center",
  },
  filterStubText: {
    fontSize: 13,
    color: colors.subtext,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    justifyContent: "space-between",
  },
  tileCell: {
    width: "48%",
  },
  visibilityRow: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visibilityLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  visibilityRowCompact: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visibilityLabelCompact: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.86,
  },
});
