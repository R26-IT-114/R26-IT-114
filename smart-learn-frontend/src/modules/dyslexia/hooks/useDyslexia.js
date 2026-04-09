import { useEffect, useState } from 'react';
import { dyslexiaService } from '../services/dyslexiaService';

const useDyslexia = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    dyslexiaService.getOverview().then(setData).catch(() => setData(null));
  }, []);

  return { data };
};

export default useDyslexia;
