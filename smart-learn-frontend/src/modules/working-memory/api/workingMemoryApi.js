import { workingMemoryClient } from '../../../services/axiosInstance';

export const getWorkingMemoryOverview = async () => {
  const { data } = await workingMemoryClient.get('/overview');
  return data;
};
