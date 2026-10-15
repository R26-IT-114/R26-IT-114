import { createContext, useContext, useEffect } from 'react';

export const GamePreviewContext = createContext(null);

export const useGamePreview = (isPreview) => {
  const reportPreview = useContext(GamePreviewContext);
  useEffect(() => {
    reportPreview?.(isPreview);
  }, [isPreview, reportPreview]);
};
