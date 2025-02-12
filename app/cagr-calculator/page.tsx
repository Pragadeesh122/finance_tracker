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

type CalculatorMode = "cagr" | "projection";

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
  const exemptionLimit = 150000;
  if (totalGains <= exemptionLimit) return 0;
  return (totalGains - exemptionLimit) * 0.125; // 12.5% tax on gains above exemption
}

export default function CAGRCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("cagr");
  const [cagrInputs, setCAGRInputs] = useState<CAGRInputs>({
    initialAmount: 10000,
    finalAmount: 20000,
    years: 5,
    months: 0,
  });
  const [projectionInputs, setProjectionInputs] = useState<ProjectionInputs>({
    investmentType: "lumpsum",
    amount: 10000,
    cagr: 12,
    years: 5,
  });

  const handleCAGRInputChange = (
    field: keyof CAGRInputs,
    value: string | number
  ) => {
    setCAGRInputs((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleProjectionInputChange = (
    field: keyof ProjectionInputs,
    value: string | number | "lumpsum" | "sip"
  ) => {
    setProjectionInputs((prev) => ({
      ...prev,
      [field]:
        field === "investmentType"
          ? value
          : typeof value === "string"
          ? parseFloat(value) || 0
          : value,
    }));
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
  const taxAmount = calculateTaxAmount(totalGains);
  const finalAmount = projectedAmount - taxAmount;

  return (
    <main className='min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-8'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='mb-4 text-xl font-bold text-slate-900 dark:text-slate-50 sm:mb-6 sm:text-2xl'>
          Investment Calculator
        </h1>

        <div className='mb-4 flex flex-wrap gap-2 sm:mb-6 sm:gap-4'>
          <button
            onClick={() => setMode("cagr")}
            className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 sm:py-2 sm:text-base ${
              mode === "cagr"
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}>
            Calculate CAGR
          </button>
          <button
            onClick={() => setMode("projection")}
            className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 sm:py-2 sm:text-base ${
              mode === "projection"
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}>
            Project Returns
          </button>
        </div>

        <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6'>
          {mode === "cagr" ? (
            <div className='grid gap-4 sm:gap-6'>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Initial Investment Amount (₹)
                </label>
                <input
                  type='number'
                  value={cagrInputs.initialAmount}
                  onChange={(e) =>
                    handleCAGRInputChange("initialAmount", e.target.value)
                  }
                  className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                  min='0'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Final Amount (₹)
                </label>
                <input
                  type='number'
                  value={cagrInputs.finalAmount}
                  onChange={(e) =>
                    handleCAGRInputChange("finalAmount", e.target.value)
                  }
                  className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
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
                    value={cagrInputs.years}
                    onChange={(e) =>
                      handleCAGRInputChange("years", e.target.value)
                    }
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
                    value={cagrInputs.months}
                    onChange={(e) =>
                      handleCAGRInputChange("months", e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    min='0'
                    max='11'
                  />
                </div>
              </div>

              <div className='mt-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-800'>
                <div className='text-sm text-slate-600 dark:text-slate-400'>
                  Calculated CAGR
                </div>
                <div className='mt-1 text-3xl font-bold text-slate-900 dark:text-slate-50'>
                  {cagr.toFixed(2)}%
                </div>
                <div className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
                  This is the annualized return rate that represents the
                  geometric progression ratio that provides a constant rate of
                  return over the time period.
                </div>
              </div>
            </div>
          ) : (
            <div className='grid gap-4 sm:gap-6'>
              <div className='flex flex-wrap gap-2 sm:gap-4'>
                <button
                  onClick={() =>
                    handleProjectionInputChange("investmentType", "lumpsum")
                  }
                  className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 sm:py-2 sm:text-base ${
                    projectionInputs.investmentType === "lumpsum"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}>
                  Lumpsum
                </button>
                <button
                  onClick={() =>
                    handleProjectionInputChange("investmentType", "sip")
                  }
                  className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 sm:py-2 sm:text-base ${
                    projectionInputs.investmentType === "sip"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}>
                  Monthly SIP
                </button>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                    {projectionInputs.investmentType === "lumpsum"
                      ? "Lumpsum Amount (₹)"
                      : "Monthly SIP Amount (₹)"}
                  </label>
                  <input
                    type='number'
                    value={projectionInputs.amount}
                    onChange={(e) =>
                      handleProjectionInputChange("amount", e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    min='0'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Expected CAGR (%)
                  </label>
                  <input
                    type='number'
                    value={projectionInputs.cagr}
                    onChange={(e) =>
                      handleProjectionInputChange("cagr", e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
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
                    value={projectionInputs.years}
                    onChange={(e) =>
                      handleProjectionInputChange("years", e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    min='1'
                    max='50'
                  />
                </div>
              </div>

              <div className='mt-4 rounded-lg bg-slate-100 p-4 dark:bg-slate-800 sm:mt-6'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Total Investment
                    </div>
                    <div className='mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50'>
                      ₹
                      {totalInvestment.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Total Value
                    </div>
                    <div className='mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50'>
                      ₹
                      {projectedAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Total Returns
                    </div>
                    <div className='mt-1 text-xl font-semibold text-green-500'>
                      ₹
                      {totalGains.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Returns %
                    </div>
                    <div className='mt-1 text-xl font-semibold text-green-500'>
                      {((totalGains / totalInvestment) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Tax Amount
                    </div>
                    <div className='mt-1 text-xl font-semibold text-red-500'>
                      ₹
                      {taxAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Post-tax Returns
                    </div>
                    <div className='mt-1 text-xl font-semibold text-green-500'>
                      ₹
                      {(totalGains - taxAmount).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Final Amount
                    </div>
                    <div className='mt-1 text-xl font-semibold text-green-500'>
                      ₹
                      {finalAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      Post-tax Returns %
                    </div>
                    <div className='mt-1 text-xl font-semibold text-green-500'>
                      {(
                        ((finalAmount - totalInvestment) / totalInvestment) *
                        100
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>
                <div className='mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm'>
                  <div>
                    • Tax calculation assumes LTCG at 12.5% above ₹1.5L
                    exemption limit.
                  </div>
                  <div>
                    • Returns % is calculated based on total investment amount.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
