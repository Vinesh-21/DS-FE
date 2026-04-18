export type SiteStatus = "ONLINE" | "OFFLINE" |"MAINTENANCE"
export type GatewayStatus = "ONLINE" | "OFFLINE" |"MAINTENANCE"

export interface Site {
  id: string
  siteId: string
  siteName: string
  siteLocation: string
  active: SiteStatus
  createdAt: string
  updatedAt: string
}



export interface Gateway {
  id: string;
  gatewayId: string;
  gatewayName: string;
  siteId: string;
  status: GatewayStatus;
}