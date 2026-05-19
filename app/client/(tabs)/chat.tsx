import SendIcon from "@/assets/icons/send.svg";
import Header from "@/components/common/header";
import { colors } from "@/constants/colors";
import { consumeDiaryDraftContextForChat } from "@/lib/diary-draft-chat-bridge";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiRequest } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth-session";

/** Палитра как на референсе чата (лаванда, фиолетовый пузырей пользователя). */
const CHAT_SCREEN_BG = "#DCE2F9";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type AIConsultResponse = {
  consultationId: string;
  result?: unknown;
};

const BRIEF_SUGGESTIONS = [
  "Помоги мне описать эту ситуацию",
  "Какая эмоция может быть у меня сейчас?",
  "Предложи мне какие-то мысли, которые у меня могут быть",
  "Какова интенсивность этой эмоции?",
];

/** «Сообщение пользователя» в промпте при авто-старте из мастера записи (в чате не показываем). */
const DRAFT_ENTRY_USER_PROMPT =
  "Пользователь только что открыл чат из экрана создания записи в дневнике. Он ещё не написал своё сообщение. По черновику выше ответь сразу: 2–5 предложений по-человечески — отрази, что ты поняла; при необходимости предложи, как уточнить эмоции или что дописать в записи. Без канцелярита.";

function buildPromptWithDraftContext(
  draftCtx: string | null | undefined,
  userMessage: string,
): string {
  const trimmedUser = userMessage.trim();
  if (draftCtx && draftCtx.length > 0) {
    return [
      "Ниже — актуальный черновик записи в дневнике пользователя. Учитывай этот контекст при ответе (ситуация, мысли, тело, эмоции, поведение, теги, шаг формы).",
      "",
      draftCtx,
      "",
      "---",
      "",
      "Сообщение пользователя:",
      trimmedUser,
    ].join("\n");
  }
  return trimmedUser;
}

type ParsedConsultShape = {
  reply?: string;
  emotions?: Array<{ name?: string; probability?: number }>;
  suggested_next?: unknown[];
};

function stripJsonMarkdownFence(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return s.trim();
}

function tryParseConsultPayload(raw: string): ParsedConsultShape | null {
  const cleaned = stripJsonMarkdownFence(raw);
  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ParsedConsultShape;
    }
  } catch {
    return null;
  }
  return null;
}

function formatConsultForDisplay(payload: ParsedConsultShape): string {
  const reply = typeof payload.reply === "string" ? payload.reply.trim() : "";
  const parts: string[] = [];
  if (reply) parts.push(reply);

  const emotions = Array.isArray(payload.emotions) ? payload.emotions : [];
  const names = emotions
    .map((e) => (e && typeof e.name === "string" ? e.name.trim() : ""))
    .filter((n) => n.length > 0);
  if (names.length > 0) {
    parts.push(`Возможные эмоции: ${names.join(", ")}.`);
  }

  return parts.join("\n\n").trim();
}

