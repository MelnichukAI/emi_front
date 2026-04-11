import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import StepContent from "../components/create/StepContent";

export default function CreateScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text>Ситуация</Text>
        <Text>Мысль</Text>
        <Text>Тело</Text>
        <Text>Эмоция</Text>
        <Text>Поведение</Text>
        <Text>Теги</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Шаг {step}</Text>

        <StepContent step={step} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            onPress={() => {
              if (step === 1) {
                router.back(); // 👈 выход на главный экран
              } else {
                setStep((prev) => prev - 1);
              }
            }}
          >
            Назад
          </Text>

          <Text>i</Text>

          <Text onPress={() => setStep((prev) => Math.min(6, prev + 1))}>
            Далее
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 100,
    backgroundColor: "#EEE",
    paddingTop: 40,
    gap: 20,
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
