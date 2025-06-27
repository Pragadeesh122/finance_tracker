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
