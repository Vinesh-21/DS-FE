import { api } from "./api";

export const getGateways = async () => {
  const res = await api.get("/gateways");
  return res.data;
};

export const createGateway = async (data: {
  gatewayId: string;
  gatewayName: string;
  siteId: string;
  status: string;
}) => {
  const res = await api.post("/gateways", data);
  return res.data;
};

export const updateGateway = async ({
  gatewayId,
  data,
}: {
  gatewayId: string;
  data: {
    gatewayName: string;
    siteId: string;
    status: string;
  };
}) => {
  const res = await api.patch(`/gateways/${gatewayId}`, data);
  return res.data;
};

export const deleteGateway = async (gatewayId: string) => {
  const res = await api.delete(`/gateways/${gatewayId}`);
  return res.data;
};

export const getGatewaysBySite = async (siteId: string) => {
  const res = await api.get(`/gateways/site/${siteId}`);
  return res.data;
};