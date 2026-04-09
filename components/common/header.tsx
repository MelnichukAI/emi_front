import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Здравствуйте, Мария</Text>
      <Text style={styles.subtext}>Как вы себя чувствуете?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  subtext: {
    marginTop: 6,
    fontSize: 16,
    color: colors.subtext,
  },
});