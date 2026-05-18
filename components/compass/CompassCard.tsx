import { StyleSheet, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function CompassCard({
  children,
}: Props) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginTop: 0,
    padding: 18,
    borderRadius: 0,
  },
});