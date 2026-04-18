import { Site, SiteStatus } from "@/types/common";
import { api } from "./api";

export const getSites = async (): Promise<Site[]> => {
  const res = await api.get("/sites");
  return res.data;
};

export const deleteSites = async (
  siteId: string
): Promise<{ message: string }> => {
  const res = await api.delete(`/sites/${siteId}`);
  return res.data;
};

export const createSite = async (data: {
  siteId: string;
  siteName: string;
  siteLocation: string;
  active: SiteStatus;
}) => {
  const res = await api.post("/sites", data);
  return res.data;
};

export const updateSite = async ({
  siteId,
  data,
}: {
  siteId: string;
  data: {
    siteName: string;
    siteLocation: string;
    active: SiteStatus;
  };
}) => {
  const res = await api.patch(`/sites/${siteId}`, data);
  return res.data;
};