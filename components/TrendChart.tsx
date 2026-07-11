"use client";

import ReactECharts from "echarts-for-react";

export function TrendChart({ time, pm25 }: { time: string[]; pm25: (number | null)[] }) {
  const labels = time.map((t) => t.slice(11, 16));

  const option = {
    backgroundColor: "transparent",
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: "#2A3A4C" } },
      axisLabel: { color: "#8593A3", fontFamily: "IBM Plex Mono", fontSize: 10, interval: 5 },
    },
    yAxis: {
      type: "value",
      name: "PM2.5 (µg/m³)",
      nameTextStyle: { color: "#8593A3", fontSize: 10 },
      splitLine: { lineStyle: { color: "#171F2A" } },
      axisLabel: { color: "#8593A3", fontFamily: "IBM Plex Mono", fontSize: 10 },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#121821",
      borderColor: "#2A3A4C",
      textStyle: { color: "#EDF2F7" },
    },
    series: [
      {
        data: pm25,
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#49D3E8", width: 2 },
        areaStyle: { color: "rgba(73,211,232,0.08)" },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 260, width: "100%" }} />;
}
