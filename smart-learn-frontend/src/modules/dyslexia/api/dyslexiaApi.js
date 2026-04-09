import { dyslexiaClient } from '../../../services/axiosInstance';

export const getDyslexiaOverview = async () => {
  const { data } = await dyslexiaClient.get('/overview');
  return data;
};
