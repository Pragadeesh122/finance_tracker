import {
  YearlyProjection,
  YearlyInvestmentBreakdown,
  MonthlyBreakdown,
} from "./types";

// Enhanced mathematical precision utilities
export function bankerRound(num: number, places: number = 2): number {
  const factor = Math.pow(10, places);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

export function preciseNumber(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// Currency formatting utility
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// More precise monthly rate conversion
export function getMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

// Inflation-adjusted calculations
export function calculateRealCAGR(
  nominalCAGR: number,
  inflationRate: number
): number {
  if (nominalCAGR <= 0 || inflationRate < 0) return 0;
  return bankerRound(((1 + nominalCAGR / 100) / (1 + inflationRate / 100) - 1) * 100);
}

export function calculateInflationAdjustedValue(
  presentValue: number,
  inflationRate: number,
  years: number
): number {
  if (presentValue <= 0 || inflationRate < 0 || years <= 0) return 0;
  return bankerRound(presentValue * Math.pow(1 + inflationRate / 100, years));
}

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

// Enhanced Indian tax calculation system
export enum AssetType {
  EQUITY_MF = 'equity_mf',
  DEBT_MF = 'debt_mf',
  EQUITY_SHARES = 'equity_shares',
  GOLD_ETF = 'gold_etf',
  ELSS = 'elss'
}

export enum HoldingPeriod {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term'
}

export interface TaxDetails {
  assetType: AssetType;
  holdingPeriod: HoldingPeriod;
  gains: number;
  costOfAcquisition: number;
  saleValue: number;
  purchaseDate: Date;
  saleDate: Date;
}

export function calculateTaxAmount(
  totalGains: number,
  includeTax: boolean = true,
  assetType: AssetType = AssetType.EQUITY_MF,
  holdingPeriod: HoldingPeriod = HoldingPeriod.LONG_TERM
): number {
  if (!includeTax || totalGains <= 0) return 0;

  // Tax exemption limits for different asset types
  const EQUITY_EXEMPTION_LIMIT = 125000; // ₹1.25L for equity
  
  // Updated as per latest Indian tax regulations (2024-25)
  switch (assetType) {
    case AssetType.EQUITY_MF:
    case AssetType.EQUITY_SHARES:
      if (holdingPeriod === HoldingPeriod.LONG_TERM) {
        // LTCG: 12.5% on gains above ₹1.25L (updated limit)
        if (totalGains <= EQUITY_EXEMPTION_LIMIT) return 0;
        return bankerRound((totalGains - EQUITY_EXEMPTION_LIMIT) * 0.125);
      } else {
        // STCG: 20% on all gains
        return bankerRound(totalGains * 0.20);
      }
    
    case AssetType.DEBT_MF:
      if (holdingPeriod === HoldingPeriod.LONG_TERM) {
        // LTCG: As per income tax slab (treating as per new rules)
        return bankerRound(totalGains * 0.20); // Simplified 20% for debt funds
      } else {
        // STCG: As per income tax slab (simplified to 30%)
        return bankerRound(totalGains * 0.30);
      }
    
    case AssetType.GOLD_ETF:
      if (holdingPeriod === HoldingPeriod.LONG_TERM) {
        // LTCG: 12.5% without indexation
        return bankerRound(totalGains * 0.125);
      } else {
        // STCG: As per income tax slab
        return bankerRound(totalGains * 0.30);
      }
    
    case AssetType.ELSS:
      // ELSS has 3-year lock-in, so always LTCG
      if (totalGains <= EQUITY_EXEMPTION_LIMIT) return 0;
      return bankerRound((totalGains - EQUITY_EXEMPTION_LIMIT) * 0.125);
    
    default:
      // Default to equity MF LTCG
      if (totalGains <= EQUITY_EXEMPTION_LIMIT) return 0;
      return bankerRound((totalGains - EQUITY_EXEMPTION_LIMIT) * 0.125);
  }
}

// Calculate indexation benefit for debt funds (pre-2023 purchases)
export function calculateIndexationBenefit(
  costOfAcquisition: number,
  purchaseYear: number,
  saleYear: number
): number {
  // Simplified indexation calculation
  // Using approximate inflation index growth of 4% per year
  const indexationRate = 0.04;
  const years = saleYear - purchaseYear;
  return bankerRound(costOfAcquisition * Math.pow(1 + indexationRate, years));
}

// Calculate TDS (Tax Deducted at Source) if applicable
export function calculateTDS(
  totalAmount: number,
  assetType: AssetType
): number {
  // TDS applicable on certain transactions
  switch (assetType) {
    case AssetType.EQUITY_MF:
    case AssetType.DEBT_MF:
      // No TDS on mutual fund redemptions for retail investors
      return 0;
    default:
      return 0;
  }
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
  investmentType: "lumpsum" | "sip" | "yearly" | "stepup_sip",
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
    } else if (investmentType === "stepup_sip") {
      // For step-up SIP, treat as regular SIP for yearly breakdown
      // (Step-up calculation is handled separately in StepUpSIPSection)
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
    }

    breakdown.push({
      year,
      startingCorpus,
      investmentAmount,
      interestEarned,
      totalCorpus: cumulativeCorpus,
      cumulativeInterest: totalInterestEarned,
      monthlyBreakdown: (investmentType === "sip" || investmentType === "stepup_sip") ? monthlyBreakdown : undefined,
    });
  }

  return breakdown;
}

