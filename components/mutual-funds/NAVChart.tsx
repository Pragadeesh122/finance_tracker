"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";
import { FundData, TimePeriod } from "./types";
import { getFilteredData, getCAGR, getMaxDuration } from "./utils";

interface NAVChartProps {
  selectedFund: FundData;
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-lg border border-border bg-card p-3 shadow-lg'>
        <p className='text-sm text-muted-foreground'>{label}</p>
        <p className='mt-1 font-semibold text-foreground'>
          NAV: ₹{payload[0].value?.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function NAVChart({ selectedFund, selectedPeriod, onPeriodChange }: NAVChartProps) {
  const chartData = selectedFund?.data?.navData
    ? getFilteredData(selectedFund.data.navData, selectedPeriod)
        .sort((a, b) => {
          const dateA = new Date(a.date.split("-").reverse().join("-"));
          const dateB = new Date(b.date.split("-").reverse().join("-"));
          return dateA.getTime() - dateB.getTime();
        })
        .map((item) => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }))
    : [];

  const cagrData = selectedFund?.data?.navData
    ? getCAGR(selectedFund.data.navData)
    : {};

  const availablePeriods = [
    "6M",
    "1Y",
    "3Y",
    "5Y",
    "7Y",
    "10Y",
    "15Y",
    "Max",
  ].filter((period) => {
    if (period === "6M" || period === "Max") return true;
    return cagrData[period as keyof typeof cagrData] !== undefined;
  }) as TimePeriod[];

  const maxNav =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.nav))
      : null;
  const minNav =
    chartData.length > 0
      ? Math.min(...chartData.map((item) => item.nav))
      : null;

  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='relative'>
        <div className='mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
              Price Chart
            </div>
            <div className='mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4'>
              <div className='rounded-lg bg-secondary/30 border border-border p-3'>
                <div className='text-sm text-muted-foreground'>
                  Low
                </div>
                <div className='mt-1 font-semibold text-foreground'>
                  {minNav !== null ? `₹${minNav.toFixed(2)}` : "N/A"}
                </div>
              </div>
              <div className='rounded-lg bg-secondary/30 border border-border p-3'>
                <div className='text-sm text-muted-foreground'>
                  High
                </div>
                <div className='mt-1 font-semibold text-foreground'>
                  {maxNav !== null ? `₹${maxNav.toFixed(2)}` : "N/A"}
                </div>
              </div>
              <div className='rounded-lg bg-secondary/30 border border-border p-3'>
                <div className='text-sm text-muted-foreground'>
                  Current
                </div>
                <div className='mt-1 font-semibold text-foreground'>
                  ₹{selectedFund.data.currentNAV}
                </div>
              </div>
              {selectedPeriod !== "6M" && cagrData[selectedPeriod] && (
                <div className='rounded-lg bg-secondary/30 border border-border p-3'>
                  <div className='text-sm text-muted-foreground'>
                    CAGR ({selectedPeriod})
                  </div>
                  <div className='mt-1 font-semibold text-accent'>
                    {cagrData[selectedPeriod]?.toFixed(2)}%
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {availablePeriods.map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}>
                {period === "Max"
                  ? `Max (${getMaxDuration(
                      selectedFund?.data?.navData || []
                    )})`
                  : period}
              </button>
            ))}
          </div>
        </div>

        <div className='h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id='navGradient'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'>
                  <stop
                    offset='5%'
                    stopColor='rgb(16, 185, 129)'
                    stopOpacity={0.2}
                  />
                  <stop
                    offset='95%'
                    stopColor='rgb(16, 185, 129)'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey='date'
                tickFormatter={(date) => {
                  const [, month, year] = date.split("-");
                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  const monthIndex = parseInt(month) - 1;
                  return `${monthNames[monthIndex]} ${year.slice(-2)}`;
                }}
                tick={{fill: "rgb(148, 163, 184)"}}
                tickLine={{stroke: "rgb(148, 163, 184)"}}
                axisLine={{stroke: "rgb(148, 163, 184)"}}
                interval='preserveStartEnd'
                minTickGap={80}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{fill: "rgb(148, 163, 184)"}}
                tickLine={{stroke: "rgb(148, 163, 184)"}}
                axisLine={{stroke: "rgb(148, 163, 184)"}}
                tickFormatter={(value) => `₹${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type='monotone'
                dataKey='nav'
                stroke='rgb(16, 185, 129)'
                strokeWidth={2}
                fill='url(#navGradient)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}