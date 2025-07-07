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

  const breakdownData = calculateYearlyInvestmentBreakdown(
    projectionInputs.investmentType,
    projectionInputs.amount,
    projectionInputs.cagr,
    projectionInputs.years
  );

  const handleToggleBreakdown = () => {
    setShowBreakdown(!showBreakdown);
  };

  // Don't render if no valid data
  if (breakdownData.length === 0) {
    return null;
  }

  return (
    <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
          Yearly Investment Breakdown
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
                      Year
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
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      Total Corpus
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900'>
                  {breakdownData.map((row) => (
                    <tr
                      key={row.year}
                      className='hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                      <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100'>
                        {row.year}
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
                      <td className='whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                        ₹{Math.round(row.totalCorpus).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!showBreakdown && (
        <div className='text-center text-sm text-slate-500 dark:text-slate-400'>
          Toggle the switch above to view detailed yearly breakdown
        </div>
      )}
    </div>
  );
}
