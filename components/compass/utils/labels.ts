export const getEnergyLabel = (
  energy: number | null,
): string => {
  if (energy === null) {
    return "Неизвестная энергия";
  }

  if (energy <= 1) {
    return "Низкая энергия";
  }

  if (energy <= 3) {
    return "Средняя энергия";
  }

  return "Высокая энергия";
};

export const getValenceLabel = (
  valence: number | null,
): string => {
  if (valence === null) {
    return "нейтральная";
  }

  if (valence <= 1) {
    return "негативная";
  }

  if (valence <= 3) {
    return "нейтральная";
  }

  return "позитивная";
};

export const getEmotionCompassDescription = (
  energy: number | null,
  valence: number | null,
): string => {
  const energyLabel = getEnergyLabel(energy);
  const valenceLabel = getValenceLabel(valence);

  return `${energyLabel} • ${valenceLabel}`;
};