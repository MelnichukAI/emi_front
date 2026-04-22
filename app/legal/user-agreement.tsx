import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export default function UserAgreementScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Пользовательское соглашение</Text>

        <Text style={styles.sectionTitle}>1. Общие положения</Text>
        <Text style={styles.paragraph}>
          1.1. Настоящее Пользовательское соглашение (далее - "Соглашение")
          регулирует порядок использования сервиса [название] (далее -
          "Сервис") и является публичной офертой.
        </Text>
        <Text style={styles.paragraph}>
          1.2. Начиная использование Сервиса, Пользователь подтверждает, что
          ознакомился и согласен с условиями Соглашения в полном объеме.
        </Text>
        <Text style={styles.paragraph}>
          1.3. Если Пользователь не согласен с условиями Соглашения, он обязан
          прекратить использование Сервиса.
        </Text>

        <Text style={styles.sectionTitle}>2. Термины</Text>
        <Text style={styles.paragraph}>
          2.1. Пользователь - физическое лицо, использующее Сервис.
        </Text>
        <Text style={styles.paragraph}>
          2.2. Аккаунт - учетная запись Пользователя в Сервисе.
        </Text>
        <Text style={styles.paragraph}>
          2.3. Контент Пользователя - информация, которую Пользователь
          загружает/вводит в Сервис (включая записи дневника, ответы, текстовые
          запросы).
        </Text>

        <Text style={styles.sectionTitle}>3. Предмет соглашения</Text>
        <Text style={styles.paragraph}>
          3.1. Правообладатель предоставляет Пользователю ограниченное,
          неисключительное, отзывное право использования Сервиса для личных
          некоммерческих целей.
        </Text>
        <Text style={styles.paragraph}>
          3.2. Сервис предоставляет инструменты самонаблюдения, ведения
          дневника, анализа состояния и информационные рекомендации, включая
          AI-функции.
        </Text>

        <Text style={styles.sectionTitle}>4. Важное медицинское ограничение</Text>
        <Text style={styles.paragraph}>
          4.1. Сервис и AI-функции не являются медицинской услугой, не ставят
          диагноз и не заменяют консультацию врача/психотерапевта.
        </Text>
        <Text style={styles.paragraph}>
          4.2. Любые рекомендации Сервиса носят справочно-информационный
          характер.
        </Text>
        <Text style={styles.paragraph}>
          4.3. В экстренных состояниях Пользователь обязан обратиться в
          экстренные службы или к профильному специалисту.
        </Text>

        <Text style={styles.sectionTitle}>5. Регистрация и аккаунт</Text>
        <Text style={styles.paragraph}>
          5.1. Для доступа к части функций требуется регистрация и создание
          Аккаунта.
        </Text>
        <Text style={styles.paragraph}>
          5.2. Пользователь обязуется предоставлять достоверные данные и
          поддерживать их актуальность.
        </Text>
        <Text style={styles.paragraph}>
          5.3. Пользователь несет ответственность за сохранность данных для
          входа и за все действия, совершенные через его Аккаунт.
        </Text>
        <Text style={styles.paragraph}>
          5.4. Пользователь обязан немедленно уведомить Правообладателя о
          несанкционированном доступе к Аккаунту.
        </Text>

        <Text style={styles.sectionTitle}>
          6. Права и обязанности Пользователя
        </Text>
        <Text style={styles.paragraph}>
          6.1. Пользователь вправе использовать Сервис в соответствии с
          Соглашением.
        </Text>
        <Text style={styles.paragraph}>6.2. Пользователь обязуется:</Text>
        <Text style={styles.listItem}>
          - не нарушать применимое законодательство;
        </Text>
        <Text style={styles.listItem}>
          - не размещать противоправный, оскорбительный, вредоносный контент;
        </Text>
        <Text style={styles.listItem}>
          - не предпринимать попыток взлома, обхода ограничений или нарушения
          работы Сервиса;
        </Text>
        <Text style={styles.listItem}>
          - не использовать Сервис для рассылки спама, мошенничества и иных
          злоупотреблений.
        </Text>

        <Text style={styles.sectionTitle}>
          7. Права и обязанности Правообладателя
        </Text>
        <Text style={styles.paragraph}>
          7.1. Правообладатель вправе обновлять, изменять, ограничивать или
          прекращать работу отдельных функций Сервиса.
        </Text>
        <Text style={styles.paragraph}>
          7.2. Правообладатель вправе приостанавливать доступ Пользователя в
          случае нарушения Соглашения или требований закона.
        </Text>
        <Text style={styles.paragraph}>
          7.3. Правообладатель вправе направлять сервисные уведомления,
          связанные с работой Сервиса и безопасностью аккаунта.
        </Text>

        <Text style={styles.sectionTitle}>8. Контент Пользователя</Text>
        <Text style={styles.paragraph}>
          8.1. Пользователь сохраняет права на свой Контент.
        </Text>
        <Text style={styles.paragraph}>
          8.2. Пользователь предоставляет Правообладателю право обрабатывать
          Контент в объеме, необходимом для предоставления функционала Сервиса.
        </Text>
        <Text style={styles.paragraph}>
          8.3. Пользователь гарантирует, что обладает правами на размещаемый
          Контент и его размещение не нарушает права третьих лиц.
        </Text>

        <Text style={styles.sectionTitle}>9. AI-функции</Text>
        <Text style={styles.paragraph}>
          9.1. AI-ответы формируются автоматически и могут быть неполными,
          неточными или неактуальными.
        </Text>
        <Text style={styles.paragraph}>
          9.2. Пользователь принимает решение о применении AI-рекомендаций
          самостоятельно и на свой риск.
        </Text>
        <Text style={styles.paragraph}>
          9.3. Для улучшения качества работы могут использоваться обезличенные
          технические данные, если это предусмотрено Политикой
          конфиденциальности.
        </Text>

        <Text style={styles.sectionTitle}>
          10. Персональные данные и конфиденциальность
        </Text>
        <Text style={styles.paragraph}>
          10.1. Обработка персональных данных осуществляется в соответствии с
          Политикой конфиденциальности, являющейся неотъемлемой частью
          Соглашения.
        </Text>
        <Text style={styles.paragraph}>
          10.2. Пользователь подтверждает, что ознакомлен с Политикой
          конфиденциальности до начала использования Сервиса.
        </Text>
        <Text style={styles.paragraph}>
          10.3. При необходимости получения отдельных согласий (например, на
          AI-функции) такие согласия предоставляются Пользователем отдельно в
          интерфейсе Сервиса.
        </Text>

        <Text style={styles.sectionTitle}>
          11. Интеллектуальная собственность
        </Text>
        <Text style={styles.paragraph}>
          11.1. Все исключительные права на Сервис, его код, дизайн, базы
          данных, товарные знаки и иные элементы принадлежат Правообладателю
          или законным правообладателям.
        </Text>
        <Text style={styles.paragraph}>
          11.2. Копирование, модификация, декомпиляция и иное использование
          Сервиса вне условий Соглашения запрещены.
        </Text>

        <Text style={styles.sectionTitle}>12. Ограничение ответственности</Text>
        <Text style={styles.paragraph}>
          12.1. Сервис предоставляется по принципу "как есть" ("as is").
        </Text>
        <Text style={styles.paragraph}>
          12.2. Правообладатель не гарантирует бесперебойную и безошибочную
          работу Сервиса.
        </Text>
        <Text style={styles.paragraph}>
          12.3. Правообладатель не несет ответственности за:
        </Text>
        <Text style={styles.listItem}>
          - сбои, вызванные действиями третьих лиц, операторов связи,
          хостинг-провайдеров;
        </Text>
        <Text style={styles.listItem}>
          - утрату данных, если она вызвана обстоятельствами вне разумного
          контроля;
        </Text>
        <Text style={styles.listItem}>
          - последствия использования Пользователем рекомендаций AI и иных
          материалов Сервиса.
        </Text>

        <Text style={styles.sectionTitle}>13. Срок действия и прекращение</Text>
        <Text style={styles.paragraph}>
          13.1. Соглашение действует с момента акцепта Пользователем и до
          прекращения использования Сервиса.
        </Text>
        <Text style={styles.paragraph}>
          13.2. Пользователь вправе прекратить использование Сервиса и удалить
          Аккаунт в порядке, предусмотренном интерфейсом или через обращение в
          поддержку.
        </Text>
        <Text style={styles.paragraph}>
          13.3. Правообладатель вправе прекратить доступ Пользователя при
          нарушении Соглашения.
        </Text>

        <Text style={styles.sectionTitle}>14. Изменение соглашения</Text>
        <Text style={styles.paragraph}>
          14.1. Правообладатель вправе изменять Соглашение в одностороннем
          порядке.
        </Text>
        <Text style={styles.paragraph}>
          14.2. Новая редакция вступает в силу с момента публикации, если иное
          не указано дополнительно.
        </Text>
        <Text style={styles.paragraph}>
          14.3. Продолжение использования Сервиса после публикации изменений
          означает согласие Пользователя с новой редакцией.
        </Text>

        <Text style={styles.sectionTitle}>15. Применимое право и споры</Text>
        <Text style={styles.paragraph}>
          15.1. К Соглашению применяется право [страна/юрисдикция].
        </Text>
        <Text style={styles.paragraph}>
          15.2. Споры разрешаются путем переговоров, а при недостижении
          соглашения - в суде по месту нахождения Правообладателя, если иное не
          установлено законом.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 6,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 4,
    paddingLeft: 4,
  },
});