function extractAIText(result: unknown): string {
  if (!result) return "";

  if (typeof result === "string") {
    const parsed = tryParseConsultPayload(result);
    if (parsed) return formatConsultForDisplay(parsed);
    return result.trim();
  }

  if (typeof result !== "object") return "";

  const asRecord = result as Record<string, unknown>;

  if (typeof asRecord.reply === "string") {
    const formatted = formatConsultForDisplay(asRecord as ParsedConsultShape);
    if (formatted.length > 0) return formatted;
  }

  const choices = asRecord.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as Record<string, unknown>;
    const message = first?.message as Record<string, unknown> | undefined;
    const content = message?.content;
    if (typeof content === "string" && content.trim().length > 0) {
      const parsed = tryParseConsultPayload(content);
      if (parsed) return formatConsultForDisplay(parsed);
      return content.trim();
    }
  }

  return "";
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  /** Подсказки скрываются при: выборе чипа, отправке своего текста, входе из мастера записи. */
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(true);
  const diaryDraftContextRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Привет, я Эми. Я здесь чтобы помочь тебе понять и описать твои эмоции. Что тебя привело сюда сегодня?",
    },
  ]);

  const appendMessage = useCallback((role: ChatRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text,
      },
    ]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fromDraft = consumeDiaryDraftContextForChat();
      if (fromDraft) {
        diaryDraftContextRef.current = fromDraft;
        setShowQuickSuggestions(false);
        setMessages([
          {
            id: "draft-bootstrap",
            role: "assistant",
            text: "Секунду, просматриваю твой черновик записи…",
          },
        ]);
        void (async () => {
          const token = getAccessToken();
          if (!token) {
            if (!cancelled) {
              setMessages([
                {
                  id: "draft-bootstrap",
                  role: "assistant",
                  text: "Сессия не найдена. Войдите снова.",
                },
              ]);
            }
            router.replace("/auth/login");
            return;
          }
          const promptForApi = buildPromptWithDraftContext(
            fromDraft,
            DRAFT_ENTRY_USER_PROMPT,
          );
          setLoading(true);
          try {
            const data = await apiRequest<AIConsultResponse>("/ai/consult", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                prompt: promptForApi,
                sessionId: "chat-main",
              }),
            });
            const assistantText =
              extractAIText(data.result) ||
              "Я рядом. Напиши, с чем хочешь разобраться — я учту уже введённое в записи.";
            if (!cancelled) {
              setMessages([
                {
                  id: "draft-bootstrap",
                  role: "assistant",
                  text: assistantText,
                },
              ]);
            }
          } catch (error) {
            if (!cancelled) {
              setMessages([
                {
                  id: "draft-bootstrap",
                  role: "assistant",
                  text:
                    error instanceof Error
                      ? error.message
                      : "Не удалось получить ответ от AI.",
                },
              ]);
            }
          } finally {
            if (!cancelled) setLoading(false);
          }
        })();
      }
      return () => {
        cancelled = true;
        diaryDraftContextRef.current = null;
      };
    }, [router]),
  );

  const sendPrompt = async (
    rawPrompt: string,
    options?: { dismissSuggestionsForOwnInput?: boolean },
  ) => {
    const prompt = rawPrompt.trim();
    if (!prompt || loading) return;

    const token = getAccessToken();
    if (!token) {
      alert("Сессия не найдена. Войдите снова.");
      router.replace("/auth/login");
      return;
    }

    if (options?.dismissSuggestionsForOwnInput) {
      setShowQuickSuggestions(false);
    }

    const promptForApi = buildPromptWithDraftContext(
      diaryDraftContextRef.current,
      prompt,
    );

    setInput("");
    appendMessage("user", prompt);
    setLoading(true);

    try {
      const data = await apiRequest<AIConsultResponse>("/ai/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: promptForApi,
          sessionId: "chat-main",
        }),
      });

      const assistantText =
        extractAIText(data.result) ||
        "Спасибо, я получила сообщение. Попробуйте уточнить запрос, и я помогу глубже разобрать эмоции.";
      appendMessage("assistant", assistantText);
    } catch (error) {
      appendMessage(
        "assistant",
        error instanceof Error ? error.message : "Не удалось получить ответ от AI."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.headerStrip}>
        <Header
          title="Эми"
          subtitle="ИИ-ассистент"
          titleColor={colors.text}
          subtitleColor={colors.subtext}
          titleFontSize={28}
          subtitleFontSize={14}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          return (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                isAssistant ? styles.assistantBubble : styles.userBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isAssistant ? styles.messageTextAssistant : styles.messageTextUser,
                ]}
              >
                {message.text}
              </Text>
            </View>
          );
        })}

        {showQuickSuggestions ? (
          <>
            <Text style={styles.suggestionsTitle}>Краткие подсказки</Text>
            <View style={styles.suggestions}>
              {BRIEF_SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => {
                    setShowQuickSuggestions(false);
                    void sendPrompt(suggestion);
                  }}
                  style={({ pressed }) => [
                    styles.suggestionButton,
                    pressed && styles.suggestionButtonPressed,
                  ]}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.bottomPanel}>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Спроси Эми про самочувствие"
            placeholderTextColor={colors.textThird}
            style={styles.input}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={() =>
              void sendPrompt(input, { dismissSuggestionsForOwnInput: true })
            }
          />
          <Pressable
            onPress={() =>
              void sendPrompt(input, { dismissSuggestionsForOwnInput: true })
            }
            disabled={loading}
            style={({ pressed }) => [
              styles.sendButton,
              (pressed || loading) && styles.sendButtonPressed,
            ]}
          >
            <SendIcon
              width={20}
              height={20}
              color={colors.tabBar}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CHAT_SCREEN_BG,
  },
  headerStrip: {
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: CHAT_SCREEN_BG,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "88%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.tabBar,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
  messageTextAssistant: {
    color: colors.text,
  },
  messageTextUser: {
    color: colors.tabBar,
  },
  suggestionsTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: colors.subtext,
    fontSize: 13,
    fontWeight: "600",
  },
  suggestions: {
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  suggestionButtonPressed: {
    opacity: 0.88,
  },
  suggestionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  bottomPanel: {
    marginTop: "auto",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 14,
  },
  hintText: {
    backgroundColor: "#F3DF62",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#7D7A57",
    fontSize: 28 / 2,
    lineHeight: 20,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.lightbutton,
    color: colors.text,
    fontSize: 16,
    fontWeight: "400",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  sendButtonPressed: {
    opacity: 0.88,
  },
});
