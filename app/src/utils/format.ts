export const formatDistance = (meters: number): string => {
  if (!meters || meters <= 0) return "-";
  return `${(meters / 1000).toFixed(2)} 公里`;
};

export const formatPace = (runTime: number, runDistance: number): string => {
  if (!runTime || !runDistance || runDistance <= 0) return "-";

  const pace = runTime / (runDistance / 1000);
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${seconds < 10 ? "0" : ""}${seconds}''`;
};