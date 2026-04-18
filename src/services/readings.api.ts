import { api } from "./api";

export const getMeterReadings = async (meterId: string) => {
  const res = await api.get(`/meter-readings/meter/${meterId}`);
  console.log(res?.data);
  return res.data;
};

export const getLoadReadings = async (loadId: string) => {
  const res = await api.get(`/load-readings/load/${loadId}`);
  console.log(res?.data);
  return res.data;
};