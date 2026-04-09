import { useEffect, useState } from 'react';
import { dyscalculiaService } from '../services/dyscalculiaService';

const useDyscalculia = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    dyscalculiaService.getOverview().then(setData).catch(() => setData(null));
  }, []);

  return { data };
};

export default useDyscalculia;
