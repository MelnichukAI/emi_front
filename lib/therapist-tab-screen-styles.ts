import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

/** Общее оформление вкладок терапевта (как на экране «Статистика»). */
export const therapistTabScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  /** Верхний отступ — в компоненте Header (safe area). */
  contentWithHeader: {
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 14,
    marginTop: -4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  sectionSubtitle: {
    color: colors.subtext,
    fontSize: 13,
    marginBottom: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  metricValue: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
  metricSub: {
    color: colors.subtext,
    fontSize: 13,
  },
  wideButton: {
    marginTop: 4,
    backgroundColor: colors.lightbutton,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  wideButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  entryRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D9DFEF",
  },
  entryClient: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  entryDate: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  entryText: {
    color: colors.textThird,
    fontSize: 13,
    marginTop: 4,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clientCardBody: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  clientName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  clientMeta: {
    marginTop: 2,
    color: colors.textThird,
    fontSize: 14,
  },
  pickerRow: {
    gap: 8,
  },
  pickerLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  pickerControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9DFEF",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerControlDisabled: {
    opacity: 0.65,
  },
  pickerValue: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  errorText: {
    color: "#E35D5D",
    fontSize: 13,
  },
  loader: {
    marginTop: 8,
  },
  entriesList: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    color: colors.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(34, 21, 105, 0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    maxHeight: "70%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  modalOptionSelected: {
    backgroundColor: colors.lightbutton,
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  modalOptionTextSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  modalClose: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  modalCloseText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  topLeft: {
    flex: 1,
    gap: 4,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#E35D5D",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarIcon: {
    color: "#fff",
    fontSize: 20,
  },
  profileName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 17,
  },
  profileEmail: {
    color: colors.subtext,
    fontSize: 13,
  },
  fieldLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginTop: 4,
  },
  textInput: {
    minHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9DFEF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  textInputSingle: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9DFEF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  primaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  successNotice: {
    color: "#0EA54F",
    fontSize: 12,
    fontWeight: "600",
  },
  codeBox: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  codeValue: {
    color: colors.text,
    fontSize: 15,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#D9DFEF",
  },
  actionCardPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionIcon: {
    fontSize: 18,
    color: colors.text,
  },
  actionIconOnPrimary: {
    color: "#fff",
  },
  actionText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  actionTextOnPrimary: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  inlineNotice: {
    textAlign: "center",
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  hint: {
    color: colors.subtext,
    fontSize: 12,
    lineHeight: 16,
  },
});
