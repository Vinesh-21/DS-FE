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

type MeterReading = {
  meterId: string;
  reading: number;
  unit: string;
  timestamp: number;
};

type Props = {
  data: MeterReading[];
};

export function MeterChartFromData({ data }: Props) {
  /* ================= SAFETY ================= */

  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data</div>;
  }

  /* ================= CLEAN DATA ================= */

  const cleanData: [number, number][] = data
    .filter(
      (r) =>
        r &&
        typeof r.timestamp === "number" &&
        typeof r.reading === "number"
    )
    .map((r) => [r.timestamp, r.reading]);

  if (cleanData.length === 0) {
    return <div>Invalid data</div>;
  }

  const meterId = data[0]?.meterId ?? "Meter";
  const unit = data[0]?.unit ?? "";

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

    title: { text: "" },

    time: {
      useUTC: false, // ✅ match previous component
    },

    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      labels: {
        format: "{value:%I:%M:%S %p}", // ✅ 12-hour format
      },
    },

    yAxis: {
      title: {
        text: unit ? `Reading (${unit})` : "Reading",
      },
    },

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
        name: `${meterId} ${unit ? `(${unit})` : ""}`, // ✅ dynamic legend
        data: cleanData,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meterId}</CardTitle>
        <CardDescription>Meter</CardDescription>
      </CardHeader>

      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart" // ✅ IMPORTANT
        options={options}
        containerProps={{ style: { width: "100%" } }}
      />
    </Card>
  );
}