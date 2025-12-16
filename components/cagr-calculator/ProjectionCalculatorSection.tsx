import {ProjectionInputs} from "./types";
import {
  calculateLumpsumValue,
  calculateSIPValue,
  calculateYearlySIPValue,
  calculateTaxAmount,
} from "./utils";
import InvestmentTypeButtons from "./InvestmentTypeButtons";
import TaxToggle from "./TaxToggle";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";

interface ProjectionCalculatorSectionProps {
  projectionInputs: ProjectionInputs;
  onInputChange: (
    field: keyof ProjectionInputs,
    value: string | number | "lumpsum" | "sip" | "yearly"
  ) => void;
  includeTax: boolean;
  onTaxToggle: (includeTax: boolean) => void;
}

const chartConfig = {
  investment: {
    label: "Total Investment",
    color: "hsl(var(--chart-2))",
  },
  returns: {
    label: "Total Corpus",
    color: "hsl(var(--chart-1))",
  },
};

export default function ProjectionCalculatorSection({
  projectionInputs,
  onInputChange,
  includeTax,
  onTaxToggle,
}: ProjectionCalculatorSectionProps) {
  const projectedAmount =
    projectionInputs.investmentType === "lumpsum"
      ? calculateLumpsumValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : projectionInputs.investmentType === "sip"
      ? calculateSIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : calculateYearlySIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        );

  const totalInvestment =
    projectionInputs.investmentType === "lumpsum"
      ? projectionInputs.amount
      : projectionInputs.investmentType === "sip"
      ? projectionInputs.amount * projectionInputs.years * 12
      : projectionInputs.amount * projectionInputs.years;

  const totalGains = projectedAmount - totalInvestment;

  // Generate chart data for growth visualization
  const chartData = Array.from({ length: projectionInputs.years + 1 }, (_, i) => {
    const year = i;
    let yearInvestment = 0;
    let yearCorpus = 0;

    if (projectionInputs.investmentType === "lumpsum") {
      yearInvestment = projectionInputs.amount;
      yearCorpus = calculateLumpsumValue(projectionInputs.amount, projectionInputs.cagr, year);
    } else if (projectionInputs.investmentType === "sip") {
      yearInvestment = projectionInputs.amount * year * 12;
      yearCorpus = calculateSIPValue(projectionInputs.amount, projectionInputs.cagr, year);
    } else {
      yearInvestment = projectionInputs.amount * year;
      yearCorpus = calculateYearlySIPValue(projectionInputs.amount, projectionInputs.cagr, year);
    }

    return {
      year: `Year ${year}`,
      investment: Math.round(yearInvestment),
      returns: Math.round(yearCorpus),
    };
  });

  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='grid gap-6'>
        <InvestmentTypeButtons
          investmentType={projectionInputs.investmentType}
          onTypeChange={(type) => onInputChange("investmentType", type)}
        />

        <TaxToggle includeTax={includeTax} onToggle={onTaxToggle} />

        <div className='grid gap-6 sm:grid-cols-3'>
          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              {projectionInputs.investmentType === "lumpsum"
                ? "Lumpsum Amount (₹)"
                : projectionInputs.investmentType === "sip"
                ? "Monthly SIP Amount (₹)"
                : "Yearly SIP Amount (₹)"}
            </label>
            <input
              type='number'
              value={projectionInputs.amount || ""}
              onChange={(e) => onInputChange("amount", e.target.value)}
              placeholder={
                projectionInputs.investmentType === "lumpsum"
                  ? "Enter lumpsum amount"
                  : projectionInputs.investmentType === "sip"
                  ? "Enter monthly SIP amount"
                  : "Enter yearly SIP amount"
              }
              className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Expected CAGR (%)
            </label>
            <input
              type='number'
              value={projectionInputs.cagr || ""}
              onChange={(e) => onInputChange("cagr", e.target.value)}
              placeholder='Enter expected CAGR'
              className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='0'
              max='100'
              step='0.1'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Investment Period (Years)
            </label>
            <input
              type='number'
              value={projectionInputs.years || ""}
              onChange={(e) => onInputChange("years", e.target.value)}
              placeholder='Enter investment period'
              className='mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='1'
              max='50'
            />
          </div>
        </div>

        <div className='mt-2 overflow-hidden rounded-lg bg-secondary/50 p-4 border border-border'>
          <div
            className={`grid grid-cols-2 gap-4 ${
              includeTax ? "sm:grid-cols-5" : "sm:grid-cols-3"
            }`}>
            <div>
              <div className='text-xs text-muted-foreground uppercase tracking-wide'>
                Total Investment
              </div>
              <div className='mt-1 font-semibold text-foreground'>
                ₹{Math.round(totalInvestment).toLocaleString()}
              </div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground uppercase tracking-wide'>
                Total Returns
              </div>
              <div className='mt-1 font-semibold text-accent'>
                ₹{Math.round(totalGains).toLocaleString()}
              </div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground uppercase tracking-wide'>
                Total Corpus
              </div>
              <div className='mt-1 font-display text-lg font-bold text-accent'>
                ₹{Math.round(projectedAmount).toLocaleString()}
              </div>
            </div>
            {includeTax && (
              <>
                <div>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Tax Amount
                  </div>
                  <div className='mt-1 font-semibold text-destructive'>
                    ₹
                    {Math.round(
                      calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Post-tax Amount
                  </div>
                  <div className='mt-1 font-semibold text-accent'>
                    ₹
                    {Math.round(
                      projectedAmount -
                        calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Investment Growth Visualization Chart */}
        {projectionInputs.amount > 0 && projectionInputs.years > 0 && projectionInputs.cagr > 0 && (
          <div className='mt-6'>
            <h4 className='mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
              Investment Growth Over Time
            </h4>
            <ChartContainer config={chartConfig} className='h-[280px] w-full'>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-returns)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-returns)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-investment)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-investment)" stopOpacity={0}/>
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
                  content={({active, payload}) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }

                    return (
                      <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-lg">
                        <div className="space-y-2">
                          {payload.map((entry, index) => {
                            const label = entry.dataKey === "investment" ? "Total Investment" : "Total Corpus";
                            const value = `₹${Number(entry.value).toLocaleString()}`;
                            const color = entry.color;

                            return (
                              <div key={index} className="flex items-center gap-2.5">
                                <div
                                  className="h-2.5 w-2.5 rounded-sm"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs text-muted-foreground">{label}</span>
                                  <span className="text-sm font-semibold text-foreground">{value}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="investment"
                  stroke="var(--color-investment)"
                  fill="url(#colorInvestment)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="var(--color-returns)"
                  fill="url(#colorReturns)"
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
