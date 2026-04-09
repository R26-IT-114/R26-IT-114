import { dyscalculiaClient } from '../../../services/axiosInstance';

export const getDyscalculiaOverview = async () => {
  const { data } = await dyscalculiaClient.get('/overview');
  return data;
};
