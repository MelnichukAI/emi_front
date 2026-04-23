import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type DiaryDraftFormState = {
  situation: string;
  thought: string;
  body: string;
  behavior: string;
  behaviorAlt: string;
};

export type DiaryEmotionRow = { text: string; percent: string };

const emptyForm: DiaryDraftFormState = {
  situation: "",
  thought: "",
  body: "",
  behavior: "",
  behaviorAlt: "",
};

type DiaryDraftContextValue = {
  form: DiaryDraftFormState;
  setForm: React.Dispatch<React.SetStateAction<DiaryDraftFormState>>;
  items: DiaryEmotionRow[];
  setItems: React.Dispatch<React.SetStateAction<DiaryEmotionRow[]>>;
  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  resetDraft: () => void;
};

const DiaryDraftContext = createContext<DiaryDraftContextValue | null>(null);

export function DiaryDraftProvider({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState<DiaryDraftFormState>(emptyForm);
  const [items, setItems] = useState<DiaryEmotionRow[]>([
    { text: "", percent: "100" },
  ]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(1);

  const resetDraft = useCallback(() => {
    setForm(emptyForm);
    setItems([{ text: "", percent: "100" }]);
    setSelectedTags(new Set());
    setStep(1);
  }, []);

  const value = useMemo(
    () => ({
      form,
      setForm,
      items,
      setItems,
      selectedTags,
      setSelectedTags,
      step,
      setStep,
      resetDraft,
    }),
    [form, items, resetDraft, selectedTags, step],
  );

  return (
    <DiaryDraftContext.Provider value={value}>
      {children}
    </DiaryDraftContext.Provider>
  );
}

export function useDiaryDraft() {
  const ctx = useContext(DiaryDraftContext);
  if (!ctx) {
    throw new Error("useDiaryDraft must be used within DiaryDraftProvider");
  }
  return ctx;
}
