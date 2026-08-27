export const getFreeTraceStars = (breakCount) => {
  if (breakCount <= 1) return 3;
  if (breakCount <= 3) return 2;
  return 1;
};

export const getGuidedDrawingStars = (additionalNodesDisplayed, failedAttempts) => {
  if (!additionalNodesDisplayed) return 3;
  return failedAttempts + 1 <= 2 ? 2 : 1;
};
