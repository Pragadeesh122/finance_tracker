import {YearlyProjection} from "./types";

export function calculateCAGR(
  initialAmount: number,
  finalAmount: number,
  totalYears: number
): number {
  if (totalYears <= 0 || initialAmount <= 0 || finalAmount <= 0) return 0;
  return (Math.pow(finalAmount / initialAmount, 1 / totalYears) - 1) * 100;
}

export function calculateLumpsumValue(
  principal: number,
  cagr: number,
  years: number
): number {
  if (principal <= 0 || cagr <= 0 || years <= 0) return 0;
  const r = cagr / 100;
  return principal * Math.pow(1 + r, years);
}

export function calculateSIPValue(
  monthlyAmount: number,
  cagr: number,
  years: number
): number {
  if (monthlyAmount <= 0 || cagr <= 0 || years <= 0) return 0;
  const monthlyRate = cagr / (12 * 100);
  const months = years * 12;
  return (
    monthlyAmount *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

export function calculateYearlySIPValue(
  yearlyAmount: number,
  cagr: number,
  years: number
): number {
  if (yearlyAmount <= 0 || cagr <= 0 || years <= 0) return 0;
  const annualRate = cagr / 100;
  return (
    yearlyAmount *
    ((Math.pow(1 + annualRate, years) - 1) / annualRate) *
    (1 + annualRate)
  );
}

export function calculateTaxAmount(
  totalGains: number,
  includeTax: boolean = true
): number {
  if (!includeTax) return 0;
  const exemptionLimit = 150000; // ₹1.5L exemption on gains
  if (totalGains <= exemptionLimit) return 0;
  return (totalGains - exemptionLimit) * 0.125; // 12.5% tax on gains above exemption
}

export function calculateCorpusProjection(
  initialCorpus: number,
  annualWithdrawalPercent: number,
  growthRate: number,
  years: number,
  includeTax: boolean = true
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
    const taxableAmount = includeTax
      ? Math.max(0, annualWithdrawal - exemptionLimit)
      : 0;
    const annualTax = includeTax ? taxableAmount * 0.125 : 0; // 12.5% tax on amount above exemption
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
