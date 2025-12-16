"use client";

import { useState } from "react";
import { FundData, CalculatorInputs, TimePeriod } from "./types";
import { calculateLumpsumValue, calculateSIPValue, calculateTaxAmount } from "./utils";

interface InvestmentCalculatorProps {
  selectedFund: FundData;
  cagrData: {[key in Exclude<TimePeriod, "6M">]?: number};
}

export function InvestmentCalculator({ selectedFund, cagrData }: InvestmentCalculatorProps) {
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    investmentType: "lumpsum",
    amount: 0,
    years: 0,
  });

  if (!selectedFund?.data || !cagrData["Max"]) return null;

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    if (field === "investmentType") {
      setCalculatorInputs((prev) => ({
        ...prev,
        [field]: value as "lumpsum" | "sip",
      }));
      return;
    }

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (value === "") {
      setCalculatorInputs((prev) => ({
        ...prev,
        [field]: 0,
      }));
    } else {
      setCalculatorInputs((prev) => ({
        ...prev,
        [field]: isNaN(numValue) ? 0 : numValue,
      }));
    }
  };

  const projectedValue = calculatorInputs.investmentType === "lumpsum"
    ? calculateLumpsumValue(
        calculatorInputs.amount,
        cagrData["Max"],
        calculatorInputs.years
      )
    : calculateSIPValue(
        calculatorInputs.amount,
        cagrData["Max"],
        calculatorInputs.years
      );

  const totalInvestment = calculatorInputs.investmentType === "lumpsum"
    ? calculatorInputs.amount
    : calculatorInputs.amount * calculatorInputs.years * 12;

  const totalGains = projectedValue - totalInvestment;
  const taxAmount = calculateTaxAmount(totalGains);
  const postTaxAmount = projectedValue - taxAmount;

  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='relative'>
        <h3 className='text-xl font-semibold text-foreground'>
          Investment Calculator
        </h3>
        <div className='mt-6 space-y-6'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => handleInputChange("investmentType", "lumpsum")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                calculatorInputs.investmentType === "lumpsum"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
              }`}>
              Lumpsum
            </button>
            <button
              onClick={() => handleInputChange("investmentType", "sip")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                calculatorInputs.investmentType === "sip"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
              }`}>
              Monthly SIP
            </button>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='group'>
              <label className='mb-2 block text-sm font-medium text-foreground transition-colors group-focus-within:text-accent'>
                {calculatorInputs.investmentType === "lumpsum"
                  ? "Lumpsum Amount (₹)"
                  : "Monthly SIP Amount (₹)"}
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground transition-colors group-focus-within:text-accent'>
                  ₹
                </div>
                <input
                  type='number'
                  value={calculatorInputs.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value);
                    handleInputChange("amount",
                      value === ""
                        ? 0
                        : isNaN(numValue)
                        ? 0
                        : Math.max(0, numValue)
                    );
                  }}
                  placeholder={
                    calculatorInputs.investmentType === "lumpsum"
                      ? "10000"
                      : "5000"
                  }
                  className='block w-full rounded-lg border border-border bg-background pl-9 pr-4 py-3 text-foreground placeholder-muted-foreground/60 transition-all duration-200 hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.05)]'
                  min='0'
                />
              </div>
            </div>
            <div className='group'>
              <label className='mb-2 block text-sm font-medium text-foreground transition-colors group-focus-within:text-accent'>
                Investment Period (Years)
              </label>
              <input
                type='number'
                value={calculatorInputs.years || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  handleInputChange("years",
                    value === ""
                      ? 0
                      : isNaN(numValue)
                      ? 0
                      : Math.max(1, Math.min(50, numValue))
                  );
                }}
                placeholder='5'
                className='block w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground/60 transition-all duration-200 hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.05)]'
                min='1'
                max='50'
              />
            </div>
          </div>

          <div className='rounded-xl bg-secondary/50 border border-border p-6'>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              <div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Expected CAGR
                </div>
                <div className='mt-1.5 text-2xl font-semibold text-foreground'>
                  {cagrData["Max"]?.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Total Investment
                </div>
                <div className='mt-1.5 text-2xl font-semibold text-foreground'>
                  ₹{Math.round(totalInvestment).toLocaleString()}
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Total Returns
                </div>
                <div className='mt-1.5 text-2xl font-semibold text-accent'>
                  ₹{Math.round(totalGains).toLocaleString()}
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Total Corpus (Before Tax)
                </div>
                <div className='mt-1.5 text-2xl font-semibold text-accent'>
                  ₹{Math.round(projectedValue).toLocaleString()}
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Tax Amount
                </div>
                <div className='mt-1.5 text-2xl font-semibold text-red-600 dark:text-red-400'>
                  ₹{Math.round(taxAmount).toLocaleString()}
                </div>
              </div>
              <div>
                <div className='text-sm font-medium text-muted-foreground'>
                  Post-tax Amount
                </div>
                <div className='mt-1.5 text-2xl font-semibold text-accent'>
                  ₹{Math.round(postTaxAmount).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-1 text-xs text-muted-foreground'>
            <div>
              • Tax calculation assumes LTCG at 12.5% on gains above
              ₹1.25L exemption limit.
            </div>
            <div>
              • Returns % is calculated based on total investment
              amount.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}