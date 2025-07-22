export interface NAVData {
  date: string;
  nav: string;
}

export interface MFAPIResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: string;
    scheme_name: string;
  };
  data: NAVData[];
}

export interface FundData {
  symbol: string;
  amfiCode: string;
  name: string;
  data: {
    shortName: string;
    longName: string;
    amfiCode: string;
    currentNAV: string;
    lastUpdated: string;
    cagrData: {
      oneYear?: string;
      twoYear?: string;
      threeYear?: string;
      fiveYear?: string;
    };
    fundHouse: string;
    schemeType: string;
    schemeCategory: string;
    navData: NAVData[];
    expenseRatio?: number;
    fundSize?: number;
    peRatio?: number;
    pbRatio?: number;
    beta?: number;
    stdDev?: number;
    sharpeRatio?: number;
    turnoverRatio?: number;
    riskLevel?: string;
  };
}

export interface SearchResult {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
}

export interface CalculatorInputs {
  investmentType: "lumpsum" | "sip";
  amount: number;
  years: number;
}

export type TimePeriod = "6M" | "1Y" | "3Y" | "5Y" | "7Y" | "10Y" | "15Y" | "Max";