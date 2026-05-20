import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

/** Общие стили экрана просмотра записи (клиент и терапевт). */
export const diaryEntryDetailStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    minHeight: 48,
  },
  backChip: {
    alignSelf: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  lead: {
    fontSize: 16,
    color: colors.textThird,
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionEmpty: {
    backgroundColor: "#E7ECFB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  emotionLine: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: colors.surface,
    fontSize: 16,
  },
});
