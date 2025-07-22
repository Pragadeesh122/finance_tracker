"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GoalPlanningInputs } from "./types";
import { 
  calculateRequiredSIP, 
  calculateRequiredLumpsum,
  calculateYearsToTarget,
  calculateInflationAdjustedValue,
  formatCurrency 
} from "./utils";

interface GoalPlanningSectionProps {
  inputs: GoalPlanningInputs;
  onInputChange: (field: keyof GoalPlanningInputs, value: string | number) => void;
}

export function GoalPlanningSection({ inputs, onInputChange }: GoalPlanningSectionProps) {
  const [calculationMode, setCalculationMode] = useState<'target_to_sip' | 'sip_to_target' | 'lumpsum_to_target'>('target_to_sip');
  const [currentInvestment, setCurrentInvestment] = useState(0);

  // Calculate inflation-adjusted target if it's a future goal
  const yearsToGoal = inputs.targetAge && inputs.currentAge 
    ? inputs.targetAge - inputs.currentAge 
    : 0;

  const inflationAdjustedTarget = yearsToGoal > 0 
    ? calculateInflationAdjustedValue(inputs.targetAmount, inputs.inflationRate, yearsToGoal)
    : inputs.targetAmount;

  // Calculations based on mode
  // Calculate SIP for both current target and inflation-adjusted target
  const requiredMonthlySIPCurrent = calculateRequiredSIP(
    inputs.targetAmount,
    inputs.expectedCAGR,
    yearsToGoal || 1
  );

  const requiredMonthlySIPInflationAdjusted = calculateRequiredSIP(
    inflationAdjustedTarget,
    inputs.expectedCAGR,
    yearsToGoal || 1
  );

  // Calculate Lumpsum for both scenarios
  const requiredLumpsumCurrent = calculateRequiredLumpsum(
    inputs.targetAmount,
    inputs.expectedCAGR,
    yearsToGoal || 1
  );

  const requiredLumpsumInflationAdjusted = calculateRequiredLumpsum(
    inflationAdjustedTarget,
    inputs.expectedCAGR,
    yearsToGoal || 1
  );

  const yearsToReachTarget = currentInvestment > 0 
    ? calculateYearsToTarget(currentInvestment, inflationAdjustedTarget, inputs.expectedCAGR)
    : 0;

  // Goal-specific suggestions
  const getGoalSuggestions = () => {
    switch (inputs.goalType) {
      case 'retirement':
        return {
          suggestedAmount: inputs.currentMonthlyExpenses ? inputs.currentMonthlyExpenses * 300 : 50000000, // 25 years of expenses
          description: "Typically need 25x annual expenses for retirement",
          inflationRate: 6
        };
      case 'education':
        return {
          suggestedAmount: 5000000, // 50L for good education
          description: "Average cost for premium education in India",
          inflationRate: 8
        };
      case 'house':
        return {
          suggestedAmount: 10000000, // 1 Cr for house
          description: "Average cost for 3BHK in metro cities",
          inflationRate: 5
        };
      case 'car':
        return {
          suggestedAmount: 1500000, // 15L for car
          description: "Premium car purchase goal",
          inflationRate: 4
        };
      default:
        return {
          suggestedAmount: 1000000,
          description: "Custom financial goal",
          inflationRate: 6
        };
    }
  };

  const suggestions = getGoalSuggestions();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Goal-based Financial Planning
        </h3>
        
        {/* Goal Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
            Select Your Goal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { key: 'retirement', label: '🏖️ Retirement' },
              { key: 'education', label: '🎓 Education' },
              { key: 'house', label: '🏠 House' },
              { key: 'car', label: '🚗 Car' },
              { key: 'custom', label: '🎯 Custom' }
            ].map((goal) => (
              <button
                key={goal.key}
                onClick={() => {
                  onInputChange('goalType', goal.key as GoalPlanningInputs['goalType']);
                  // Auto-fill suggestion
                  if (goal.key !== 'custom') {
                    onInputChange('targetAmount', suggestions.suggestedAmount);
                    onInputChange('inflationRate', suggestions.inflationRate);
                  }
                }}
                className={`rounded-lg p-3 text-sm font-medium transition-all duration-200 ${
                  inputs.goalType === goal.key
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
            What do you want to calculate?
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCalculationMode('target_to_sip')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                calculationMode === 'target_to_sip'
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Required SIP
            </button>
            <button
              onClick={() => setCalculationMode('lumpsum_to_target')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                calculationMode === 'lumpsum_to_target'
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Required Lumpsum
            </button>
            <button
              onClick={() => setCalculationMode('sip_to_target')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                calculationMode === 'sip_to_target'
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Years to Goal
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              {inputs.goalType === 'custom' ? 'Target Amount (₹)' : `${suggestions.description} (₹)`}
            </label>
            <input
              type="number"
              value={inputs.targetAmount || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("targetAmount", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, numValue)
                );
              }}
              placeholder="Enter target amount in today's value"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              min="0"
            />
          </div>
          
          {(inputs.goalType === 'retirement' || inputs.currentAge !== undefined) && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Current Age
                </label>
                <input
                  type="number"
                  value={inputs.currentAge || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value);
                    onInputChange("currentAge", 
                      value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue))
                    );
                  }}
                  placeholder="Enter your current age"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Target Age
                </label>
                <input
                  type="number"
                  value={inputs.targetAge || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value);
                    onInputChange("targetAge", 
                      value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue))
                    );
                  }}
                  placeholder="Goal achievement age"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  min="0"
                  max="100"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Expected CAGR (%)
            </label>
            <input
              type="number"
              value={inputs.expectedCAGR || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("expectedCAGR", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, numValue)
                );
              }}
              placeholder="Enter expected annual returns"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              min="0"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Inflation Rate (%)
            </label>
            <input
              type="number"
              value={inputs.inflationRate || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("inflationRate", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(-100, Math.min(100, numValue))
                );
              }}
              placeholder="Enter expected inflation rate"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              min="-100"
              max="100"
              step="0.1"
            />
          </div>

          {calculationMode === 'sip_to_target' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Current Monthly Investment (₹)
              </label>
              <input
                type="number"
                value={currentInvestment || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  setCurrentInvestment(
                    value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, numValue)
                  );
                }}
                placeholder="Enter your current SIP amount"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                min="0"
              />
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Time and Target Information */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {yearsToGoal > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Time to Goal
                </div>
                <div className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">
                  {yearsToGoal} years
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  From age {inputs.currentAge} to {inputs.targetAge}
                </div>
              </div>
            )}
            
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 dark:bg-slate-800/50 dark:border-slate-700">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Target Amount (Today&apos;s Value)
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(inputs.targetAmount)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Current purchasing power
              </div>
            </div>

            {yearsToGoal > 0 && inputs.targetAmount !== inflationAdjustedTarget && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 dark:bg-orange-900/20 dark:border-orange-800">
                <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Future Value Needed
                </div>
                <div className="mt-1 text-2xl font-semibold text-orange-700 dark:text-orange-300">
                  {formatCurrency(inflationAdjustedTarget)}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  After {yearsToGoal} years of {inputs.inflationRate}% inflation
                </div>
              </div>
            )}
          </div>

          {/* Calculation Results */}
          <div className="space-y-4">
            {/* Explanation when showing dual calculations */}
            {((calculationMode === 'target_to_sip' || calculationMode === 'lumpsum_to_target') && 
              yearsToGoal > 0 && inputs.inflationRate > 0 && inputs.targetAmount !== inflationAdjustedTarget) && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">📊 Dual Calculation:</span> We show both scenarios - 
                  investing for today&apos;s target value vs. inflation-adjusted future value. 
                  Choose based on whether you expect costs to rise with inflation.
                </div>
              </div>
            )}
          
          {calculationMode === 'target_to_sip' && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  SIP for Current Target Value
                </div>
                <div className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(requiredMonthlySIPCurrent)}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  For {formatCurrency(inputs.targetAmount)} goal
                </div>
              </div>
              
              {yearsToGoal > 0 && inputs.inflationRate > 0 && inputs.targetAmount !== inflationAdjustedTarget && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                  <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    SIP for Inflation-Adjusted Goal
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-300">
                    {formatCurrency(requiredMonthlySIPInflationAdjusted)}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    For {formatCurrency(inflationAdjustedTarget)} future value
                  </div>
                </div>
              )}
            </div>
          )}
          
          {calculationMode === 'lumpsum_to_target' && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <div className="rounded-lg bg-violet-50 border border-violet-200 p-4 dark:bg-violet-900/20 dark:border-violet-800">
                <div className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  Lumpsum for Current Target
                </div>
                <div className="mt-1 text-2xl font-semibold text-violet-700 dark:text-violet-300">
                  {formatCurrency(requiredLumpsumCurrent)}
                </div>
                <div className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                  For {formatCurrency(inputs.targetAmount)} goal
                </div>
              </div>
              
              {yearsToGoal > 0 && inputs.inflationRate > 0 && inputs.targetAmount !== inflationAdjustedTarget && (
                <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 dark:bg-indigo-900/20 dark:border-indigo-800">
                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Lumpsum for Inflation-Adjusted Goal
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
                    {formatCurrency(requiredLumpsumInflationAdjusted)}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    For {formatCurrency(inflationAdjustedTarget)} future value
                  </div>
                </div>
              )}
            </div>
          )}
          
          {calculationMode === 'sip_to_target' && currentInvestment > 0 && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <div className="rounded-lg bg-cyan-50 border border-cyan-200 p-4 dark:bg-cyan-900/20 dark:border-cyan-800">
                <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  Years to Current Target
                </div>
                <div className="mt-1 text-2xl font-semibold text-cyan-700 dark:text-cyan-300">
                  {calculateYearsToTarget(currentInvestment, inputs.targetAmount, inputs.expectedCAGR)} years
                </div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                  With ₹{currentInvestment.toLocaleString()} monthly SIP
                </div>
              </div>
              
              {yearsToGoal > 0 && inputs.inflationRate > 0 && inputs.targetAmount !== inflationAdjustedTarget && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 dark:bg-rose-900/20 dark:border-rose-800">
                  <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
                    Years to Inflation-Adjusted Goal
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-rose-700 dark:text-rose-300">
                    {yearsToReachTarget} years
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    For inflation-adjusted target
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Goal-specific Tips */}
        <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-3">
            💡 Smart Planning Tips
          </h5>
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
            {inputs.goalType === 'retirement' && (
              <>
                <div>• Start investing early to leverage the power of compounding</div>
                <div>• Factor in inflation&apos;s impact on future expenses</div>
                <div>• Plan for 25-30 years of post-retirement life</div>
                <div>• Review and increase SIP amounts with salary increments</div>
              </>
            )}
            {inputs.goalType === 'education' && (
              <>
                <div>• Education costs typically rise faster than general inflation</div>
                <div>• Start planning when your child is young for better corpus building</div>
                <div>• Consider both tuition fees and living expenses</div>
                <div>• Look into education-specific tax benefits</div>
              </>
            )}
            {inputs.goalType === 'house' && (
              <>
                <div>• Property prices vary significantly by location and development</div>
                <div>• Factor in additional costs like registration and taxes (8-12%)</div>
                <div>• Keep down payment ready (20-30% of property value)</div>
                <div>• Consider home loan eligibility and interest rates</div>
              </>
            )}
            {inputs.goalType === 'car' && (
              <>
                <div>• Cars are depreciating assets, plan accordingly</div>
                <div>• Consider insurance, maintenance, and fuel costs</div>
                <div>• Evaluate loan vs cash purchase based on investment returns</div>
              </>
            )}
            {inputs.goalType === 'custom' && (
              <>
                <div>• Define specific and measurable financial goals</div>
                <div>• Consider inflation impact for long-term goals</div>
                <div>• Review and adjust your plan annually</div>
                <div>• Diversify investments based on time horizon</div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}