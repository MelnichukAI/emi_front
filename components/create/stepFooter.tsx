import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  step: number;
  setStep: (step: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function stepFooter({ step, setStep, onBack, onNext }: Props) {
  const [showHint, setShowHint] = useState(false);

  const hints: Record<number, string> = {
    1: "Введите в поле произошедшую ситуацию. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    2: "Введите в поле ваши мысли по поводу произошедшей ситуации. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    3: "Введите в поле испытываемые ощущения в теле. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    4: "Введите в поле эмоцию, которую как вам кажется вы испытываете. Рядом с полем можете указать насколько процентов вам кажется вы испытываете эту эмоцию. Если вы испытываете несколько эмоций нажмите кнопку +Добавить. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    5: "пасхалка для любознательных, вам полагается вкусняшка от разработчика",
    6: "Добавьте теги которые по вашему мнению подходят к записи",
  };

  return (
    <View style={styles.container}>
      {/* 🔼 Верхний слой (i + hint) */}
      <View style={styles.top}>
        {/*<View style={styles.infoWrapper}>*/}
        {showHint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>{hints[step]}</Text>
          </View>
        )}

        <Pressable
          style={styles.info}
          onPress={() => setShowHint((prev) => !prev)}
        >
          <Text style={styles.infoText}>i</Text>
        </Pressable>
        {/*</View>*/}
      </View>

      {/* 🔽 Нижний слой (кнопки) */}
      <View style={styles.bottom}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.backPressed,
          ]}
        >
          <Text style={styles.buttonText}>Назад</Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Следующий шаг</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  // 🔼 верхний слой
  top: {
    alignItems: "flex-end",
    marginBottom: 10,
  },

  //infoWrapper: {
  //alignItems: "center",
  //},

  // 🔽 нижний слой
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // КНОПКА НАЗАД
  //backButton: {
  //backgroundColor: colors.card,
  //paddingVertical: 12,
  //paddingHorizontal: 20,
  //borderRadius: 20,
  //},

  //backText: {
  //color: colors.text,
  //},

  // КНОПКА ВПЕРЁД
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // НАЖАТИЯ
  buttonPressed: {
    opacity: 0.8,
  },

  backPressed: {
    opacity: 0.7,
  },

  // КНОПКА i
  info: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtext,
    justifyContent: "center",
    alignItems: "center",
  },

  infoText: {
    fontSize: 14,
    color: colors.subtext,
  },

  // 🔥 ПОДСКАЗКА (ключевое)
  hintBox: {
    position: "absolute",
    bottom: 40, // 👈 над кнопкой i
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    maxWidth: 200, // 👈 ограничение ширины
  },

  hintText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "left",
  },
});
