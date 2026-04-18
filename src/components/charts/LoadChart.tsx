import React from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReactOriginal from "highcharts-react-official";
import { useQuery } from "@tanstack/react-query";
import { getLoadReadings } from "@/services/readings.api";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const HighchartsReact =
  (HighchartsReactOriginal as any).default || HighchartsReactOriginal;


type LoadReading = {
  timestamp: number;
  power: number;
  voltage?: number;
  current?: number;
};

type Load = {
  loadId: string;
  loadName: string;
  unit?: string;
};

export function LoadChart({ load }: { load: Load }) {
  const { data, isLoading } = useQuery<LoadReading[]>({
    queryKey: ["load-readings", load?.loadId],
    queryFn: () => getLoadReadings(load.loadId),
    refetchInterval: 30000,
    enabled: !!load?.loadId,
  });

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{load?.loadName}</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unit = load.unit || "kW";

  

  const powerData: [number, number][] = [];
  const voltageData: [number, number][] = [];
  const currentData: [number, number][] = [];

  data.forEach((r) => {
    if (r && typeof r.timestamp === "number") {
      if (typeof r.power === "number") {
        powerData.push([r.timestamp, r.power]);
      }
      if (typeof r.voltage === "number") {
        voltageData.push([r.timestamp, r.voltage]);
      }
      if (typeof r.current === "number") {
        currentData.push([r.timestamp, r.current]);
      }
    }
  });

  const options: Highcharts.Options = {
    chart: {
      zooming: { type: "x" },
      panning: { enabled: true, type: "x" },
      panKey: "shift",
    },

    title: { text: "" },

    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      labels: {
        format: "{value:%I:%M:%S %p}",
      },
    },

    
    yAxis: [
      {
        title: { text: `Power (${unit})` },
      },
      {
        title: { text: "Voltage (V)" },
        opposite: true,
      },
      {
        title: { text: "Current (A)" },
        opposite: true,
      },
    ],

    
    legend: {
      enabled: true,
      align: "center",
      verticalAlign: "bottom",
    },

    
    plotOptions: {
      series: {
        events: {
          legendItemClick: function () {
            const visibleSeries = this.chart.series.filter(
              (s) => s.visible
            ).length;

            if (visibleSeries === 1 && this.visible) {
              return false;
            }
          },
        },
      },
    },

    navigator: {
      enabled: true,
      xAxis: {
        labels: {
          format: "{value:%I:%M:%S %p}",
        },
      },
    },

    scrollbar: { enabled: true },

    tooltip: {
      shared: true,
      xDateFormat: "%I:%M:%S %p",
    },

    
    series: [
      {
        type: "line",
        name: `${load.loadName} Power (${unit})`,
        data: powerData,
        yAxis: 0,
        visible: true,
        tooltip: {
          valueSuffix: ` ${unit}`,
        },
      },
      {
        type: "line",
        name: `${load.loadName} Voltage (V)`,
        data: voltageData,
        yAxis: 1,
        visible: true,
        tooltip: {
          valueSuffix: " V",
        },
      },
      {
        type: "line",
        name: `${load.loadName} Current (A)`,
        data: currentData,
        yAxis: 2,
        visible: true,
        tooltip: {
          valueSuffix: " A",
        },
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {load.loadId}
        </CardTitle>
        <CardDescription>Load</CardDescription>
      </CardHeader>

      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart"
        options={options}
      />
    </Card>
  );
}