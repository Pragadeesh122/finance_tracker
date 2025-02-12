"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {ChartContainer} from "@/components/ui/chart";

interface CAGRComparisonProps {
  data: {
    name: string;
    oneYear?: string;
    twoYear?: string;
    threeYear?: string;
    fiveYear?: string;
  }[];
}

const chartConfig = {
  oneYear: {
    label: "1 Year",
    color: "hsl(var(--chart-1))",
  },
  twoYear: {
    label: "2 Years",
    color: "hsl(var(--chart-2))",
  },
  threeYear: {
    label: "3 Years",
    color: "hsl(var(--chart-3))",
  },
  fiveYear: {
    label: "5 Years",
    color: "hsl(var(--chart-4))",
  },
};

export function CAGRComparison({data}: CAGRComparisonProps) {
  const chartData = data.map((fund) => ({
    name: fund.name.split(" ").slice(0, 2).join(" "), // First two words of fund name
    "1Y": fund.oneYear ? parseFloat(fund.oneYear) : undefined,
    "2Y": fund.twoYear ? parseFloat(fund.twoYear) : undefined,
    "3Y": fund.threeYear ? parseFloat(fund.threeYear) : undefined,
    "5Y": fund.fiveYear ? parseFloat(fund.fiveYear) : undefined,
  }));

  return (
    <ChartContainer config={chartConfig} className='min-h-[350px] w-full'>
      <BarChart
        data={chartData}
        margin={{top: 20, right: 30, left: 0, bottom: 20}}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis
          dataKey='name'
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={{fontSize: 12}}
          height={60}
          tickMargin={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)}%`]}
          labelStyle={{color: "hsl(var(--foreground))"}}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Legend />
        <Bar
          dataKey='1Y'
          fill='var(--color-oneYear)'
          radius={[4, 4, 0, 0]}
          name='1 Year'
        />
        <Bar
          dataKey='2Y'
          fill='var(--color-twoYear)'
          radius={[4, 4, 0, 0]}
          name='2 Years'
        />
        <Bar
          dataKey='3Y'
          fill='var(--color-threeYear)'
          radius={[4, 4, 0, 0]}
          name='3 Years'
        />
        <Bar
          dataKey='5Y'
          fill='var(--color-fiveYear)'
          radius={[4, 4, 0, 0]}
          name='5 Years'
        />
      </BarChart>
    </ChartContainer>
  );
}
