import { COMPASS_GRID_SIZE } from "../constants";

export const emotionToCompassRenderY = (
  energy: number,
): number => {
  return COMPASS_GRID_SIZE - 1 - energy;
};

export const compassRenderYToEnergy = (
  renderY: number,
): number => {
  return COMPASS_GRID_SIZE - 1 - renderY;
};