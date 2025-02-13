"use client";

import {useState} from "react";

interface CAGRInputs {
  initialAmount: number;
  finalAmount: number;
  years: number;
  months: number;
}

interface ProjectionInputs {
  investmentType: "lumpsum" | "sip";
  amount: number;
  cagr: number;
  years: number;
}

interface WithdrawalInputs {
  annualWithdrawalRate: number;
  withdrawalYears: number;
}

type CalculatorMode = "cagr" | "projection";

interface YearlyProjection {
  year: number;
  startingCorpus: number;
  annualWithdrawal: number;
  growthAmount: number;
  annualTax: number;
  endingCorpus: number;
  monthlyIncomeBeforeTax: number;
  monthlyIncomeAfterTax: number;
}

function calculateCAGR(
  initialAmount: number,
  finalAmount: number,
  totalYears: number
): number {
  if (totalYears <= 0 || initialAmount <= 0 || finalAmount <= 0) return 0;
  return (Math.pow(finalAmount / initialAmount, 1 / totalYears) - 1) * 100;
}

function calculateLumpsumValue(
  principal: number,
  cagr: number,
  years: number
): number {
  const r = cagr / 100;
  return principal * Math.pow(1 + r, years);
}

function calculateSIPValue(
  monthlyAmount: number,
  cagr: number,
  years: number
): number {
  const monthlyRate = cagr / (12 * 100);
  const months = years * 12;
  return (
    monthlyAmount *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

function calculateTaxAmount(totalGains: number): number {
  const exemptionLimit = 150000; // ₹1.5L exemption on gains
  if (totalGains <= exemptionLimit) return 0;
  return (totalGains - exemptionLimit) * 0.125; // 12.5% tax on gains above exemption
}

function calculateCorpusProjection(
  initialCorpus: number,
  annualWithdrawalPercent: number,
  growthRate: number,
  years: number
): YearlyProjection[] {
  const projection: YearlyProjection[] = [];
  let currentCorpus = initialCorpus;
  const exemptionLimit = 150000; // ₹1.5L annual exemption

  for (let year = 1; year <= years; year++) {
    // Calculate annual withdrawal amount
    const annualWithdrawal = (currentCorpus * annualWithdrawalPercent) / 100;
    const monthlyIncomeBeforeTax = annualWithdrawal / 12;

    // Calculate remaining corpus after annual withdrawal
    const remainingCorpus = currentCorpus - annualWithdrawal;

    // Calculate annual growth on remaining corpus
    const growthAmount = (remainingCorpus * growthRate) / 100;
    const yearEndCorpus = remainingCorpus + growthAmount;

    // Calculate tax on annual withdrawal with one-time exemption
    const taxableAmount = Math.max(0, annualWithdrawal - exemptionLimit);
    const annualTax = taxableAmount * 0.125; // 12.5% tax on amount above exemption
    const monthlyIncomeAfterTax = (annualWithdrawal - annualTax) / 12;

    projection.push({
      year,
      startingCorpus: currentCorpus,
      annualWithdrawal,
      growthAmount,
      annualTax,
      endingCorpus: yearEndCorpus,
      monthlyIncomeBeforeTax,
      monthlyIncomeAfterTax,
    });

    currentCorpus = yearEndCorpus;
  }

  return projection;
}

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
    value: string | number | "lumpsum" | "sip"
  ) => {
    if (field === "investmentType") {
      setProjectionInputs((prev) => ({
        ...prev,
        [field]: value as "lumpsum" | "sip",
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

  const cagr = calculateCAGR(
    cagrInputs.initialAmount,
    cagrInputs.finalAmount,
    cagrInputs.years + cagrInputs.months / 12
  );

  const projectedAmount =
    projectionInputs.investmentType === "lumpsum"
      ? calculateLumpsumValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : calculateSIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        );

  const totalInvestment =
    projectionInputs.investmentType === "lumpsum"
      ? projectionInputs.amount
      : projectionInputs.amount * projectionInputs.years * 12;

  const totalGains = projectedAmount - totalInvestment;

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

          <div className='mt-8 flex justify-center gap-3 sm:gap-4'>
            <button
              onClick={() => setMode("cagr")}
              className={`relative overflow-hidden rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 sm:text-base ${
                mode === "cagr"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 dark:from-indigo-500 dark:to-violet-500 dark:shadow-indigo-500/25 dark:hover:shadow-violet-500/40"
                  : "bg-white/90 text-slate-700 hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}>
              Calculate CAGR
              {mode === "cagr" && (
                <span className='absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-blue-600 to-cyan-600 opacity-50 dark:from-indigo-600 dark:to-violet-600'></span>
              )}
            </button>
            <button
              onClick={() => setMode("projection")}
              className={`relative overflow-hidden rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 sm:text-base ${
                mode === "projection"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 dark:from-indigo-500 dark:to-violet-500 dark:shadow-indigo-500/25 dark:hover:shadow-violet-500/40"
                  : "bg-white/90 text-slate-700 hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}>
              Project Returns
              {mode === "projection" && (
                <span className='absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-blue-600 to-cyan-600 opacity-50 dark:from-indigo-600 dark:to-violet-600'></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8'>
        {mode === "cagr" ? (
          <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
            <div className='grid gap-4 sm:gap-6'>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Initial Investment Amount (₹)
                </label>
                <input
                  type='number'
                  value={cagrInputs.initialAmount || ""}
                  onChange={(e) =>
                    handleCAGRInputChange("initialAmount", e.target.value)
                  }
                  placeholder='Enter initial amount'
                  className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
                  min='0'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Final Amount (₹)
                </label>
                <input
                  type='number'
                  value={cagrInputs.finalAmount || ""}
                  onChange={(e) =>
                    handleCAGRInputChange("finalAmount", e.target.value)
                  }
                  placeholder='Enter final amount'
                  className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
                  min='0'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Years
                  </label>
                  <input
                    type='number'
                    value={cagrInputs.years || ""}
                    onChange={(e) =>
                      handleCAGRInputChange("years", e.target.value)
                    }
                    placeholder='Years'
                    className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    min='0'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Months
                  </label>
                  <input
                    type='number'
                    value={cagrInputs.months || ""}
                    onChange={(e) =>
                      handleCAGRInputChange("months", e.target.value)
                    }
                    placeholder='Months'
                    className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    min='0'
                    max='11'
                  />
                </div>
              </div>

              <div className='mt-6 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-white p-4 dark:from-slate-800 dark:to-slate-900/80'>
                <div className='text-sm text-slate-600 dark:text-slate-400'>
                  Calculated CAGR
                </div>
                <div className='mt-1 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent dark:from-indigo-400 dark:via-fuchsia-400 dark:to-violet-400'>
                  {cagr.toFixed(2)}%
                </div>
                <div className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
                  This is the annualized return rate that represents the
                  geometric progression ratio that provides a constant rate of
                  return over the time period.
                </div>
                <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Initial Amount
                    </div>
                    <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                      ₹{Math.round(cagrInputs.initialAmount).toLocaleString()}
                    </div>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Final Amount
                    </div>
                    <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                      ₹{Math.round(cagrInputs.finalAmount).toLocaleString()}
                    </div>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Total Returns
                    </div>
                    <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                      ₹
                      {Math.round(
                        cagrInputs.finalAmount - cagrInputs.initialAmount
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Total Corpus (Before Tax)
                    </div>
                    <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                      ₹{Math.round(cagrInputs.finalAmount).toLocaleString()}
                    </div>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Tax Amount
                    </div>
                    <div className='mt-1 font-semibold text-red-600 dark:text-red-400'>
                      ₹
                      {Math.round(
                        calculateTaxAmount(
                          cagrInputs.finalAmount - cagrInputs.initialAmount
                        )
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Post-tax Amount
                    </div>
                    <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                      ₹
                      {Math.round(
                        cagrInputs.finalAmount -
                          calculateTaxAmount(
                            cagrInputs.finalAmount - cagrInputs.initialAmount
                          )
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                    <div className='text-sm text-slate-500 dark:text-slate-400'>
                      Investment Period
                    </div>
                    <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                      {Math.round(cagrInputs.years)} Years {cagrInputs.months}{" "}
                      Months
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Main Calculator Section */}
            <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
              <div className='grid gap-3'>
                <div className='flex flex-wrap gap-2'>
                  <button
                    onClick={() =>
                      handleProjectionInputChange("investmentType", "lumpsum")
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      projectionInputs.investmentType === "lumpsum"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm dark:from-indigo-500 dark:to-violet-500"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}>
                    Lumpsum
                  </button>
                  <button
                    onClick={() =>
                      handleProjectionInputChange("investmentType", "sip")
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      projectionInputs.investmentType === "sip"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm dark:from-indigo-500 dark:to-violet-500"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}>
                    Monthly SIP
                  </button>
                </div>

                <div className='grid gap-3 sm:grid-cols-3'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                      {projectionInputs.investmentType === "lumpsum"
                        ? "Lumpsum Amount (₹)"
                        : "Monthly SIP Amount (₹)"}
                    </label>
                    <input
                      type='number'
                      value={projectionInputs.amount || ""}
                      onChange={(e) =>
                        handleProjectionInputChange("amount", e.target.value)
                      }
                      placeholder={
                        projectionInputs.investmentType === "lumpsum"
                          ? "Enter lumpsum amount"
                          : "Enter monthly SIP amount"
                      }
                      className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
                      min='0'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Expected CAGR (%)
                    </label>
                    <input
                      type='number'
                      value={projectionInputs.cagr || ""}
                      onChange={(e) =>
                        handleProjectionInputChange("cagr", e.target.value)
                      }
                      placeholder='Enter expected CAGR'
                      className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
                      min='0'
                      max='100'
                      step='0.1'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Investment Period (Years)
                    </label>
                    <input
                      type='number'
                      value={projectionInputs.years || ""}
                      onChange={(e) =>
                        handleProjectionInputChange("years", e.target.value)
                      }
                      placeholder='Enter investment period'
                      className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
                      min='1'
                      max='50'
                    />
                  </div>
                </div>

                <div className='mt-2 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-white p-3 dark:from-slate-800 dark:to-slate-900/80'>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
                    <div>
                      <div className='text-xs text-slate-600 dark:text-slate-400'>
                        Total Investment
                      </div>
                      <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400'>
                        ₹{Math.round(totalInvestment).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className='text-xs text-slate-600 dark:text-slate-400'>
                        Total Returns
                      </div>
                      <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400'>
                        ₹{Math.round(totalGains).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className='text-xs text-slate-600 dark:text-slate-400'>
                        Total Corpus
                      </div>
                      <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400'>
                        ₹{Math.round(projectedAmount).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className='text-xs text-slate-600 dark:text-slate-400'>
                        Tax Amount
                      </div>
                      <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent dark:from-rose-400 dark:to-red-400'>
                        ₹
                        {Math.round(
                          calculateTaxAmount(totalGains)
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className='text-xs text-slate-600 dark:text-slate-400'>
                        Post-tax Amount
                      </div>
                      <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400'>
                        ₹
                        {Math.round(
                          projectedAmount - calculateTaxAmount(totalGains)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal Projection Section */}
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
                        setWithdrawalInputs((prev) => ({
                          ...prev,
                          annualWithdrawalRate: parseFloat(e.target.value) || 0,
                        }))
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
                        setWithdrawalInputs((prev) => ({
                          ...prev,
                          withdrawalYears: parseFloat(e.target.value) || 0,
                        }))
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
                              Before annual tax
                            </div>
                          </th>
                          <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                            <div>Post-tax Monthly</div>
                            <div className='text-xs font-normal text-slate-500'>
                              After annual tax
                            </div>
                          </th>
                          <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                            <div>Annual Growth</div>
                            <div className='text-xs font-normal text-slate-500'>
                              at {projectionInputs.cagr}% CAGR
                            </div>
                          </th>
                          <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                            <div>Annual Tax</div>
                            <div className='text-xs font-normal text-slate-500'>
                              12.5% above ₹1.5L
                            </div>
                          </th>
                          <th className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400'>
                            <div>Ending Corpus</div>
                            <div className='text-xs font-normal text-slate-500'>
                              After growth & tax
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculateCorpusProjection(
                          projectedAmount,
                          withdrawalInputs.annualWithdrawalRate,
                          projectionInputs.cagr,
                          withdrawalInputs.withdrawalYears
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
                            <td className='whitespace-nowrap px-4 py-3 text-right text-sm text-slate-900 dark:text-slate-100'>
                              ₹
                              {year.monthlyIncomeBeforeTax.toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </td>
                            <td className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-green-500'>
                              ₹
                              {year.monthlyIncomeAfterTax.toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </td>
                            <td className='whitespace-nowrap px-4 py-3 text-right text-sm text-slate-900 dark:text-slate-100'>
                              ₹
                              {year.growthAmount.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className='whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-red-500'>
                              ₹
                              {year.annualTax.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
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
          </div>
        )}
      </div>
    </main>
  );
}
