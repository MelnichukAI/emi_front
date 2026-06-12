import EmotionAccordionList from "@/components/emotionDictionary/EmotionAccordionList";
import { colors } from "@/constants/colors";
import type { Emotion } from "@/data/emotions";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  emotions: Emotion[];
  empty: boolean;
};

export default function SuggestedEmotionList({
  emotions,
  empty,
}: Props) {
  if (empty) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          Выберите область на компасе эмоций
        </Text>
        <Text style={styles.emptyText}>
          по двум параметрам: насколько они неприятные или приятные, и сколько в них энергии – от спокойствия до возбуждения.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <EmotionAccordionList items={emotions} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  emptyWrap: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.subtext,
  },
});