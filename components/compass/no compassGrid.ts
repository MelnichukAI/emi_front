import {
  COMPASS_GRID_SIZE,
  COMPASS_OUTER_RADIUS,
} from "@/components/compass/constants";

import {
  COMPASS_IMAGE,
} from "@/components/compass/assets";

import type {
  CompassSelectedCell,
} from "@/components/compass/types";

import CompassCell from "@/components/compass/CompassCell";
import CompassAxisLabels from "@/components/compass/CompassAxisLabels";

import { colors } from "@/constants/colors";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  size: number;

  selectedCells: CompassSelectedCell[];

  onToggleCell: (
    valence: number,
    energy: number,
  ) => void;
};

export default function CompassGrid({
  size,
  selectedCells,
  onToggleCell,
}: Props) {
  const cellSize =
    size / COMPASS_GRID_SIZE;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.gridContainer,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <Image
          source={COMPASS_IMAGE}
          resizeMode="cover"
          style={[
            styles.gradientImage,
            {
              borderRadius:
                COMPASS_OUTER_RADIUS,
            },
          ]}
        />

        <View style={styles.grid}>
          {Array.from({
            length:
              COMPASS_GRID_SIZE,
          }).map((_, rowIndex) =>
            Array.from({
              length:
                COMPASS_GRID_SIZE,
            }).map((__, colIndex) => {
              const valence =
                colIndex;

              const energy =
                COMPASS_GRID_SIZE -
                1 -
                rowIndex;

              const selected =
                selectedCells.some(
                  (cell) =>
                    cell.valence ===
                      valence &&
                    cell.energy ===
                      energy,
                );

              return (
                <CompassCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  cellSize={cellSize}
                  gridSize={size}
                  selected={selected}
                  onPress={() =>
                    onToggleCell(
                      valence,
                      energy,
                    )
                  }
                />
              );
            }),
          )}
        </View>
      </View>

      <CompassAxisLabels />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },

  gridContainer: {
    position: "relative",

    overflow: "hidden",

    borderRadius:
      COMPASS_OUTER_RADIUS,

    backgroundColor:
      colors.background,
  },

  gradientImage: {
    ...StyleSheet.absoluteFillObject,

    width: "100%",
    height: "100%",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",

    width: "100%",
    height: "100%",
  },
});