import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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
import { colors } from "../../../constants/colors";
import { apiRequest } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth-session";

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

const QUICK_SUGGESTIONS = [
  "Help me describe this situation",
  "What emotion might I be feeling?",
  "Suggest some thoughts I might be having",
  "What's the intensity of this emotion?",
];

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Привет я Эми. Я здесь чтобы помочь тебе понять и описать твои эмоции. Что тебя привело сюда сегодня?",
    },
  ]);

  const appendMessage = (role: ChatRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text,
      },
    ]);
  };

  const sendPrompt = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt || loading) return;

    const token = getAccessToken();
    if (!token) {
      alert("Сессия не найдена. Войдите снова.");
      router.replace("/auth/login");
      return;
    }

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
        body: JSON.stringify({ prompt }),
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
      <ScrollView
        ref={scrollRef}
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
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          );
        })}

        <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
        <View style={styles.suggestions}>
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => sendPrompt(suggestion)}
              style={({ pressed }) => [
                styles.suggestionButton,
                pressed && styles.suggestionButtonPressed,
              ]}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomPanel}>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Emi for help..."
            placeholderTextColor="#7A88B5"
            style={styles.input}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={() => sendPrompt(input)}
          />
          <Pressable
            onPress={() => sendPrompt(input)}
            disabled={loading}
            style={({ pressed }) => [
              styles.sendButton,
              (pressed || loading) && styles.sendButtonPressed,
            ]}
          >
            <Text style={styles.sendButtonText}>{loading ? "..." : "➤"}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#CBD4EA",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "88%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#E9EEFB",
  },
  messageText: {
    color: colors.primary,
    fontSize: 28 / 2,
    lineHeight: 22,
    fontWeight: "500",
  },
  suggestionsTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: "#9AA9D8",
    fontSize: 26 / 2,
    fontWeight: "600",
  },
  suggestions: {
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  suggestionButtonPressed: {
    opacity: 0.8,
  },
  suggestionText: {
    color: colors.primary,
    fontSize: 30 / 2,
    fontWeight: "600",
  },
  bottomPanel: {
    marginTop: "auto",
    backgroundColor: "#F6F0DE",
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
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#D8DFF2",
    color: colors.primary,
    fontSize: 30 / 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A8B8EA",
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendButtonText: {
    fontSize: 22,
    color: "white",
    fontWeight: "700",
  },
});
