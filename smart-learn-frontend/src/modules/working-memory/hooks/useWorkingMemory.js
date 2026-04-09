import { useEffect, useState } from 'react';
import { workingMemoryService } from '../services/workingMemoryService';

const useWorkingMemory = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    workingMemoryService.getOverview().then(setData).catch(() => setData(null));
  }, []);

  return { data };
};

export default useWorkingMemory;
