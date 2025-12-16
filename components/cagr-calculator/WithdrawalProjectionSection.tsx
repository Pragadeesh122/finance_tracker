import {WithdrawalInputs, ProjectionInputs} from "./types";
import {calculateCorpusProjection} from "./utils";

interface WithdrawalProjectionSectionProps {
  withdrawalInputs: WithdrawalInputs;
  onWithdrawalInputChange: (inputs: Partial<WithdrawalInputs>) => void;
  projectedAmount: number;
  projectionInputs: ProjectionInputs;
  includeTax: boolean;
}

export default function WithdrawalProjectionSection({
  withdrawalInputs,
  onWithdrawalInputChange,
  projectedAmount,
  projectionInputs,
  includeTax,
}: WithdrawalProjectionSectionProps) {
  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
        <h3 className='font-display text-base font-semibold text-foreground'>
          Withdrawal Projection Calculator
        </h3>
        <div className='flex gap-4'>
          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Annual Withdrawal Rate (%)
            </label>
            <input
              type='number'
              value={withdrawalInputs.annualWithdrawalRate}
              onChange={(e) =>
                onWithdrawalInputChange({
                  annualWithdrawalRate: parseFloat(e.target.value) || 0,
                })
              }
              className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='0'
              max='100'
              step='0.1'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Withdrawal Period (Years)
            </label>
            <input
              type='number'
              value={withdrawalInputs.withdrawalYears}
              onChange={(e) =>
                onWithdrawalInputChange({
                  withdrawalYears: parseFloat(e.target.value) || 0,
                })
              }
              className='mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              min='1'
              max='100'
            />
          </div>
        </div>
      </div>

      {withdrawalInputs.annualWithdrawalRate > 0 && (
        <div className='overflow-x-auto rounded-lg border border-border'>
          <div className='min-w-[800px] max-h-[600px] overflow-y-auto'>
            <table className='w-full border-separate border-spacing-0'>
              <thead className='sticky top-0 z-10'>
                <tr className='bg-secondary/80 backdrop-blur-sm'>
                  <th className='sticky left-0 z-20 bg-inherit px-4 py-5 text-left border-b-2 border-border'>
                    <div className='text-sm font-semibold text-foreground uppercase tracking-wide'>
                      Year
                    </div>
                  </th>
                  <th className='whitespace-nowrap px-4 py-5 text-right border-b-2 border-border'>
                    <div className='text-sm font-semibold text-foreground mb-1'>Starting Corpus</div>
                    <div className='text-xs font-normal text-muted-foreground'>
                      Available at start of year
                    </div>
                  </th>
                  <th className='whitespace-nowrap px-4 py-5 text-right border-b-2 border-border'>
                    <div className='text-sm font-semibold text-foreground mb-1'>Monthly Income</div>
                    <div className='text-xs font-normal text-muted-foreground'>
                      {includeTax ? "Before annual tax" : "Monthly withdrawal"}
                    </div>
                  </th>
                  {includeTax && (
                    <th className='whitespace-nowrap px-4 py-5 text-right border-b-2 border-border'>
                      <div className='text-sm font-semibold text-foreground mb-1'>Post-tax Monthly</div>
                      <div className='text-xs font-normal text-muted-foreground'>
                        After annual tax
                      </div>
                    </th>
                  )}
                  <th className='whitespace-nowrap px-4 py-5 text-right border-b-2 border-border'>
                    <div className='text-sm font-semibold text-foreground mb-1'>Annual Growth</div>
                    <div className='text-xs font-normal text-muted-foreground'>
                      at {projectionInputs.cagr}% CAGR
                    </div>
                  </th>
                  {includeTax && (
                    <th className='whitespace-nowrap px-4 py-5 text-right border-b-2 border-border'>
                      <div className='text-sm font-semibold text-foreground mb-1'>Annual Tax</div>
                      <div className='text-xs font-normal text-muted-foreground'>
                        12.5% above ₹1.5L
                      </div>
                    </th>
                  )}
                  <th className='whitespace-nowrap px-4 py-5 text-right border-b-2 border-border'>
                    <div className='text-sm font-semibold text-foreground mb-1'>Ending Corpus</div>
                    <div className='text-xs font-normal text-muted-foreground'>
                      After growth {includeTax ? "& tax" : ""}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculateCorpusProjection(
                  projectedAmount,
                  withdrawalInputs.annualWithdrawalRate,
                  projectionInputs.cagr,
                  withdrawalInputs.withdrawalYears,
                  includeTax
                ).map((year, index) => (
                  <tr
                    key={year.year}
                    className={`
                      ${
                        index % 2 === 0
                          ? "bg-background"
                          : "bg-secondary/20"
                      }
                      border-b border-border transition-colors last:border-b-0 hover:bg-secondary/30
                    `}>
                    <td className='sticky left-0 z-10 bg-inherit px-4 py-4 text-sm font-semibold text-foreground'>
                      {year.year}
                    </td>
                    <td className='whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-foreground'>
                      ₹
                      {year.startingCorpus.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-4 text-right text-sm font-medium ${
                        !includeTax
                          ? "text-accent"
                          : "text-foreground"
                      }`}>
                      ₹
                      {year.monthlyIncomeBeforeTax.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    {includeTax && (
                      <td className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-accent'>
                        ₹
                        {year.monthlyIncomeAfterTax.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    )}
                    <td className='whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-foreground'>
                      ₹
                      {year.growthAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    {includeTax && (
                      <td className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-destructive'>
                        ₹
                        {year.annualTax.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    )}
                    <td className='whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-foreground'>
                      ₹
                      {year.endingCorpus.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
