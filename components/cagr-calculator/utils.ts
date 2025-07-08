import {
  YearlyProjection,
  YearlyInvestmentBreakdown,
  MonthlyBreakdown,
} from "./types";

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

  // Convert annual rate to monthly rate using compound formula
  const annualRate = cagr / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const months = years * 12;

  // Future Value of Annuity Due formula (payments at beginning of period)
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

  // Future Value of Annuity Due formula (payments at beginning of period)
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

export function calculateMonthlyBreakdown(
  monthlyAmount: number,
  cagr: number,
  startingCorpus: number
): MonthlyBreakdown[] {
  const monthlyBreakdown: MonthlyBreakdown[] = [];

  // Convert annual rate to monthly rate using compound formula
  const annualRate = cagr / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  let currentCorpus = startingCorpus;
  let cumulativeInterest = 0; // Track total interest earned

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let month = 1; month <= 12; month++) {
    const startingMonthCorpus = currentCorpus;

    // Add monthly investment
    currentCorpus += monthlyAmount;

    // Calculate monthly interest on the corpus after investment
    const interestEarned = currentCorpus * monthlyRate;
    currentCorpus += interestEarned;

    // Update cumulative interest
    cumulativeInterest += interestEarned;

    monthlyBreakdown.push({
      month,
      monthName: monthNames[month - 1],
      startingCorpus: startingMonthCorpus,
      investmentAmount: monthlyAmount,
      interestEarned,
      totalCorpus: currentCorpus,
      cumulativeInterest,
    });
  }

  return monthlyBreakdown;
}

export function calculateYearlyInvestmentBreakdown(
  investmentType: "lumpsum" | "sip" | "yearly",
  amount: number,
  cagr: number,
  years: number
): YearlyInvestmentBreakdown[] {
  if (amount <= 0 || cagr <= 0 || years <= 0) return [];

  const breakdown: YearlyInvestmentBreakdown[] = [];
  const annualRate = cagr / 100;
  let cumulativeCorpus = 0;
  let totalInterestEarned = 0; // Track cumulative interest across all years

  for (let year = 1; year <= years; year++) {
    const startingCorpus = cumulativeCorpus;
    let investmentAmount = 0;
    let interestEarned = 0;
    let monthlyBreakdown: MonthlyBreakdown[] | undefined;

    if (investmentType === "lumpsum") {
      // For lumpsum, investment happens only in year 1
      if (year === 1) {
        investmentAmount = amount;
        cumulativeCorpus = amount;
      }
      // Interest is earned on the entire corpus
      interestEarned = cumulativeCorpus * annualRate;
      cumulativeCorpus += interestEarned;
      totalInterestEarned += interestEarned;
    } else if (investmentType === "sip") {
      // For monthly SIP, calculate month by month
      const startingYearCorpus = cumulativeCorpus;
      monthlyBreakdown = calculateMonthlyBreakdown(
        amount,
        cagr,
        startingYearCorpus
      );

      // Get totals from monthly breakdown
      investmentAmount = amount * 12; // Total annual investment
      const yearEndCorpus = monthlyBreakdown[11].totalCorpus; // Last month's total
      interestEarned = yearEndCorpus - startingYearCorpus - investmentAmount;
      cumulativeCorpus = yearEndCorpus;
      totalInterestEarned += interestEarned;
    } else if (investmentType === "yearly") {
      // For yearly SIP, investment happens at the beginning of each year
      investmentAmount = amount;

      // Add annual investment
      cumulativeCorpus += investmentAmount;

      // Calculate interest on the entire corpus (including new investment)
      interestEarned = cumulativeCorpus * annualRate;
      cumulativeCorpus += interestEarned;
      totalInterestEarned += interestEarned;
    }

    breakdown.push({
      year,
      startingCorpus,
      investmentAmount,
      interestEarned,
      totalCorpus: cumulativeCorpus,
      cumulativeInterest: totalInterestEarned,
      monthlyBreakdown: investmentType === "sip" ? monthlyBreakdown : undefined,
    });
  }

  return breakdown;
}
