"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {ChartContainer} from "@/components/ui/chart";

interface NAVData {
  date: string;
  nav: string;
}

interface NAVPerformanceProps {
  data: {
    name: string;
    navData: NAVData[];
  }[];
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

const chartConfig = {
  ppfas: {
    label: "Parag Parikh Flexi Cap",
    color: "hsl(var(--chart-1))",
  },
  quant: {
    label: "Quant Small Cap",
    color: "hsl(var(--chart-2))",
  },
  nippon: {
    label: "Nippon Small Cap",
    color: "hsl(var(--chart-3))",
  },
  mirae: {
    label: "Mirae Large Cap",
    color: "hsl(var(--chart-4))",
  },
  tata: {
    label: "Tata Digital",
    color: "hsl(var(--chart-5))",
  },
};

export function NAVPerformance({data}: NAVPerformanceProps) {
  // Get last year's data only
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Handle empty data case
  if (!data || data.length === 0 || !data[0].navData) {
    return <div>No NAV data available</div>;
  }

  // Process data for the chart
  const processedData = data[0].navData
    .filter((entry) => {
      const entryDate = new Date(entry.date.split("-").reverse().join("-"));
      return entryDate >= oneYearAgo;
    })
    .map((entry) => {
      const dateStr = entry.date;
      const result: ChartDataPoint = {date: dateStr};

      data.forEach((fund) => {
        const fundNav = fund.navData.find((nav) => nav.date === dateStr);
        if (fundNav) {
          result[fund.name] = parseFloat(fundNav.nav);
        }
      });

      return result;
    })
    .reverse(); // Show oldest to newest

  return (
    <ChartContainer config={chartConfig} className='min-h-[350px] w-full'>
      <LineChart
        data={processedData}
        margin={{top: 20, right: 30, left: 0, bottom: 20}}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis
          dataKey='date'
          tickLine={false}
          axisLine={false}
          interval={30}
          tick={{fontSize: 12}}
          tickFormatter={(value) => {
            const [day, month] = value.split("-");
            return `${day}/${month}`;
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toFixed(2)}`]}
          labelFormatter={(label) => {
            const [day, month, year] = label.split("-");
            return `${day}/${month}/${year}`;
          }}
          labelStyle={{color: "hsl(var(--foreground))"}}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Legend />
        {data.map((fund, index) => (
          <Line
            key={fund.name}
            type='monotone'
            dataKey={fund.name}
            stroke={`hsl(var(--chart-${index + 1}))`}
            dot={false}
            name={fund.name.split(" ").slice(0, 2).join(" ")}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
