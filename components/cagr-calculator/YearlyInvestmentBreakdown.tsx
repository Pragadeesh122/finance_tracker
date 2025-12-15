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
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-display text-lg font-semibold text-foreground'>
          Yearly Investment Breakdown
          {isSIPInvestment && (
            <span className='ml-2 text-sm font-normal text-muted-foreground'>
              (Click on years to see monthly details)
            </span>
          )}
        </h3>
        <button
          onClick={handleToggleBreakdown}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            showBreakdown
              ? "bg-accent"
              : "bg-secondary"
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
            <div className='overflow-hidden rounded-lg border border-border'>
              <table className='min-w-full divide-y divide-border'>
                <thead className='bg-secondary/50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      {isSIPInvestment ? "Year" : "Year"}
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Starting Corpus
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Investment Amount
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Interest Earned
                    </th>
                    {(projectionInputs.investmentType === "sip" ||
                      projectionInputs.investmentType === "yearly") && (
                      <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        Total Interest
                      </th>
                    )}
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Total Corpus
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border bg-background'>
                  {breakdownData
                    .map((row, index) => [
                      <tr
                        key={index}
                        className={`hover:bg-secondary/30 ${
                          isSIPInvestment ? "cursor-pointer" : ""
                        }`}
                        onClick={() =>
                          isSIPInvestment && handleToggleYear(row.year)
                        }>
                        <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground'>
                          <div className='flex items-center gap-2'>
                            {isSIPInvestment && (
                              <svg
                                className={`h-4 w-4 transform transition-transform duration-200 text-muted-foreground hover:text-foreground ${
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
                              <span className='text-xs text-muted-foreground'>
                                ({expandedYears.has(row.year) ? "Hide" : "Show"}{" "}
                                months)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='whitespace-nowrap px-4 py-3 text-sm text-muted-foreground'>
                          ₹{Math.round(row.startingCorpus).toLocaleString()}
                        </td>
                        <td className='whitespace-nowrap px-4 py-3 text-sm text-foreground'>
                          ₹{Math.round(row.investmentAmount).toLocaleString()}
                        </td>
                        <td className='whitespace-nowrap px-4 py-3 text-sm text-accent'>
                          ₹{Math.round(row.interestEarned).toLocaleString()}
                        </td>
                        {(projectionInputs.investmentType === "sip" ||
                          projectionInputs.investmentType === "yearly") && (
                          <td className='whitespace-nowrap px-4 py-3 text-sm font-semibold text-accent'>
                            ₹
                            {Math.round(
                              row.cumulativeInterest
                            ).toLocaleString()}
                          </td>
                        )}
                        <td className='whitespace-nowrap px-4 py-3 text-sm font-semibold text-foreground'>
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
                                <div className='bg-secondary/20'>
                                  <table className='w-full'>
                                    <thead className='bg-secondary/40'>
                                      <tr>
                                        <th className='px-8 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                          Month
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                          Starting Corpus
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                          Monthly SIP
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                          Interest Earned
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                          Total Interest
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                          Month End Corpus
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className='divide-y divide-border/50'>
                                      {row.monthlyBreakdown.map((monthRow) => (
                                        <tr
                                          key={`${row.year}-${monthRow.month}`}
                                          className='hover:bg-secondary/20'>
                                          <td className='whitespace-nowrap px-8 py-2 text-xs text-foreground'>
                                            {monthRow.monthName}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs text-muted-foreground'>
                                            ₹
                                            {Math.round(
                                              monthRow.startingCorpus
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs text-foreground'>
                                            ₹
                                            {Math.round(
                                              monthRow.investmentAmount
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs text-accent'>
                                            ₹
                                            {Math.round(
                                              monthRow.interestEarned
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs font-medium text-accent'>
                                            ₹
                                            {Math.round(
                                              monthRow.cumulativeInterest
                                            ).toLocaleString()}
                                          </td>
                                          <td className='whitespace-nowrap px-4 py-2 text-xs font-medium text-foreground'>
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
        <div className='text-center text-sm text-muted-foreground'>
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
