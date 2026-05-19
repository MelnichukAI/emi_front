import {
  StyleSheet,
  View,
} from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function CompassCard({
  children,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",

    alignItems: "center",
  },

  card: {
    width: "100%",

    maxWidth: 500,

    padding: 18,
  },
});