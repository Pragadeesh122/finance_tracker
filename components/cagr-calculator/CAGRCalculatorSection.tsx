import {CAGRInputs} from "./types";
import {calculateCAGR, calculateTaxAmount} from "./utils";
import TaxToggle from "./TaxToggle";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";

interface CAGRCalculatorSectionProps {
  cagrInputs: CAGRInputs;
  onInputChange: (field: keyof CAGRInputs, value: string | number) => void;
  includeTax: boolean;
  onTaxToggle: (includeTax: boolean) => void;
}

const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
};

export default function CAGRCalculatorSection({
  cagrInputs,
  onInputChange,
  includeTax,
  onTaxToggle,
}: CAGRCalculatorSectionProps) {
  const cagr = calculateCAGR(
    cagrInputs.initialAmount,
    cagrInputs.finalAmount,
    cagrInputs.years + cagrInputs.months / 12
  );

  const totalGains = cagrInputs.finalAmount - cagrInputs.initialAmount;

  // Generate chart data for growth visualization
  const totalYears = cagrInputs.years || 1;
  const chartData = Array.from({ length: totalYears + 1 }, (_, i) => {
    const year = i;
    const value = cagrInputs.initialAmount * Math.pow(1 + cagr / 100, year);
    return {
      year: `Year ${year}`,
      value: Math.round(value),
    };
  });

  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='grid gap-6'>
        <div>
          <label className='block text-sm font-medium text-muted-foreground'>
            Initial Investment Amount (₹)
          </label>
          <input
            type='number'
            value={cagrInputs.initialAmount || ""}
            onChange={(e) => onInputChange("initialAmount", e.target.value)}
            placeholder='Enter initial amount'
            className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
            min='0'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-muted-foreground'>
            Final Amount (₹)
          </label>
          <input
            type='number'
            value={cagrInputs.finalAmount || ""}
            onChange={(e) => onInputChange("finalAmount", e.target.value)}
            placeholder='Enter final amount'
            className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
            min='0'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Years
            </label>
            <input
              type='number'
              value={cagrInputs.years || ""}
              onChange={(e) => onInputChange("years", e.target.value)}
              placeholder='Years'
              className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Months
            </label>
            <input
              type='number'
              value={cagrInputs.months || ""}
              onChange={(e) => onInputChange("months", e.target.value)}
              placeholder='Months'
              className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='0'
              max='11'
            />
          </div>
        </div>

        <TaxToggle includeTax={includeTax} onToggle={onTaxToggle} />

        <div className='mt-6 overflow-hidden rounded-lg bg-secondary/50 p-4 border border-border'>
          <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            Calculated CAGR
          </div>
          <div className='mt-2 font-display text-4xl font-bold text-accent tracking-tight'>
            {cagr.toFixed(2)}%
          </div>
          <div className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
            This is the annualized return rate that represents the geometric
            progression ratio that provides a constant rate of return over the
            time period.
          </div>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
              <div className='text-sm text-muted-foreground'>
                Initial Amount
              </div>
              <div className='mt-1 font-semibold text-foreground'>
                ₹{Math.round(cagrInputs.initialAmount).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
              <div className='text-sm text-muted-foreground'>
                Final Amount
              </div>
              <div className='mt-1 font-semibold text-foreground'>
                ₹{Math.round(cagrInputs.finalAmount).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
              <div className='text-sm text-muted-foreground'>
                Total Returns
              </div>
              <div className='mt-1 font-semibold text-accent'>
                ₹{Math.round(totalGains).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
              <div className='text-sm text-muted-foreground'>
                Total Corpus (Before Tax)
              </div>
              <div className='mt-1 font-semibold text-accent'>
                ₹{Math.round(cagrInputs.finalAmount).toLocaleString()}
              </div>
            </div>
            {includeTax && (
              <>
                <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
                  <div className='text-sm text-muted-foreground'>
                    Tax Amount
                  </div>
                  <div className='mt-1 font-semibold text-destructive'>
                    ₹
                    {Math.round(
                      calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
                <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
                  <div className='text-sm text-muted-foreground'>
                    Post-tax Amount
                  </div>
                  <div className='mt-1 font-semibold text-accent'>
                    ₹
                    {Math.round(
                      cagrInputs.finalAmount -
                        calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
              </>
            )}
            <div className='rounded-lg bg-secondary/30 p-3 border border-border/50'>
              <div className='text-sm text-muted-foreground'>
                Investment Period
              </div>
              <div className='mt-1 font-semibold text-foreground'>
                {Math.round(cagrInputs.years)} Years {cagrInputs.months} Months
              </div>
            </div>
          </div>
        </div>

        {/* Growth Visualization Chart */}
        {cagrInputs.initialAmount > 0 && cagrInputs.finalAmount > 0 && cagrInputs.years > 0 && (
          <div className='mt-6'>
            <h4 className='mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
              Portfolio Growth Over Time
            </h4>
            <ChartContainer config={chartConfig} className='h-[250px] w-full'>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString()}`,
                        "Value"
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  );
}
