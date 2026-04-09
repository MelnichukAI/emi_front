import PrimaryButton from "@/components/common/primaryButton";
import { Text, View } from "react-native";
import Header from "../../components/common/header";
import SecondaryButton from "../../components/common/secondaryButton";
import EntryCard from "../../components/journal/entryCard";
import { entries } from "../../data/mockData";

export default function HomeScreen() {
  return (
    <View>
      <Header />

      <PrimaryButton title="Создать запись" />
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
  );
}
