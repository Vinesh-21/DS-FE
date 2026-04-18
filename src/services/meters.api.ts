import { api } from "./api";

export const getMetersByGateway = async (gatewayId: string) => {
  const res = await api.get(`/meters/gateway/${gatewayId}`);
  return res.data;
};

export const createMeter = async (data: {
  meterId: string;
  meterName: string;
  meterType: string;
  gatewayId: string;
}) => {
  const res = await api.post("/meters", data);
  return res.data;
};

export const updateMeter = async ({
  meterId,
  data,
}: {
  meterId: string;
  data: {
    meterName: string;
    meterType: string;
    gatewayId: string;
  };
}) => {
  const res = await api.put(`/meters/${meterId}`, data);
  return res.data;
};

export const deleteMeter = async (meterId: string) => {
  const res = await api.delete(`/meters/${meterId}`);
  return res.data;
};