// Step-up SIP Calculator
export function calculateStepUpSIP(
  initialMonthlyAmount: number,
  cagr: number,
  years: number,
  stepUpPercentage: number
): number {
  if (initialMonthlyAmount <= 0 || cagr <= 0 || years <= 0) return 0;
  
  const monthlyRate = getMonthlyRate(cagr);
  let totalValue = 0;
  let currentMonthlyAmount = initialMonthlyAmount;
  
  for (let year = 1; year <= years; year++) {
    // Calculate value for this year with current monthly amount
    const monthsInYear = 12;
    for (let month = 1; month <= monthsInYear; month++) {
      const monthsRemaining = (years - year) * 12 + (monthsInYear - month + 1);
      totalValue += currentMonthlyAmount * Math.pow(1 + monthlyRate, monthsRemaining);
    }
    
    // Increase monthly amount for next year
    currentMonthlyAmount = bankerRound(currentMonthlyAmount * (1 + stepUpPercentage / 100));
  }
  
  return bankerRound(totalValue);
}

// Goal-based planning: Calculate required SIP for target amount
export function calculateRequiredSIP(
  targetAmount: number,
  cagr: number,
  years: number,
  investmentType: 'monthly' | 'yearly' = 'monthly'
): number {
  if (targetAmount <= 0 || cagr <= 0 || years <= 0) return 0;
  
  if (investmentType === 'monthly') {
    const monthlyRate = getMonthlyRate(cagr);
    const months = years * 12;
    
    // PMT calculation: target = PMT * [((1+r)^n - 1) / r] * (1+r)
    const fvAnnuityFactor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return bankerRound(targetAmount / fvAnnuityFactor);
  } else {
    const annualRate = cagr / 100;
    const fvAnnuityFactor = ((Math.pow(1 + annualRate, years) - 1) / annualRate) * (1 + annualRate);
    return bankerRound(targetAmount / fvAnnuityFactor);
  }
}

// Calculate required lumpsum for target amount
export function calculateRequiredLumpsum(
  targetAmount: number,
  cagr: number,
  years: number
): number {
  if (targetAmount <= 0 || cagr <= 0 || years <= 0) return 0;
  
  const rate = cagr / 100;
  // PV = FV / (1+r)^n
  return bankerRound(targetAmount / Math.pow(1 + rate, years));
}

// Calculate years required to reach target with given investment
export function calculateYearsToTarget(
  monthlyInvestment: number,
  targetAmount: number,
  cagr: number,
  investmentType: 'monthly' | 'lumpsum' = 'monthly'
): number {
  if (monthlyInvestment <= 0 || targetAmount <= 0 || cagr <= 0) return 0;
  
  if (investmentType === 'lumpsum') {
    const rate = cagr / 100;
    // n = log(FV/PV) / log(1+r)
    return bankerRound(Math.log(targetAmount / monthlyInvestment) / Math.log(1 + rate));
  } else {
    const monthlyRate = getMonthlyRate(cagr);
    // Solve for n in: FV = PMT * [((1+r)^n - 1) / r] * (1+r)
    // Using numerical approximation
    let months = 1;
    while (months <= 600) { // Max 50 years
      const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      if (fv >= targetAmount) {
        return bankerRound(months / 12);
      }
      months++;
    }
    return 50; // Return max if not achievable
  }
}

