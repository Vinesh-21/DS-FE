import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useQuery } from "@tanstack/react-query";
import { getSites } from "@/services/sites.api";
import { getGatewaysBySite } from "@/services/gateway.api";
import { getMetersByGateway } from "@/services/meters.api";
import { getLoadsByGateway } from "@/services/loads.api";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { MeterChart } from "./MeterChart";
import { LoadChart } from "./LoadChart";

/* ================= TYPES ================= */

type Site = {
  siteId: string;
  siteName: string;
};

type Gateway = {
  gatewayId: string;
  gatewayName: string;
};

type Load = {
  loadId: string;
  loadName: string;
  loadType: string;
  gatewayId: string;
};

type Meter = {
  meterId: string;
  meterName: string;
};

/* ================= FIX FOR HIGHCHARTS ================= */

const HighchartsReactComponent =
  (HighchartsReact as unknown as { default: typeof HighchartsReact }).default ||
  HighchartsReact;

/* ================= COMPONENT ================= */

export default function Charts() {
  const [siteId, setSiteId] = useState<string | null>(null);
  const [gatewayId, setGatewayId] = useState<string | null>(null);

  /* ================= DATA ================= */

  const { data: sites } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: getSites,
  });

  const effectiveSiteId =
    siteId ?? (sites?.length === 1 ? sites[0].siteId : "");

  const { data: gateways } = useQuery<Gateway[]>({
    queryKey: ["gateways", effectiveSiteId],
    queryFn: () => getGatewaysBySite(effectiveSiteId),
    enabled: !!effectiveSiteId,
  });

  const effectiveGatewayId =
    gatewayId ?? (gateways?.length === 1 ? gateways[0].gatewayId : "");

  const { data: loads } = useQuery<Load[]>({
    queryKey: ["loads", effectiveGatewayId],
    queryFn: () => getLoadsByGateway(effectiveGatewayId),
    enabled: !!effectiveGatewayId,
  });

  const { data: meters } = useQuery<Meter[]>({
    queryKey: ["meters", effectiveGatewayId],
    queryFn: () => getMetersByGateway(effectiveGatewayId),
    enabled: !!effectiveGatewayId,
  });

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* 🔽 Filters */}
      <div className="flex gap-4">
        {/* Site */}
        <Select
          value={effectiveSiteId}
          onValueChange={(val) => {
            setSiteId(val);
            setGatewayId(null);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue
              placeholder={
                sites?.length === 1 ? "Auto Selected" : "Select Site"
              }
            />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sites</SelectLabel>
              {sites?.map((s) => (
                <SelectItem key={s.siteId} value={s.siteId}>
                  {s.siteName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Gateway */}
        <Select
          value={effectiveGatewayId}
          onValueChange={(val) => setGatewayId(val)}
          disabled={!effectiveSiteId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue
              placeholder={
                gateways?.length === 1 ? "Auto Selected" : "Select Gateway"
              }
            />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Gateways</SelectLabel>
              {gateways?.map((g) => (
                <SelectItem key={g.gatewayId} value={g.gatewayId}>
                  {g.gatewayName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      
      {!effectiveGatewayId ? (
        <p>Select Site & Gateway to view charts</p>
      ) : (
        <div className="space-y-8">
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Meters</h2>

            {!meters?.length ? (
              <p>No meters found</p>
            ) : (
              
              <div className="grid grid-cols-2 gap-6">
                {meters.map((meter) => (
                  <MeterChart key={meter.meterId} meter={meter} />
                ))}
              </div>
            )}
          </div>

          
          <div>
            <h2 className="text-lg font-semibold mb-4">Loads</h2>

            {!loads?.length ? (
              <p>No loads found</p>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {loads.map((load) => (
                  <LoadChart key={load.loadId} load={load} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
