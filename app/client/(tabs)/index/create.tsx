import StepContent from "@/components/create/StepContent";
import StepFooter from "@/components/create/stepFooter";
import StepSidebar from "@/components/create/stepSidebar";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useDiaryDraft } from "./_diary-draft-context";

type HomeTabStackParamList = {
  index: undefined;
  create: undefined;
  confirm: undefined;
};

export default function CreateScreen() {
  const router = useRouter();
  const navigation =
    useNavigation<NavigationProp<HomeTabStackParamList>>();
  const {
    form,
    setForm,
    items,
    setItems,
    selectedTags,
    setSelectedTags,
    step,
    setStep,
  } = useDiaryDraft();

  return (
    <View style={styles.container}>
      <StepSidebar step={step} setStep={setStep} />

      <View style={styles.content}>
        <Text style={styles.title}>Шаг {step}</Text>

        <StepContent
          step={step}
          form={form}
          setForm={setForm}
          items={items}
          setItems={setItems}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />

        <StepFooter
          step={step}
          setStep={setStep}
          nextLabel={step === 6 ? "Далее" : undefined}
          onBack={() => {
            if (step === 1) {
              router.back();
            } else {
              setStep(step - 1);
            }
          }}
          onNext={() => {
            if (step === 6) {
              // Имя экрана из confirm.tsx; router.push("./confirm") даёт unmatched в этом стеке.
              navigation.navigate("confirm");
            } else {
              setStep(step + 1);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
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
});
