import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import StepContent from "../../../components/create/StepContent";
import StepFooter from "../../../components/create/stepFooter";
import StepSidebar from "../../../components/create/stepSidebar";
import { apiRequest } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth-session";

type DiaryCreateResponse = {
  id: string;
};

export default function CreateScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    situation: "",
    thought: "",
    body: "",
    behavior: "",
    behaviorAlt: "",
  });

  const [items, setItems] = useState([{ text: "", percent: "100" }]);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const handleCreateDiary = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("Сессия не найдена. Войдите снова.");
      router.replace("/auth/login");
      return;
    }

    const emotion = items
      .map((item) => ({
        name: item.text.trim(),
        percent: Number(item.percent),
      }))
      .filter((item) => item.name.length > 0 && Number.isFinite(item.percent));

    if (!form.situation.trim() || !form.thought.trim()) {
      alert("Заполните минимум ситуацию и мысль.");
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest<DiaryCreateResponse>("/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          situation: form.situation.trim(),
          thought: form.thought.trim(),
          reaction: form.body.trim(),
          behavior: form.behavior.trim(),
          behaviorAlt: form.behaviorAlt.trim(),
          emotion,
          tags: Array.from(selectedTags),
          visibility: "PRIVATE",
        }),
      });

      alert("Запись сохранена");
      router.replace("/client");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка сохранения записи");
    } finally {
      setSubmitting(false);
    }
  };

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
            if (submitting) return;
            if (step === 6) {
              handleCreateDiary();
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
