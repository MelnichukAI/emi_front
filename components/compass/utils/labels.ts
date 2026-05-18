export const getEnergyLabel = (
  energy: number | null,
): string => {
  if (energy === null) {
    return "";
  }

  if (energy <= 1) {
    return "низкая энергия";
  }

  if (energy <= 3) {
    return "средняя энергия";
  }

  return "высокая энергия";
};

export const getValenceLabel = (
  valence: number | null,
): string => {
  if (valence === null) {
    return "";
  }

  if (valence <= 2) {
    return "Негативная эмоция";
  }

  if (valence === 3) {
    return "Нейтральная эмоция";
  }

  return "Позитивная эмоция";
};

export const getEmotionCompassDescription = (
  energy: number | null,
  valence: number | null,
): string => {
  const energyLabel = getEnergyLabel(energy);
  const valenceLabel = getValenceLabel(valence);

  return `${valenceLabel} • ${energyLabel}`;
};