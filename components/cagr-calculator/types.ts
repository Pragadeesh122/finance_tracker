export interface CAGRInputs {
  initialAmount: number;
  finalAmount: number;
  years: number;
  months: number;
}

export interface ProjectionInputs {
  investmentType: "lumpsum" | "sip" | "yearly" | "stepup_sip";
  amount: number;
  cagr: number;
  years: number;
  stepUpPercentage?: number; // For step-up SIP
  inflationRate?: number; // For inflation-adjusted calculations
}

export interface WithdrawalInputs {
  annualWithdrawalRate: number;
  withdrawalYears: number;
}

export type CalculatorMode = "cagr" | "projection" | "goal_planning" | "retirement" | "education" | "emi_vs_investment" | "stepup_sip";

// Goal Planning Inputs
export interface GoalPlanningInputs {
  goalType: "retirement" | "education" | "house" | "car" | "custom";
  targetAmount: number;
  currentAge?: number;
  targetAge?: number;
  currentMonthlyExpenses?: number;
  inflationRate: number;
  expectedCAGR: number;
}

// Retirement Planning Inputs
export interface RetirementPlanningInputs {
  currentAge: number;
  retirementAge: number;
  currentMonthlyExpenses: number;
  inflationRate: number;
  postRetirementYears: number;
  expenseReplacement: number; // Percentage of current expenses needed
  expectedCAGR: number;
}

// Education Planning Inputs
export interface EducationPlanningInputs {
  currentCost: number;
  yearsToEducation: number;
  educationInflationRate: number;
  contingencyFactor: number;
  expectedCAGR: number;
}

// EMI vs Investment Inputs
export interface EMIVsInvestmentInputs {
  loanAmount: number;
  loanTenure: number;
  loanInterestRate: number;
  investmentCAGR: number;
  extraAmountAvailable: number;
}

// Step-up SIP Inputs
export interface StepUpSIPInputs {
  initialMonthlyAmount: number;
  cagr: number;
  years: number;
  stepUpPercentage: number;
}

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