// Retirement planning calculator
export function calculateRetirementCorpus(
  currentAge: number,
  retirementAge: number,
  currentMonthlyExpenses: number,
  inflationRate: number,
  postRetirementYears: number = 25,
  expenseReplacement: number = 80 // 80% of current expenses
): number {
  if (currentAge >= retirementAge || currentMonthlyExpenses <= 0) return 0;
  
  const yearsToRetirement = retirementAge - currentAge;
  
  // Calculate future monthly expenses at retirement
  const futureMonthlyExpenses = calculateInflationAdjustedValue(
    currentMonthlyExpenses * (expenseReplacement / 100),
    inflationRate,
    yearsToRetirement
  );
  
  // Calculate required corpus using 4% withdrawal rule (adjusted for inflation)
  // Note: postRetirementYears is used for validation but corpus calculation uses safe withdrawal rate
  const safeWithdrawalRate = Math.max(4 - inflationRate, 2); // Real withdrawal rate, min 2%
  const annualExpenses = futureMonthlyExpenses * 12;
  
  // Ensure we have enough for the specified post-retirement years
  const minCorpusForYears = annualExpenses * postRetirementYears;
  const corpusUsingSWR = annualExpenses / (safeWithdrawalRate / 100);
  
  return bankerRound(Math.max(minCorpusForYears, corpusUsingSWR));
}

// Education planning calculator
export function calculateEducationCorpus(
  currentCost: number,
  yearsToEducation: number,
  educationInflationRate: number = 8, // Education inflation typically higher
  contingencyFactor: number = 1.2 // 20% contingency
): number {
  if (currentCost <= 0 || yearsToEducation <= 0) return 0;
  
  const futureCost = calculateInflationAdjustedValue(
    currentCost,
    educationInflationRate,
    yearsToEducation
  );
  
  return bankerRound(futureCost * contingencyFactor);
}

// EMI vs Investment comparison
export interface EMIVsInvestmentResult {
  emiScenario: {
    totalEMIPaid: number;
    totalInterestPaid: number;
    opportunityCostOfEMI: number;
  };
  investmentScenario: {
    totalInvestmentValue: number;
    netWorth: number; // Investment value minus outstanding loan
  };
  recommendation: 'emi' | 'investment';
  savingsFromBetterChoice: number;
}

export function calculateEMIVsInvestment(
  loanAmount: number,
  loanTenure: number, // in years
  loanInterestRate: number,
  investmentCAGR: number,
  extraAmountAvailable: number // amount available for prepayment or investment
): EMIVsInvestmentResult {
  // Calculate EMI
  const monthlyRate = loanInterestRate / (12 * 100);
  const months = loanTenure * 12;
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  
  // EMI Scenario: Use extra amount for prepayment
  const totalEMIPaid = bankerRound(emi * months);
  const totalInterestPaid = bankerRound(totalEMIPaid - loanAmount);
  
  // Opportunity cost: What if we invested the EMI amount
  const opportunityCostOfEMI = calculateSIPValue(emi, investmentCAGR, loanTenure);
  
  // Investment Scenario: Continue EMI + invest extra amount
  const investmentValue = calculateSIPValue(extraAmountAvailable, investmentCAGR, loanTenure);
  const netWorth = bankerRound(investmentValue - loanAmount); // Assuming loan remains
  
  // Simple comparison (can be enhanced with prepayment calculations)
  const emiScenario = {
    totalEMIPaid,
    totalInterestPaid,
    opportunityCostOfEMI
  };
  
  const investmentScenario = {
    totalInvestmentValue: investmentValue,
    netWorth
  };
  
  const recommendation = netWorth > (opportunityCostOfEMI - totalInterestPaid) ? 'investment' : 'emi';
  const savingsFromBetterChoice = Math.abs(netWorth - (opportunityCostOfEMI - totalInterestPaid));
  
  return {
    emiScenario,
    investmentScenario,
    recommendation,
    savingsFromBetterChoice: bankerRound(savingsFromBetterChoice)
  };
}
