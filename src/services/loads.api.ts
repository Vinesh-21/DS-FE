import { api } from "./api";

export const getLoadsByGateway = async (gatewayId: string) => {
  const res = await api.get(`/loads/gateway/${gatewayId}`);
  return res.data;
};

export const createLoad = async (data: {
  loadId: string;
  loadName: string;
  loadType: string;
  gatewayId: string;
}) => {
  const res = await api.post("/loads", data);
  return res.data;
};

export const updateLoad = async ({
  loadId,
  data,
}: {
  loadId: string;
  data: {
    loadName: string;
    loadType: string;
    gatewayId: string;
  };
}) => {
  const res = await api.put(`/loads/${loadId}`, data);
  return res.data;
};

export const deleteLoad = async (loadId: string) => {
  const res = await api.delete(`/loads/${loadId}`);
  return res.data;
};
