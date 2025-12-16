"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StepUpSIPInputs } from "./types";
import {
  calculateStepUpSIP,
  calculateSIPValue,
  formatCurrency,
  bankerRound,
  calculateStepUpSIPYearlyBreakdown
} from "./utils";
import { EnhancedInput } from "./EnhancedInput";
import { CalculatorTypeIcons, InvestmentIcons, IconSizes, IconColors } from "./CalculatorIcons";

interface StepUpSIPSectionProps {
  inputs: StepUpSIPInputs;
  onInputChange: (field: keyof StepUpSIPInputs, value: number) => void;
}

export function StepUpSIPSection({ inputs, onInputChange }: StepUpSIPSectionProps) {
  const [showComparison, setShowComparison] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const stepUpSIPValue = calculateStepUpSIP(
    inputs.initialMonthlyAmount,
    inputs.cagr,
    inputs.years,
    inputs.stepUpPercentage
  );

  const regularSIPValue = calculateSIPValue(
    inputs.initialMonthlyAmount,
    inputs.cagr,
    inputs.years
  );

  const totalInvestmentStepUp = inputs.years > 0 ? (() => {
    let total = 0;
    let currentAmount = inputs.initialMonthlyAmount;
    for (let year = 1; year <= inputs.years; year++) {
      total += currentAmount * 12;
      currentAmount = bankerRound(currentAmount * (1 + inputs.stepUpPercentage / 100));
    }
    return total;
  })() : 0;

  const totalInvestmentRegular = inputs.initialMonthlyAmount * inputs.years * 12;
  const additionalReturns = stepUpSIPValue - regularSIPValue;
  const additionalInvestment = totalInvestmentStepUp - totalInvestmentRegular;

  // Calculate yearly breakdown data
  const breakdownData = calculateStepUpSIPYearlyBreakdown(
    inputs.initialMonthlyAmount,
    inputs.cagr,
    inputs.years,
    inputs.stepUpPercentage
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

  const StepUpIcon = CalculatorTypeIcons.stepUp;
  const SIPIcon = CalculatorTypeIcons.sip;
  const GrowthIcon = InvestmentIcons.growth;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <StepUpIcon className={`${IconSizes.lg} ${IconColors.accent}`} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Step-up SIP Calculator</h3>
            <p className="text-sm text-muted-foreground">Grow your SIP investments annually</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <EnhancedInput
            label="Initial Monthly SIP"
            variant="currency"
            value={inputs.initialMonthlyAmount}
            onChange={(value) => onInputChange("initialMonthlyAmount", value)}
            helperText="Starting monthly investment"
            min={0}
          />

          <EnhancedInput
            label="Expected CAGR"
            variant="percentage"
            value={inputs.cagr}
            onChange={(value) => onInputChange("cagr", value)}
            helperText="Annual growth rate"
            min={0}
            max={100}
            step={0.1}
          />

          <EnhancedInput
            label="Investment Period"
            variant="years"
            value={inputs.years}
            onChange={(value) => onInputChange("years", value)}
            helperText="Total investment years"
            min={1}
            max={50}
          />

          <EnhancedInput
            label="Annual Step-up"
            variant="percentage"
            value={inputs.stepUpPercentage}
            onChange={(value) => onInputChange("stepUpPercentage", value)}
            helperText="Yearly SIP increase"
            min={0}
            max={50}
            step={0.5}
          />
        </div>

        {/* Quick Step-up Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Quick Step-up Selection
          </label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((percentage) => (
              <button
                key={percentage}
                onClick={() => onInputChange("stepUpPercentage", percentage)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  inputs.stepUpPercentage === percentage
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-secondary/30 border border-border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Step-up SIP Final Value
            </div>
            <div className="mt-1 text-2xl font-semibold text-accent">
              {formatCurrency(stepUpSIPValue)}
            </div>
          </div>
          
          <div className="rounded-lg bg-secondary/30 border border-border p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Investment
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(totalInvestmentStepUp)}
            </div>
          </div>
          
          <div className="rounded-lg bg-secondary/30 border border-border p-4">
            <div className="text-sm font-medium text-accent">
              Total Returns
            </div>
            <div className="mt-1 text-2xl font-semibold text-accent">
              {formatCurrency(stepUpSIPValue - totalInvestmentStepUp)}
            </div>
          </div>
        </div>

        {/* Final SIP Amount */}
        {inputs.years > 0 && inputs.stepUpPercentage > 0 && (
          <div className="mt-6 rounded-lg bg-secondary/50 border border-border p-4">
            <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Final Year SIP Amount
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              {formatCurrency(
                inputs.initialMonthlyAmount * Math.pow(1 + inputs.stepUpPercentage / 100, inputs.years - 1)
              )}
              <span className="text-sm font-normal"> per month</span>
            </div>
          </div>
        )}
      </Card>

      {/* Comparison with Regular SIP */}
      {showComparison && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">
              Step-up SIP vs Regular SIP Comparison
            </h4>
            <button
              onClick={() => setShowComparison(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ✕
            </button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <h5 className="font-medium text-slate-700 dark:text-slate-300">Step-up SIP</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Investment:</span>
                  <span className="font-medium">{formatCurrency(totalInvestmentStepUp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Final Value:</span>
                  <span className="font-medium text-muted-foreground">
                    {formatCurrency(stepUpSIPValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Returns:</span>
                  <span className="font-medium text-accent">
                    {formatCurrency(stepUpSIPValue - totalInvestmentStepUp)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-medium text-slate-700 dark:text-slate-300">Regular SIP</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Investment:</span>
                  <span className="font-medium">{formatCurrency(totalInvestmentRegular)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Final Value:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {formatCurrency(regularSIPValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Returns:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {formatCurrency(regularSIPValue - totalInvestmentRegular)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 rounded-lg bg-secondary/50 border border-border p-4">
            <h6 className="font-medium text-foreground mb-2">
              Advantage of Step-up SIP
            </h6>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Additional Investment:</span>
                <div className="font-semibold text-foreground">
                  {formatCurrency(additionalInvestment)}
                </div>
              </div>
              <div>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Additional Returns:</span>
                <div className="font-semibold text-foreground">
                  {formatCurrency(additionalReturns)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Yearly Breakdown */}
      {breakdownData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Step-up SIP Yearly Breakdown
              <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                (Click on years to see monthly details)
              </span>
            </h3>
            <button
              onClick={handleToggleBreakdown}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showBreakdown
                  ? "bg-accent"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
              aria-label={showBreakdown ? "Hide breakdown" : "Show breakdown"}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  showBreakdown ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {showBreakdown && (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Starting Corpus
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Monthly SIP Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Annual Investment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Interest Earned
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Total Interest
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Total Corpus
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {breakdownData
                        .map((row, index) => {
                          // Calculate monthly SIP amount for this year
                          const monthlySIPAmount = inputs.initialMonthlyAmount * Math.pow(1 + inputs.stepUpPercentage / 100, row.year - 1);
                          
                          return [
                            <tr
                              key={index}
                              className="hover:bg-secondary/30 cursor-pointer"
                              onClick={() => handleToggleYear(row.year)}
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                  <svg
                                    className={`h-4 w-4 transform transition-transform duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ${
                                      expandedYears.has(row.year) ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                  <span className="select-none">Year {row.year}</span>
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    ({expandedYears.has(row.year) ? "Hide" : "Show"} months)
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                {formatCurrency(row.startingCorpus)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                {formatCurrency(monthlySIPAmount)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                {formatCurrency(row.investmentAmount)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(row.interestEarned)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-foreground">
                                {formatCurrency(row.cumulativeInterest)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-foreground">
                                {formatCurrency(row.totalCorpus)}
                              </td>
                            </tr>,

                            // Monthly breakdown row (conditional)
                            ...(expandedYears.has(row.year) && row.monthlyBreakdown
                              ? [
                                  <tr key={`monthly-${row.year}`}>
                                    <td colSpan={7} className="px-0 py-0">
                                      <div className="bg-slate-25 dark:bg-slate-800/30">
                                        <table className="w-full">
                                          <thead className="bg-slate-100 dark:bg-slate-700">
                                            <tr>
                                              <th className="px-8 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Month
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Starting Corpus
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Monthly SIP
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Interest Earned
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Total Interest
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Month End Corpus
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 dark:divide-slate-600">
                                            {row.monthlyBreakdown.map((monthRow) => (
                                              <tr
                                                key={`${row.year}-${monthRow.month}`}
                                                className="hover:bg-secondary/20"
                                              >
                                                <td className="whitespace-nowrap px-8 py-2 text-xs text-slate-700 dark:text-slate-300">
                                                  {monthRow.monthName}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                                                  {formatCurrency(monthRow.startingCorpus)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                                                  {formatCurrency(monthRow.investmentAmount)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                  {formatCurrency(monthRow.interestEarned)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-foreground">
                                                  {formatCurrency(monthRow.cumulativeInterest)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                                                  {formatCurrency(monthRow.totalCorpus)}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                ]
                              : [])
                          ];
                        })
                        .flat()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!showBreakdown && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Toggle the switch above to view detailed yearly breakdown
              <span className="block mt-1">
                Step-up SIP monthly breakdown available for detailed analysis
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}