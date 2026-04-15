import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import StepContent from "../../../components/create/StepContent";
import StepFooter from "../../../components/create/stepFooter";
import StepSidebar from "../../../components/create/stepSidebar";

export default function CreateScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const [form, setForm] = useState({
    situation: "",
    thought: "",
    body: "",
    behavior: "",
    behaviorAlt: "",
  });

  const [items, setItems] = useState([{ text: "", percent: "100" }]);

  const getFullData = () => {
    return {
      ...form,
      emotions: items,
      tags: Array.from(selectedTags),
    };
  };

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  return (
    <View style={styles.container}>
      <StepSidebar step={step} setStep={setStep} />

      {/* Main Content */}
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

        {/* Footer */}
        <StepFooter
          step={step}
          setStep={setStep}
          onBack={() => {
            if (step === 1) {
              router.back();
            } else {
              setStep(step - 1);
            }
          }}
          onNext={() => {
            console.log("CLICK", step);

            if (step === 6) {
              //console.log("DATA", getFullData());
              console.log(JSON.stringify(getFullData(), null, 2));
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
