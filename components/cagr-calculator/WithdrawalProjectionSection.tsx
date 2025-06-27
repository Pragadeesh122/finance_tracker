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
        <div className='overflow-x-auto'>
          <div className='min-w-[800px]'>
            <table className='w-full border-separate border-spacing-0'>
              <thead>
                <tr className='bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800'>
                  <th className='sticky left-0 bg-inherit px-4 py-3 text-left text-sm font-medium'>
                    <span className='bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400'>
                      Year
                    </span>
                  </th>
                  <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                    <div>Starting Corpus</div>
                    <div className='text-xs font-normal text-slate-500'>
                      Available at start of year
                    </div>
                  </th>
                  <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                    <div>Monthly Income</div>
                    <div className='text-xs font-normal text-slate-500'>
                      {includeTax ? "Before annual tax" : "Monthly withdrawal"}
                    </div>
                  </th>
                  {includeTax && (
                    <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                      <div>Post-tax Monthly</div>
                      <div className='text-xs font-normal text-slate-500'>
                        After annual tax
                      </div>
                    </th>
                  )}
                  <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                    <div>Annual Growth</div>
                    <div className='text-xs font-normal text-slate-500'>
                      at {projectionInputs.cagr}% CAGR
                    </div>
                  </th>
                  {includeTax && (
                    <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                      <div>Annual Tax</div>
                      <div className='text-xs font-normal text-slate-500'>
                        12.5% above ₹1.5L
                      </div>
                    </th>
                  )}
                  <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                    <div>Ending Corpus</div>
                    <div className='text-xs font-normal text-slate-500'>
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
                          ? "bg-white/90 dark:bg-slate-900/90"
                          : "bg-slate-50/90 dark:bg-slate-800/60"
                      }
                      backdrop-blur-sm transition-all hover:bg-gradient-to-r hover:from-slate-50 hover:to-white dark:hover:from-slate-800 dark:hover:to-slate-900
                    `}>
                    <td className='sticky left-0 bg-inherit px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100'>
                      {year.year}
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 text-right text-sm text-slate-900 dark:text-slate-100'>
                      ₹
                      {year.startingCorpus.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right text-sm ${
                        !includeTax
                          ? "text-green-500"
                          : " dark:text-gray-50 text-slate-900"
                      }`}>
                      ₹
                      {year.monthlyIncomeBeforeTax.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    {includeTax && (
                      <td className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-green-500'>
                        ₹
                        {year.monthlyIncomeAfterTax.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    )}
                    <td className='whitespace-nowrap px-4 py-3 text-right text-sm text-slate-900 dark:text-slate-100'>
                      ₹
                      {year.growthAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    {includeTax && (
                      <td className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-red-500'>
                        ₹
                        {year.annualTax.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    )}
                    <td className='whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100'>
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
