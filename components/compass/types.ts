export type CompassCell = {
  x: number;
  y: number;
};

export type CompassSelectedCell = {
  valence: number;
  energy: number;
};

export type CompassEmotionDescriptor = {
  energyLabel: string;
  valenceLabel: string;
};