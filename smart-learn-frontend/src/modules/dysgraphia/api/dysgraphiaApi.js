import { dysgraphiaClient } from '../../../services/axiosInstance';

export const getDysgraphiaOverview = async () => {
  const { data } = await dysgraphiaClient.get('/overview');
  return data;
};
