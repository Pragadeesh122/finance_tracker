"use client";

import {useState} from "react";
import {
  CAGRCalculatorSection,
  ProjectionCalculatorSection,
  WithdrawalProjectionSection,
  YearlyInvestmentBreakdownSection,
  CAGRInputs,
  ProjectionInputs,
  WithdrawalInputs,
  CalculatorMode,
  GoalPlanningInputs,
  RetirementPlanningInputs,
  StepUpSIPInputs,
  calculateLumpsumValue,
  calculateSIPValue,
  calculateYearlySIPValue,
} from "../../components/cagr-calculator";
import { StepUpSIPSection } from "../../components/cagr-calculator/StepUpSIPSection";
import { GoalPlanningSection } from "../../components/cagr-calculator/GoalPlanningSection";
import { RetirementPlanningSection } from "../../components/cagr-calculator/RetirementPlanningSection";

export default function CAGRCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("cagr");
  const [cagrInputs, setCAGRInputs] = useState<CAGRInputs>({
    initialAmount: 0,
    finalAmount: 0,
    years: 0,
    months: 0,
  });
  const [projectionInputs, setProjectionInputs] = useState<ProjectionInputs>({
    investmentType: "lumpsum",
    amount: 0,
    cagr: 0,
    years: 0,
  });
  const [withdrawalInputs, setWithdrawalInputs] = useState<WithdrawalInputs>({
    annualWithdrawalRate: 5, // Default to 5% annual withdrawal
    withdrawalYears: 30, // Default to 30 years projection
  });
  const [stepUpSIPInputs, setStepUpSIPInputs] = useState<StepUpSIPInputs>({
    initialMonthlyAmount: 0,
    cagr: 12,
    years: 0,
    stepUpPercentage: 10,
  });
  const [goalPlanningInputs, setGoalPlanningInputs] = useState<GoalPlanningInputs>({
    goalType: "retirement",
    targetAmount: 0,
    currentAge: 30,
    targetAge: 60,
    inflationRate: 6,
    expectedCAGR: 12,
  });
  const [retirementInputs, setRetirementInputs] = useState<RetirementPlanningInputs>({
    currentAge: 30,
    retirementAge: 60,
    currentMonthlyExpenses: 50000,
    inflationRate: 6,
    postRetirementYears: 25,
    expenseReplacement: 80,
    expectedCAGR: 12,
  });
  const [includeTax, setIncludeTax] = useState<boolean>(true);

  const handleCAGRInputChange = (
    field: keyof CAGRInputs,
    value: string | number
  ) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (value === "") {
      setCAGRInputs((prev) => ({
        ...prev,
        [field]: 0,
      }));
    } else {
      setCAGRInputs((prev) => ({
        ...prev,
        [field]: isNaN(numValue) ? 0 : numValue,
      }));
    }
  };

  const handleProjectionInputChange = (
    field: keyof ProjectionInputs,
    value: string | number | "lumpsum" | "sip" | "yearly"
  ) => {
    if (field === "investmentType") {
      setProjectionInputs((prev) => ({
        ...prev,
        [field]: value as "lumpsum" | "sip" | "yearly",
      }));
      return;
    }

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (value === "") {
      setProjectionInputs((prev) => ({
        ...prev,
        [field]: 0,
      }));
    } else {
      setProjectionInputs((prev) => ({
        ...prev,
        [field]: isNaN(numValue) ? 0 : numValue,
      }));
    }
  };

  const handleWithdrawalInputChange = (inputs: Partial<WithdrawalInputs>) => {
    setWithdrawalInputs((prev) => ({
      ...prev,
      ...inputs,
    }));
  };

  const handleStepUpSIPInputChange = (
    field: keyof StepUpSIPInputs,
    value: number
  ) => {
    setStepUpSIPInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoalPlanningInputChange = (
    field: keyof GoalPlanningInputs,
    value: string | number
  ) => {
    setGoalPlanningInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRetirementInputChange = (
    field: keyof RetirementPlanningInputs,
    value: number
  ) => {
    setRetirementInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate projected amount for withdrawal projection
  const projectedAmount =
    projectionInputs.investmentType === "lumpsum"
      ? calculateLumpsumValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : projectionInputs.investmentType === "sip"
      ? calculateSIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : calculateYearlySIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        );

  return (
    <main className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      {/* Hero Section with Enhanced Gradient */}
      <div className='relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-cyan-500/10 py-12 dark:from-indigo-950/50 dark:via-fuchsia-950/30 dark:to-violet-950/50'>
        <div className='absolute inset-0 bg-grid-slate-200/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.7))] dark:bg-grid-slate-800/30'></div>
        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent dark:from-indigo-300 dark:via-fuchsia-300 dark:to-violet-300 sm:text-4xl'>
              Investment Calculator
            </h1>
            <p className='mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base'>
              Calculate CAGR, project returns, and plan your investment
              withdrawals with our comprehensive calculator.
            </p>
          </div>

          <div className='mt-8 flex flex-wrap justify-center gap-2 sm:gap-3'>
            {[
              { key: 'cagr', label: '📊 Calculate CAGR', description: 'Find compound annual growth rate' },
              { key: 'projection', label: '📈 Project Returns', description: 'Calculate future value' },
              { key: 'goal_planning', label: '🎯 Goal Planning', description: 'Plan for specific goals' },
              { key: 'retirement', label: '🏖️ Retirement', description: 'Plan your retirement' },
              { key: 'stepup_sip', label: '📊 Step-up SIP', description: 'SIP with annual increments' }
            ].map((calculator) => (
              <button
                key={calculator.key}
                onClick={() => setMode(calculator.key as CalculatorMode)}
                className={`relative overflow-hidden rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 sm:px-6 sm:text-base ${
                  mode === calculator.key
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 dark:from-indigo-500 dark:to-violet-500 dark:shadow-indigo-500/25 dark:hover:shadow-violet-500/40"
                    : "bg-white/90 text-slate-700 hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}>
                <div className="text-center">
                  <div>{calculator.label}</div>
                  <div className="text-xs opacity-75 mt-1">{calculator.description}</div>
                </div>
                {mode === calculator.key && (
                  <span className='absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-blue-600 to-cyan-600 opacity-50 dark:from-indigo-600 dark:to-violet-600'></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8'>
        {mode === "cagr" && (
          <CAGRCalculatorSection
            cagrInputs={cagrInputs}
            onInputChange={handleCAGRInputChange}
            includeTax={includeTax}
            onTaxToggle={setIncludeTax}
          />
        )}
        
        {mode === "projection" && (
          <div className='space-y-4'>
            <ProjectionCalculatorSection
              projectionInputs={projectionInputs}
              onInputChange={handleProjectionInputChange}
              includeTax={includeTax}
              onTaxToggle={setIncludeTax}
            />

            <YearlyInvestmentBreakdownSection
              projectionInputs={projectionInputs}
            />

            <WithdrawalProjectionSection
              withdrawalInputs={withdrawalInputs}
              onWithdrawalInputChange={handleWithdrawalInputChange}
              projectedAmount={projectedAmount}
              projectionInputs={projectionInputs}
              includeTax={includeTax}
            />
          </div>
        )}

        {mode === "goal_planning" && (
          <GoalPlanningSection
            inputs={goalPlanningInputs}
            onInputChange={handleGoalPlanningInputChange}
          />
        )}

        {mode === "retirement" && (
          <RetirementPlanningSection
            inputs={retirementInputs}
            onInputChange={handleRetirementInputChange}
          />
        )}

        {mode === "stepup_sip" && (
          <StepUpSIPSection
            inputs={stepUpSIPInputs}
            onInputChange={handleStepUpSIPInputChange}
          />
        )}
      </div>
    </main>
  );
}
