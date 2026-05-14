import EntryCard from "@/components/journal/entryCard";
import ProfileJournalFilterPanel from "@/components/profile/ProfileJournalFilterPanel";
import ProfileJournalFilterTagsModal from "@/components/profile/ProfileJournalFilterTagsModal";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  applyProfileJournalFilter,
  EMPTY_PROFILE_JOURNAL_FILTER,
  type ProfileJournalFilter,
  type ProfileJournalListEntry,
  type ProfileJournalSortMode,
  sortProfileJournalEntries,
} from "@/lib/profile-journal-filter";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

type Props = {
  allEntries: ProfileJournalListEntry[];
  onEntryPress?: (entryId: string) => void;
  onToggleVisibility?: (entryId: string, nextValue: boolean) => void;
};

type ViewMode = "list" | "tile";

const SORT_OPTIONS: { id: ProfileJournalSortMode; label: string }[] = [
  { id: "date_desc", label: "По дате (новые первые)" },
  { id: "date_asc", label: "По дате (старые первые)" },
  { id: "energy_desc", label: "По энергии ↓" },
  { id: "energy_asc", label: "По энергии ↑" },
  { id: "valence_desc", label: "По валентности ↓" },
  { id: "valence_asc", label: "По валентности ↑" },
];

function cloneFilter(f: ProfileJournalFilter): ProfileJournalFilter {
  return {
    ...f,
    tags: new Set(f.tags),
  };
}

