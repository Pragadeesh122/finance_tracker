import {useState} from "react";
import {ProjectionInputs} from "./types";
import {calculateYearlyInvestmentBreakdown} from "./utils";

interface YearlyInvestmentBreakdownProps {
  projectionInputs: ProjectionInputs;
}

export default function YearlyInvestmentBreakdownSection({
  projectionInputs,
}: YearlyInvestmentBreakdownProps) {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const breakdownData = calculateYearlyInvestmentBreakdown(
    projectionInputs.investmentType,
    projectionInputs.amount,
    projectionInputs.cagr,
    projectionInputs.years
  );

  const handleToggleBreakdown = () => {
    setShowBreakdown(!showBreakdown);
  };

  const handleToggleYear = (year: number) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  // Don't render if no valid data
  if (breakdownData.length === 0) {
    return null;
  }

  const isSIPInvestment = projectionInputs.investmentType === "sip";

  return (
    <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
          Yearly Investment Breakdown
          {isSIPInvestment && (
            <span className='ml-2 text-sm font-normal text-slate-500 dark:text-slate-400'>
              (Click on years to see monthly details)
            </span>
          )}
        </h3>
        <button
          onClick={handleToggleBreakdown}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            showBreakdown
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-indigo-500 dark:to-violet-500"
              : "bg-slate-200 dark:bg-slate-700"
          }`}
          aria-label={showBreakdown ? "Hide breakdown" : "Show breakdown"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggleBreakdown();
            }
          }}>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              showBreakdown ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {showBreakdown && (
        <div className='overflow-x-auto'>
          <div className='inline-block min-w-full align-middle'>
            <div className='overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700'>
              <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700'>
                <thead className='bg-slate-50 dark:bg-slate-800'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      {isSIPInvestment ? "Year" : "Year"}
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      Starting Corpus
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      Investment Amount
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      Interest Earned
                    </th>
                    {(projectionInputs.investmentType === "sip" ||
                      projectionInputs.investmentType === "yearly") && (
                      <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                        Total Interest
                      </th>
                    )}
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      Total Corpus
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900'>
                  {breakdownData
                    .map((row, index) => [
                      <tr
                        key={index}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isSIPInvestment ? "cursor-pointer" : ""
                        }`}
                        onClick={() =>
                          isSIPInvestment && handleToggleYear(row.year)
                        }>
                        <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100'>
                          <div className='flex items-center gap-2'>
                            {isSIPInvestment && (
                              <svg
                                className={`h-4 w-4 transform transition-transform duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ${
                                  expandedYears.has(row.year) ? "rotate-90" : ""
                                }`}
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M9 5l7 7-7 7'
                                />
                              </svg>
                            )}
                            <span
                              className={isSIPInvestment ? "select-none" : ""}>
                              Year {row.year}
                            </span>
                            {isSIPInvestment && (
                              <span className='text-xs text-slate-400 dark:text-slate-500'>
                                ({expandedYears.has(row.year) ? "Hide" : "Show"}{" "}
                                months)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400'>
                          ₹{Math.round(row.startingCorpus).toLocaleString()}
                        </td>
                        <td className='whitespace-nowrap px-4 py-3 text-sm text-blue-600 dark:text-blue-400'>
                          ₹{Math.round(row.investmentAmount).toLocaleString()}
                        </td>
                        <td className='whitespace-nowrap px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400'>
                          ₹{Math.round(row.interestEarned).toLocaleString()}
                        </td>
                        {(projectionInputs.investmentType === "sip" ||
                          projectionInputs.investmentType === "yearly") && (
                          <td className='whitespace-nowrap px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300'>
                            ₹
                            {Math.round(
                              row.cumulativeInterest
                            ).toLocaleString()}
                          </td>
                        )}
                        <td className='whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                          ₹{Math.round(row.totalCorpus).toLocaleString()}
                        </td>
                      </tr>,

                      // Monthly breakdown row (conditional)
                      ...(isSIPInvestment &&
                      expandedYears.has(row.year) &&
                      row.monthlyBreakdown
                        ? [
                            <tr key={`monthly-${row.year}`}>
                              <td
                                colSpan={
                                  projectionInputs.investmentType === "sip" ||
                                  projectionInputs.investmentType === "yearly"
                                    ? 6
                                    : 5
                                }
                                className='px-0 py-0'>
                                <div className='bg-slate-25 dark:bg-slate-800/30'>
                                  <table className='w-full'>
                                    <thead className='bg-slate-100 dark:bg-slate-700'>
                                      <tr>
                                        <th className='px-8 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                                          Month
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                                          Starting Corpus
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                                          Monthly SIP
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                                          Interest Earned
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                                          Total Interest
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                                          Month End Corpus
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100 dark:divide-slate-600'>
                                      {row.monthlyBreakdown.map((monthRow) => (
                                        <tr
                                          key={`${row.year}-${monthRow.month}`}
                                          className='hover:bg-slate-50 dark:hover:bg-slate-700/50'>
                                          <td className='whitespace-nowrap px-8 py-2 text-xs text-slate-700 dark:text-slate-300'>
                                            {monthRow.monthName}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs text-slate-600 dark:text-slate-400'>
                                            ₹
                                            {Math.round(
                                              monthRow.startingCorpus
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs text-blue-600 dark:text-blue-400'>
                                            ₹
                                            {Math.round(
                                              monthRow.investmentAmount
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400'>
                                            ₹
                                            {Math.round(
                                              monthRow.interestEarned
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                                            ₹
                                            {Math.round(
                                              monthRow.cumulativeInterest
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200'>
                                            ₹
                                            {Math.round(
                                              monthRow.totalCorpus
                                            ).toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>,
                          ]
                        : []),
                    ])
                    .flat()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!showBreakdown && (
        <div className='text-center text-sm text-slate-500 dark:text-slate-400'>
          Toggle the switch above to view detailed yearly breakdown
          {isSIPInvestment && (
            <span className='block mt-1'>
              Monthly SIP breakdown available for detailed analysis
            </span>
          )}
        </div>
      )}
    </div>
  );
}
