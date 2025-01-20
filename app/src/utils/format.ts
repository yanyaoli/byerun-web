export const formatDistance = (meters: number): string => {
  if (!meters || meters <= 0 || isNaN(meters)) return "0.00 公里";
  return `${(meters / 1000).toFixed(2)} 公里`;
};

export const formatPace = (runTime: number, runDistance: number): string => {
  if (
    !runTime ||
    !runDistance ||
    runDistance <= 0 ||
    isNaN(runTime) ||
    isNaN(runDistance)
  ) {
    return "0'00''";
  }

  const pace = runTime / (runDistance / 1000);
  if (isNaN(pace) || !isFinite(pace)) {
    return "0'00''";
  }

  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${seconds < 10 ? "0" : ""}${seconds}''`;
};
