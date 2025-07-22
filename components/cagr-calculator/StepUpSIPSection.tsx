"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StepUpSIPInputs } from "./types";
import { 
  calculateStepUpSIP, 
  calculateSIPValue, 
  formatCurrency, 
  bankerRound 
} from "./utils";

interface StepUpSIPSectionProps {
  inputs: StepUpSIPInputs;
  onInputChange: (field: keyof StepUpSIPInputs, value: number) => void;
}

export function StepUpSIPSection({ inputs, onInputChange }: StepUpSIPSectionProps) {
  const [showComparison, setShowComparison] = useState(true);

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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Step-up SIP Calculator
        </h3>
        
        {/* Input Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Initial Monthly SIP (₹)
            </label>
            <input
              type="number"
              value={inputs.initialMonthlyAmount || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("initialMonthlyAmount", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, numValue)
                );
              }}
              placeholder="Enter initial SIP amount"
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-500/50"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Expected CAGR (%)
            </label>
            <input
              type="number"
              value={inputs.cagr || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("cagr", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue))
                );
              }}
              placeholder="Expected returns"
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-500/50"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Investment Period (Years)
            </label>
            <input
              type="number"
              value={inputs.years || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("years", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(1, Math.min(50, numValue))
                );
              }}
              placeholder="Investment period"
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-500/50"
              min="1"
              max="50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Annual Step-up (%)
            </label>
            <input
              type="number"
              value={inputs.stepUpPercentage || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseFloat(value);
                onInputChange("stepUpPercentage", 
                  value === "" ? 0 : isNaN(numValue) ? 0 : Math.max(0, Math.min(50, numValue))
                );
              }}
              placeholder="Annual increase %"
              className="w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-500/50"
              min="0"
              max="50"
              step="0.5"
            />
          </div>
        </div>

        {/* Quick Step-up Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Quick Step-up Selection
          </label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((percentage) => (
              <button
                key={percentage}
                onClick={() => onInputChange("stepUpPercentage", percentage)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  inputs.stepUpPercentage === percentage
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Step-up SIP Final Value
            </div>
            <div className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">
              {formatCurrency(stepUpSIPValue)}
            </div>
          </div>
          
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Investment
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(totalInvestmentStepUp)}
            </div>
          </div>
          
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              Total Returns
            </div>
            <div className="mt-1 text-2xl font-semibold text-green-700 dark:text-green-300">
              {formatCurrency(stepUpSIPValue - totalInvestmentStepUp)}
            </div>
          </div>
        </div>

        {/* Final SIP Amount */}
        {inputs.years > 0 && inputs.stepUpPercentage > 0 && (
          <div className="mt-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Final Year SIP Amount
            </div>
            <div className="mt-1 text-xl font-semibold text-amber-700 dark:text-amber-300">
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
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {formatCurrency(stepUpSIPValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Returns:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
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
          
          <div className="mt-6 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <h6 className="font-medium text-emerald-700 dark:text-emerald-300 mb-2">
              Advantage of Step-up SIP
            </h6>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Additional Investment:</span>
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(additionalInvestment)}
                </div>
              </div>
              <div>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Additional Returns:</span>
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(additionalReturns)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}