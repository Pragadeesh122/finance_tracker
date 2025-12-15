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
    <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
        <h3 className='bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-base font-semibold text-transparent dark:from-indigo-400 dark:via-fuchsia-400 dark:to-violet-400'>
          Withdrawal Projection Calculator
        </h3>
        <div className='flex gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
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
              className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
              min='0'
              max='100'
              step='0.1'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
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
              className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
              min='1'
              max='100'
            />
          </div>
        </div>
      </div>

      {withdrawalInputs.annualWithdrawalRate > 0 && (
        <div className='overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700'>
          <div className='min-w-[800px] max-h-[600px] overflow-y-auto'>
            <table className='w-full border-separate border-spacing-0'>
              <thead className='sticky top-0 z-10'>
                <tr className='bg-gradient-to-r from-slate-100 to-slate-50 shadow-sm dark:from-slate-800 dark:to-slate-900'>
                  <th className='sticky left-0 z-20 bg-inherit px-4 py-4 text-left text-sm font-semibold shadow-sm'>
                    <span className='bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400'>
                      Year
                    </span>
                  </th>
                  <th className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300'>
                    <div className='font-semibold'>Starting Corpus</div>
                    <div className='text-xs font-normal text-slate-500 dark:text-slate-400'>
                      Available at start of year
                    </div>
                  </th>
                  <th className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300'>
                    <div className='font-semibold'>Monthly Income</div>
                    <div className='text-xs font-normal text-slate-500 dark:text-slate-400'>
                      {includeTax ? "Before annual tax" : "Monthly withdrawal"}
                    </div>
                  </th>
                  {includeTax && (
                    <th className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      <div className='font-semibold'>Post-tax Monthly</div>
                      <div className='text-xs font-normal text-slate-500 dark:text-slate-400'>
                        After annual tax
                      </div>
                    </th>
                  )}
                  <th className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300'>
                    <div className='font-semibold'>Annual Growth</div>
                    <div className='text-xs font-normal text-slate-500 dark:text-slate-400'>
                      at {projectionInputs.cagr}% CAGR
                    </div>
                  </th>
                  {includeTax && (
                    <th className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      <div className='font-semibold'>Annual Tax</div>
                      <div className='text-xs font-normal text-slate-500 dark:text-slate-400'>
                        12.5% above ₹1.5L
                      </div>
                    </th>
                  )}
                  <th className='whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300'>
                    <div className='font-semibold'>Ending Corpus</div>
                    <div className='text-xs font-normal text-slate-500 dark:text-slate-400'>
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
                          ? "bg-white dark:bg-slate-900"
                          : "bg-slate-50 dark:bg-slate-800/80"
                      }
                      border-b border-slate-100 transition-colors last:border-b-0 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60
                    `}>
                    <td className='sticky left-0 z-10 bg-inherit px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                      {year.year}
                    </td>
                    <td className='whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium text-slate-900 dark:text-slate-100'>
                      ₹
                      {year.startingCorpus.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium ${
                        !includeTax
                          ? "text-green-600 dark:text-green-400"
                          : "text-slate-900 dark:text-slate-100"
                      }`}>
                      ₹
                      {year.monthlyIncomeBeforeTax.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    {includeTax && (
                      <td className='whitespace-nowrap px-4 py-3.5 text-right text-sm font-semibold text-green-600 dark:text-green-400'>
                        ₹
                        {year.monthlyIncomeAfterTax.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    )}
                    <td className='whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium text-slate-900 dark:text-slate-100'>
                      ₹
                      {year.growthAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    {includeTax && (
                      <td className='whitespace-nowrap px-4 py-3.5 text-right text-sm font-semibold text-red-600 dark:text-red-400'>
                        ₹
                        {year.annualTax.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    )}
                    <td className='whitespace-nowrap px-4 py-3.5 text-right text-sm font-bold text-slate-900 dark:text-slate-100'>
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
