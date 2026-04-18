import Highcharts from "highcharts/highstock";
import HighchartsReactOriginal from "highcharts-react-official";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";

const HighchartsReact =
  (HighchartsReactOriginal as any).default || HighchartsReactOriginal;

type LoadReading = {
  voltage: number;
  current: number;
  loadId: string;
  timestamp: number;
  power: number;
};

type Props = {
  data: LoadReading[];
  loadName?: string;
  unit?: string;
};

export function LoadChartFromData({
  data,
  loadName = "Load",
  unit = "kW",
}: Props) {
  /* ================= SAFETY ================= */

  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data</div>;
  }

  /* ================= CLEAN DATA ================= */

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

  if (
    powerData.length === 0 &&
    voltageData.length === 0 &&
    currentData.length === 0
  ) {
    return <div>Invalid data</div>;
  }

  /* ================= OPTIONS ================= */

  const options: Highcharts.Options = {
    chart: {
      zooming: {
        type: "x",
        mouseWheel: { enabled: true },
      },
      panning: {
        enabled: true,
        type: "x",
      },
      panKey: "shift",
    },
    legend: {
  enabled: true,
  align: "center",
  verticalAlign: "bottom",
},

    title: { text: "" },

    time: {
      useUTC: false,
    },

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

    tooltip: {
      shared: true,
      xDateFormat: "%I:%M:%S %p",
    },

    navigator: {
      enabled: true,
      xAxis: {
        labels: {
          format: "{value:%I:%M:%S %p}",
        },
      },
    },

    scrollbar: {
      enabled: true,
    },

    series: [
      {
        type: "line",
        name: `${loadName} Power (${unit})`,
        data: powerData,
        yAxis: 0,
        tooltip: {
          valueSuffix: ` ${unit}`,
        },
      },
      {
        type: "line",
        name: `${loadName} Voltage (V)`,
        data: voltageData,
        yAxis: 1,
        tooltip: {
          valueSuffix: " V",
        },
      },
      {
        type: "line",
        name: `${loadName} Current (A)`,
        data: currentData,
        yAxis: 2,
        tooltip: {
          valueSuffix: " A",
        },
      },
    ],
  };

  /* ================= UI ================= */

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {loadName} {data[0]?.loadId ? `(${data[0].loadId})` : ""}
        </CardTitle>
        <CardDescription>Load Metrics</CardDescription>
      </CardHeader>

      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart"
        options={options}
      />
    </Card>
  );
}