export default function ProfileJournalSection({
  allEntries,
  onEntryPress,
  onToggleVisibility,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortMode, setSortMode] = useState<ProfileJournalSortMode>("date_desc");
  const [appliedFilter, setAppliedFilter] = useState<ProfileJournalFilter>(() =>
    cloneFilter(EMPTY_PROFILE_JOURNAL_FILTER),
  );
  const [filterDraft, setFilterDraft] = useState<ProfileJournalFilter>(() =>
    cloneFilter(EMPTY_PROFILE_JOURNAL_FILTER),
  );
  const filterDraftRef = useRef(filterDraft);
  filterDraftRef.current = filterDraft;
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [tagPickerSeed, setTagPickerSeed] = useState<string[]>([]);
  const [tagPickerResetKey, setTagPickerResetKey] = useState(0);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortBtnRef = useRef<View>(null);
  const [sortAnchor, setSortAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const displayedEntries = useMemo(() => {
    const filtered = applyProfileJournalFilter(allEntries, appliedFilter);
    return sortProfileJournalEntries(filtered, sortMode);
  }, [allEntries, appliedFilter, sortMode]);

  const openFilterPanel = () => {
    setSortMenuOpen(false);
    setFilterDraft(cloneFilter(appliedFilter));
    setFilterPanelOpen(true);
  };

  const applyFilterPanel = (final: ProfileJournalFilter) => {
    setAppliedFilter(cloneFilter(final));
    setFilterPanelOpen(false);
  };

  const resetFilterKeepPanelOpen = useCallback(() => {
    const empty = cloneFilter(EMPTY_PROFILE_JOURNAL_FILTER);
    setFilterDraft(empty);
    setAppliedFilter(empty);
  }, []);

  const cancelFilterPanel = () => {
    setFilterPanelOpen(false);
  };

  const openSortMenu = () => {
    setFilterPanelOpen(false);
    sortBtnRef.current?.measureInWindow((x, y, width, height) => {
      setSortAnchor({ x, y, width, height });
      setSortMenuOpen(true);
    });
  };

  const closeSortMenu = () => setSortMenuOpen(false);

  const selectSortMode = (mode: ProfileJournalSortMode) => {
    setSortMode(mode);
    closeSortMenu();
  };

  const handleOpenTagPicker = useCallback(() => {
    setTagPickerSeed(Array.from(filterDraftRef.current.tags));
    setTagPickerResetKey((n) => n + 1);
    setTagPickerOpen(true);
  }, []);

  const closeTagPicker = useCallback(() => setTagPickerOpen(false), []);

  const saveTagPicker = useCallback((tags: Set<string>) => {
    setFilterDraft((prev) => ({ ...prev, tags: new Set(tags) }));
  }, []);

  const screenW = Dimensions.get("window").width;
  const menuWidth = Math.min(screenW - 24, 320);
  const menuTop =
    sortAnchor !== null ? sortAnchor.y + sortAnchor.height + 6 : 120;
  const menuLeft =
    sortAnchor !== null
      ? Math.max(12, Math.min(sortAnchor.x, screenW - menuWidth - 12))
      : 12;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Мои записи</Text>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setViewMode("list")}
          style={[styles.modeBtn, viewMode === "list" && styles.modeBtnActive]}
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
          style={[styles.modeBtn, viewMode === "tile" && styles.modeBtnActive]}
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
        <Pressable
          onPress={openFilterPanel}
          style={({ pressed }) => [
            styles.toolBtn,
            pressed && styles.toolBtnPressed,
          ]}
        >
          <Ionicons name="funnel-outline" size={20} color={colors.primary} />
          <Text style={styles.toolBtnText}>Фильтр</Text>
        </Pressable>
        <View ref={sortBtnRef} collapsable={false} style={styles.toolBtnWrap}>
          <Pressable
            onPress={openSortMenu}
            style={({ pressed }) => [
              styles.toolBtn,
              pressed && styles.toolBtnPressed,
            ]}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.toolBtnText}>Сортировка</Text>
          </Pressable>
        </View>
      </View>

      {viewMode === "list" ? (
        <View style={styles.list}>
          {displayedEntries.length === 0 ? (
            <Text style={styles.emptyHint}>Нет записей по выбранным условиям.</Text>
          ) : (
            displayedEntries.map((entry) => (
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
            ))
          )}
        </View>
      ) : (
        <View style={styles.tileGrid}>
          {displayedEntries.length === 0 ? (
            <Text style={[styles.emptyHint, styles.emptyHintTile]}>
              Нет записей по выбранным условиям.
            </Text>
          ) : (
            displayedEntries.map((entry) => (
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
            ))
          )}
        </View>
      )}

      <Modal
        visible={sortMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeSortMenu}
        statusBarTranslucent
      >
        <View style={styles.sortModalRoot} pointerEvents="box-none">
          <Pressable
            style={styles.sortBackdrop}
            onPress={closeSortMenu}
            accessibilityLabel="Закрыть сортировку"
          />
          <View
            style={[
              styles.sortMenu,
              {
                top: menuTop,
                left: menuLeft,
                width: menuWidth,
              },
            ]}
            pointerEvents="box-none"
          >
            {SORT_OPTIONS.map((opt) => {
              const selected = sortMode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => selectSortMode(opt.id)}
                  style={({ pressed }) => [
                    styles.sortMenuRow,
                    selected && styles.sortMenuRowSelected,
                    pressed && styles.sortMenuRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortMenuLabel,
                      selected && styles.sortMenuLabelSelected,
                    ]}
                    numberOfLines={3}
                  >
                    {opt.label}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={22} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      <ProfileJournalFilterPanel
        visible={filterPanelOpen}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onApply={applyFilterPanel}
        onResetApply={resetFilterKeepPanelOpen}
        onCancel={cancelFilterPanel}
        onOpenTagPicker={handleOpenTagPicker}
      />

      <ProfileJournalFilterTagsModal
        visible={tagPickerOpen}
        resetKey={tagPickerResetKey}
        initialTags={tagPickerSeed}
        onRequestClose={closeTagPicker}
        onSave={saveTagPicker}
      />
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
  toolBtnWrap: {
    flex: 1,
  },
  toolBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  toolBtnPressed: {
    opacity: 0.9,
  },
  toolBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  emptyHint: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: "center",
    paddingVertical: 16,
    lineHeight: 22,
  },
  emptyHintTile: {
    width: "100%",
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
  sortModalRoot: {
    flex: 1,
  },
  sortBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 69, 0.35)",
  },
  sortMenu: {
    position: "absolute",
    zIndex: 2,
    borderRadius: 14,
    backgroundColor: colors.card,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.18)",
    shadowColor: "#2D2A45",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  sortMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  sortMenuRowSelected: {
    backgroundColor: "rgba(75, 69, 150, 0.06)",
  },
  sortMenuRowPressed: {
    opacity: 0.92,
  },
  sortMenuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  sortMenuLabelSelected: {
    fontWeight: "600",
  },
});
