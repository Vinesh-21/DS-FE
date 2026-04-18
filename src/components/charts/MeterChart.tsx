import React from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReactOriginal from "highcharts-react-official";
import { useQuery } from "@tanstack/react-query";
import { getMeterReadings } from "@/services/readings.api";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const HighchartsReact =
  (HighchartsReactOriginal as any).default || HighchartsReactOriginal;

type MeterReading = {
  timestamp: string;
  reading: number;
  unit: string;
};

type Meter = {
  meterId: string;
  meterName: string;
};

export function MeterChart({ meter }: { meter: Meter }) {
  const { data, isLoading } = useQuery<MeterReading[]>({
    queryKey: ["meter-readings", meter?.meterId],
    queryFn: () => getMeterReadings(meter.meterId),
    refetchInterval: 30000,
    enabled: !!meter?.meterId,
  });

  
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{meter?.meterName}</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unit = data[0]?.unit || "";

  
  const seriesData = data.map((r) => [
    new Date(r.timestamp).getTime(),
    r.reading,
  ]);

  
  const options: Highcharts.Options = {
    chart: {
      zooming: {
        type: "x",
      },
    },

    title: { text: "" },

    time: {
      useUTC: false,
    },

    xAxis: {
      type: "datetime",
      title: { text: "Time" },
    },

    yAxis: {
      title: {
        text: unit ? `Reading (${unit})` : "Reading",
      },
    },

    navigator: {
      enabled: true,
    },

    scrollbar: {
      enabled: true,
    },

    tooltip: {
      shared: true,
      xDateFormat: "%H:%M:%S",
    },

    series: [
      {
        type: "line",
        name: `${meter.meterName} (${unit})`,
        data: seriesData,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meter.meterName}</CardTitle>
        <CardDescription>Meter</CardDescription>
      </CardHeader>

      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart"
        options={options}
      />
    </Card>
  );
}
