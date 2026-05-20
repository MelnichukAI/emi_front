import { colors } from "@/constants/colors";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type AboutSection = {
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  saving: boolean;
  canSave: boolean;
  savedNotice: string | null;
};

type Props = {
  user: {
    fullName: string;
    email: string;
    memberSinceLabel: string;
  };
  about?: AboutSection;
};

export default function ProfilePersonalCard({ user, about }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.blockTitle}>Персональные данные</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.line}>{user.email}</Text>
      </View>

      {about ? (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Расскажите о себе</Text>
          <TextInput
            value={about.value}
            onChangeText={about.onChangeText}
            placeholder="Например: специализация, подход к работе, опыт…"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={styles.aboutInput}
          />
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              !about.canSave && styles.saveButtonDisabled,
              pressed && about.canSave && !about.saving && styles.saveButtonPressed,
            ]}
            disabled={!about.canSave || about.saving}
            onPress={about.onSave}
          >
            {about.saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить</Text>
            )}
          </Pressable>
          {about.savedNotice ? (
            <Text style={styles.savedNotice}>{about.savedNotice}</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.memberSince}>
        В приложении с {user.memberSinceLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  line: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  memberSince: {
    marginTop: 12,
    fontSize: 14,
    color: colors.subtext,
    alignSelf: "flex-end",
    textAlign: "right",
  },
  aboutSection: {
    marginTop: 16,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  aboutInput: {
    minHeight: 100,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D6DBEA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 1,
    backgroundColor: colors.subtext,
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  savedNotice: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#0EA54F",
  },
});
