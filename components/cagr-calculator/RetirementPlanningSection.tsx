"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RetirementPlanningInputs } from "./types";
import {
  calculateRetirementCorpus,
  calculateRequiredSIP,
  calculateInflationAdjustedValue,
  formatCurrency
} from "./utils";
import { EnhancedInput } from "./EnhancedInput";
import { CalculatorTypeIcons, GoalIcons, IconSizes, IconColors } from "./CalculatorIcons";

interface RetirementPlanningSectionProps {
  inputs: RetirementPlanningInputs;
  onInputChange: (field: keyof RetirementPlanningInputs, value: number) => void;
}

export function RetirementPlanningSection({ 
  inputs, 
  onInputChange 
}: RetirementPlanningSectionProps) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  
  const requiredCorpus = calculateRetirementCorpus(
    inputs.currentAge,
    inputs.retirementAge,
    inputs.currentMonthlyExpenses,
    inputs.inflationRate,
    inputs.postRetirementYears,
    inputs.expenseReplacement
  );

  const requiredMonthlySIP = yearsToRetirement > 0 ? calculateRequiredSIP(
    requiredCorpus,
    inputs.expectedCAGR,
    yearsToRetirement
  ) : 0;

  const futureMonthlyExpenses = calculateInflationAdjustedValue(
    inputs.currentMonthlyExpenses * (inputs.expenseReplacement / 100),
    inputs.inflationRate,
    yearsToRetirement
  );

  const totalSIPInvestment = requiredMonthlySIP * yearsToRetirement * 12;
  const wealthCreated = requiredCorpus - totalSIPInvestment;

  // Calculate safe withdrawal rate
  const safeWithdrawalRate = Math.max(4 - inputs.inflationRate, 2); // Min 2% real return

  const RetirementIcon = CalculatorTypeIcons.retirement;
  const EmergencyIcon = GoalIcons.emergency;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <RetirementIcon className={`${IconSizes.lg} ${IconColors.accent}`} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Retirement Planning Calculator</h3>
            <p className="text-sm text-muted-foreground">Plan your secure retirement future</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <EnhancedInput
            label="Current Age"
            variant="age"
            value={inputs.currentAge}
            onChange={(value) => onInputChange("currentAge", value)}
            helperText="Your age today"
            min={18}
            max={80}
          />

          <EnhancedInput
            label="Retirement Age"
            variant="age"
            value={inputs.retirementAge}
            onChange={(value) => onInputChange("retirementAge", value)}
            helperText="When you plan to retire"
            min={inputs.currentAge + 5}
            max={75}
          />

          <EnhancedInput
            label="Monthly Expenses"
            variant="currency"
            value={inputs.currentMonthlyExpenses}
            onChange={(value) => onInputChange("currentMonthlyExpenses", value)}
            helperText="Current monthly spending"
            min={0}
          />

          <EnhancedInput
            label="Expense Replacement"
            variant="percentage"
            value={inputs.expenseReplacement}
            onChange={(value) => onInputChange("expenseReplacement", value)}
            helperText="% of expenses after retirement"
            min={50}
            max={120}
          />

          <EnhancedInput
            label="Post-retirement Years"
            variant="years"
            value={inputs.postRetirementYears}
            onChange={(value) => onInputChange("postRetirementYears", value)}
            helperText="Years after retirement"
            min={15}
            max={40}
          />

          <EnhancedInput
            label="Inflation Rate"
            variant="percentage"
            value={inputs.inflationRate}
            onChange={(value) => onInputChange("inflationRate", value)}
            helperText="Expected inflation"
            min={0}
            max={15}
            step={0.1}
          />

          <EnhancedInput
            label="Expected CAGR"
            variant="percentage"
            value={inputs.expectedCAGR}
            onChange={(value) => onInputChange("expectedCAGR", value)}
            helperText="Expected returns"
            min={0}
            max={25}
            step={0.1}
          />
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Quick Expense Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { amount: 30000, label: "₹30K - Basic" },
              { amount: 50000, label: "₹50K - Comfortable" },
              { amount: 75000, label: "₹75K - Good" },
              { amount: 100000, label: "₹1L - Premium" }
            ].map((preset) => (
              <button
                key={preset.amount}
                onClick={() => onInputChange("currentMonthlyExpenses", preset.amount)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  inputs.currentMonthlyExpenses === preset.amount
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {yearsToRetirement > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-lg bg-card border border-border p-4 hover:border-border/80 transition-colors">
              <div className="text-sm font-medium text-muted-foreground">
                Years to Retirement
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {yearsToRetirement}
              </div>
            </div>

            <div className="rounded-lg bg-card border border-border p-4 hover:border-border/80 transition-colors">
              <div className="text-sm font-medium text-muted-foreground">
                Required Corpus
              </div>
              <div className="mt-1 text-xl font-semibold text-foreground">
                {formatCurrency(requiredCorpus)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Target amount
              </div>
            </div>

            <div className="rounded-lg bg-accent/5 border-2 border-accent p-4 hover:bg-accent/10 transition-colors">
              <div className="text-sm font-medium text-accent">
                Required Monthly SIP
              </div>
              <div className="mt-1 text-xl font-semibold text-accent">
                {formatCurrency(requiredMonthlySIP)}
              </div>
              <div className="text-xs text-accent/80 mt-1">
                Start investing
              </div>
            </div>

            <div className="rounded-lg bg-card border border-border p-4 hover:border-border/80 transition-colors">
              <div className="text-sm font-medium text-muted-foreground">
                Future Monthly Expenses
              </div>
              <div className="mt-1 text-xl font-semibold text-foreground">
                {formatCurrency(futureMonthlyExpenses)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Inflation adjusted
              </div>
            </div>
          </div>
        )}

        {/* Investment Summary */}
        {yearsToRetirement > 0 && (
          <div className="rounded-lg bg-accent/5 border border-accent/20 p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-accent">Investment Summary</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Investment</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalSIPInvestment)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Over {yearsToRetirement} years
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wealth Created</div>
                <div className="text-lg font-semibold text-accent">
                  {formatCurrency(wealthCreated)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Power of compounding
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Safe Withdrawal Rate</div>
                <div className="text-lg font-semibold text-foreground">
                  {safeWithdrawalRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Annual withdrawal
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Toggle */}
        <div className="mt-6">
          <button
            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <span>{showDetailedBreakdown ? "▼" : "▶"}</span>
            {showDetailedBreakdown ? "Hide" : "Show"} Detailed Breakdown
          </button>
        </div>
      </Card>

      {/* Detailed Breakdown */}
      {showDetailedBreakdown && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            Retirement Planning Breakdown
          </h4>
          
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <h5 className="font-medium text-slate-700 dark:text-slate-300">Current Scenario</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Current Monthly Expenses:</span>
                    <span className="font-medium">{formatCurrency(inputs.currentMonthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Current Annual Expenses:</span>
                    <span className="font-medium">{formatCurrency(inputs.currentMonthlyExpenses * 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Expense Replacement Needed:</span>
                    <span className="font-medium">{inputs.expenseReplacement}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-slate-700 dark:text-slate-300">At Retirement</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Monthly Expenses (Inflation Adj.):</span>
                    <span className="font-medium">{formatCurrency(futureMonthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Annual Expenses (Inflation Adj.):</span>
                    <span className="font-medium">{formatCurrency(futureMonthlyExpenses * 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Required Corpus:</span>
                    <span className="font-medium text-accent">
                      {formatCurrency(requiredCorpus)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retirement Tips */}
            <div className="mt-6 rounded-lg bg-secondary/50 border border-border p-4">
              <h6 className="font-medium text-foreground mb-2">
                💡 Retirement Planning Tips
              </h6>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Start as early as possible to benefit from compounding</div>
                <div>• Review and increase SIP amount annually with salary increments</div>
                <div>• Consider healthcare inflation (typically higher than general inflation)</div>
                <div>• Plan for emergency fund equivalent to 1-2 years of expenses</div>
                <div>• Diversify investments across equity and debt for retirement portfolio</div>
                <div>• Consider post-retirement income sources like rental income or pensions</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}