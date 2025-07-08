export interface CAGRInputs {
  initialAmount: number;
  finalAmount: number;
  years: number;
  months: number;
}

export interface ProjectionInputs {
  investmentType: "lumpsum" | "sip" | "yearly";
  amount: number;
  cagr: number;
  years: number;
}

export interface WithdrawalInputs {
  annualWithdrawalRate: number;
  withdrawalYears: number;
}

export type CalculatorMode = "cagr" | "projection";

export interface YearlyProjection {
  year: number;
  startingCorpus: number;
  annualWithdrawal: number;
  growthAmount: number;
  annualTax: number;
  endingCorpus: number;
  monthlyIncomeBeforeTax: number;
  monthlyIncomeAfterTax: number;
}

export interface MonthlyBreakdown {
  month: number;
  monthName: string;
  startingCorpus: number;
  investmentAmount: number;
  interestEarned: number;
  totalCorpus: number;
  cumulativeInterest: number; // Total interest earned up to this month
}

export interface YearlyInvestmentBreakdown {
  year: number;
  startingCorpus: number;
  investmentAmount: number;
  interestEarned: number;
  totalCorpus: number;
  cumulativeInterest: number; // Total interest earned up to this year
  monthlyBreakdown?: MonthlyBreakdown[]; // Only for SIP investments
}
