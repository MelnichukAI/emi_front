import PrimaryButton from "@/components/common/primaryButton";
import Header from "@/components/common/header";
import SecondaryButton from "@/components/common/secondaryButton";
import EntryCard from "@/components/journal/entryCard";
import { colors } from "@/constants/colors";
import { entries } from "@/data/mockData";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { useDiaryDraft } from "./_diary-draft-context";

export default function HomeScreen() {
  const router = useRouter();
  const { resetDraft } = useDiaryDraft();

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={{ paddingBottom: 30 }}>
        <Header />

        <PrimaryButton
          title="Создать запись"
          onPress={() => {
            resetDraft();
            router.push("./create");
          }}
        />
        <SecondaryButton title="Определить эмоцию" />

        <Text style={{ marginLeft: 20, marginTop: 20 }}>Последние записи</Text>

        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            emotion={entry.emotion}
            text={entry.text}
            date={entry.date}
          />
        ))}
      </View>
    </ScrollView>
  );
}
