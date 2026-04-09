import { useEffect, useState } from 'react';
import { dysgraphiaService } from '../services/dysgraphiaService';

const useDysgraphia = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    dysgraphiaService.getOverview().then(setData).catch(() => setData(null));
  }, []);

  return { data };
};

export default useDysgraphia;
