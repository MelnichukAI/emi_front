import {
  COMPASS_SELECTION_INSET,
} from "@/components/compass/constants";

import {
  COMPASS_IMAGE,
} from "@/components/compass/assets";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  row: number;

  col: number;

  cellSize: number;

  gridSize: number;
};

export default function SelectedCellOverlay({
  row,
  col,
  cellSize,
  gridSize,
}: Props) {
  console.log("REAL SelectedCellOverlay file loaded");
  const offsetX =
    col * cellSize;

  const offsetY =
    row * cellSize;

  const selectionSize =
    cellSize -
    COMPASS_SELECTION_INSET *
      2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.selection,
        {
          width: selectionSize,
          height: selectionSize,
        },
      ]}
    >
      <Image
        source={COMPASS_IMAGE}
        resizeMode="cover"
        style={{
          position: "absolute",

          width: gridSize,
          height: gridSize,

          left:
            -offsetX -
            COMPASS_SELECTION_INSET,

          top:
            -offsetY -
            COMPASS_SELECTION_INSET,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selection: {
    overflow: "hidden",

    borderRadius: 12,

    shadowColor: "#000",

    shadowOpacity: 0.18,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 5,
  },
});