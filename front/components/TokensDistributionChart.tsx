"use client";

import React from "react";
import { Chart } from "react-google-charts";

interface TokensDistributionChartProps {
  data: any;
  chartSlices: any;
}

export const options = {
  chartArea: {
    width: "100%",
    height: "80%",
  },
};
const TokensDistributionChart = ({
  data,
  chartSlices,
}: TokensDistributionChartProps) => {
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={{ ...options, slices: chartSlices }}
      width={"100%"}
      height={"150px"}
    />
  );
};

export default TokensDistributionChart;
