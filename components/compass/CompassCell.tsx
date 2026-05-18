import SelectedCellOverlay from "@/components/compass/SelectedCellOverlay";


import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  row: number;

  col: number;

  cellSize: number;

  gridSize: number;

  selected: boolean;

  onPress: () => void;
};

export default function CompassCell({
  row,
  col,
  cellSize,
  gridSize,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
        },

        pressed &&
          styles.cellPressed,
      ]}
    >
      <View style={styles.innerMask} />

      {selected ? (
        <SelectedCellOverlay
          row={row}
          col={col}
          cellSize={cellSize}
          gridSize={gridSize}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: "relative",

    alignItems: "center",
    justifyContent: "center",
  },

  innerMask: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.5)",

    backgroundColor:
      "rgba(247, 247, 247, 0.5)",
  },

  cellPressed: {
    opacity: 1,
  },
});