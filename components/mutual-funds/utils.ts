import { NAVData, SearchResult, FundData, MFAPIResponse, TimePeriod } from "./types";
import { getFromCache, setInCache } from "../../utils/cache";

export async function searchFunds(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/search?q=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching funds:", error);
    return [];
  }
}

export async function getFundDetails(amfiCode: string): Promise<FundData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/${amfiCode}`
    );
    const data: MFAPIResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error("No data available");
    }

    const navData = data.data.sort((a, b) => {
      const dateA = new Date(a.date.split("-").reverse().join("-"));
      const dateB = new Date(b.date.split("-").reverse().join("-"));
      return dateB.getTime() - dateA.getTime();
    });

    return {
      symbol: data.meta.scheme_code,
      amfiCode: data.meta.scheme_code,
      name: data.meta.scheme_name,
      data: {
        shortName: data.meta.scheme_name,
        longName: data.meta.scheme_name,
        amfiCode: data.meta.scheme_code,
        currentNAV: navData[0].nav,
        lastUpdated: navData[0].date,
        cagrData: {},
        fundHouse: data.meta.fund_house,
        schemeType: data.meta.scheme_type,
        schemeCategory: data.meta.scheme_category,
        navData: data.data,
      },
    };
  } catch (error) {
    console.error("Error fetching fund details:", error);
    return null;
  }
}

export async function getFundMetrics(
  amfiCode: string,
  category?: string
): Promise<Partial<FundData["data"]>> {
  return {
    riskLevel: getRiskLevel(category),
  };
}

export function getRiskLevel(category?: string): string {
  if (!category) return "Moderate";

  const lowRisk = [
    "Liquid Fund",
    "Overnight Fund",
    "Money Market Fund",
    "Ultra Short Duration Fund",
  ];
  const highRisk = [
    "Small Cap Fund",
    "Mid Cap Fund",
    "Sectoral Fund",
    "Thematic Fund",
  ];

  category = category.toLowerCase();

  if (lowRisk.some((type) => category.includes(type.toLowerCase()))) {
    return "Low";
  } else if (highRisk.some((type) => category.includes(type.toLowerCase()))) {
    return "High";
  } else {
    return "Moderate";
  }
}

export function getFilteredData(data: NAVData[], period: TimePeriod): NAVData[] {
  if (!data || data.length === 0) return [];

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split("-").reverse().join("-"));
    const dateB = new Date(b.date.split("-").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  const latestDate = new Date(
    sortedData[0].date.split("-").reverse().join("-")
  );

  const endDate = latestDate;
  const monthsAgo = new Date(endDate);

  switch (period) {
    case "6M":
      monthsAgo.setMonth(endDate.getMonth() - 6);
      break;
    case "1Y":
      monthsAgo.setFullYear(endDate.getFullYear() - 1);
      break;
    case "3Y":
      monthsAgo.setFullYear(endDate.getFullYear() - 3);
      break;
    case "5Y":
      monthsAgo.setFullYear(endDate.getFullYear() - 5);
      break;
    case "7Y":
      monthsAgo.setFullYear(endDate.getFullYear() - 7);
      break;
    case "10Y":
      monthsAgo.setFullYear(endDate.getFullYear() - 10);
      break;
    case "15Y":
      monthsAgo.setFullYear(endDate.getFullYear() - 15);
      break;
    case "Max":
      return data;
  }

  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.date.split("-").reverse().join("-"));
    return itemDate >= monthsAgo && itemDate <= endDate;
  });

  if (filteredData.length === 0) return [];

  return filteredData;
}

export function calculateCAGR(
  startNAV: number,
  endNAV: number,
  years: number
): number {
  if (startNAV <= 0 || endNAV <= 0 || years <= 0) return 0;
  return (Math.pow(endNAV / startNAV, 1 / years) - 1) * 100;
}

export function getCAGR(data: NAVData[]): {
  [key in Exclude<TimePeriod, "6M">]?: number;
} {
  if (data.length === 0) return {};

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split("-").reverse().join("-"));
    const dateB = new Date(b.date.split("-").reverse().join("-"));
    return dateA.getTime() - dateB.getTime();
  });

  const latestData = sortedData[sortedData.length - 1];
  const currentNAV = parseFloat(latestData.nav);
  const endDate = new Date(latestData.date.split("-").reverse().join("-"));
  const oldestDate = new Date(
    sortedData[0].date.split("-").reverse().join("-")
  );

  const cagr: {[key in Exclude<TimePeriod, "6M">]?: number} = {};

  const maxYears =
    (endDate.getTime() - oldestDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (maxYears >= 1) {
    const oldestNAV = parseFloat(sortedData[0].nav);
    cagr["Max"] = calculateCAGR(oldestNAV, currentNAV, maxYears);
  }

  const periods = {
    "1Y": 1,
    "3Y": 3,
    "5Y": 5,
    "7Y": 7,
    "10Y": 10,
    "15Y": 15,
  };

  Object.entries(periods).forEach(([period, years]) => {
    const targetDate = new Date(endDate);
    targetDate.setFullYear(endDate.getFullYear() - years);

    if (oldestDate <= targetDate) {
      let left = 0;
      let right = sortedData.length - 1;
      let closestIndex = -1;
      let minDiff = Infinity;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midDate = new Date(
          sortedData[mid].date.split("-").reverse().join("-")
        );
        const diff = Math.abs(midDate.getTime() - targetDate.getTime());

        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = mid;
        }

        if (midDate.getTime() === targetDate.getTime()) {
          break;
        } else if (midDate.getTime() < targetDate.getTime()) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      if (closestIndex !== -1) {
        const startNAV = parseFloat(sortedData[closestIndex].nav);
        const startDate = new Date(
          sortedData[closestIndex].date.split("-").reverse().join("-")
        );
        const actualYears =
          (endDate.getTime() - startDate.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000);

        if (actualYears >= years * 0.99) {
          cagr[period as keyof typeof cagr] = calculateCAGR(
            startNAV,
            currentNAV,
            actualYears
          );
        }
      }
    }
  });

  return cagr;
}

export function calculateLumpsumValue(
  principal: number,
  cagr: number,
  years: number
): number {
  const r = cagr / 100;
  return principal * Math.pow(1 + r, years);
}

export function calculateSIPValue(
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

export function calculateTaxAmount(totalGains: number): number {
  const exemptionLimit = 150000;
  if (totalGains <= exemptionLimit) return 0;
  return (totalGains - exemptionLimit) * 0.125;
}

export function getMaxDuration(data: NAVData[]): string {
  if (!data || data.length < 2) return "";

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split("-").reverse().join("-"));
    const dateB = new Date(b.date.split("-").reverse().join("-"));
    return dateA.getTime() - dateB.getTime();
  });

  const startDate = new Date(sortedData[0].date.split("-").reverse().join("-"));
  const endDate = new Date(
    sortedData[sortedData.length - 1].date.split("-").reverse().join("-")
  );

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const totalMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months}M`;
  if (months === 0) return `${years}Y`;
  return `${years}Y ${months}M`;
}

export async function getAllFunds(): Promise<SearchResult[]> {
  try {
    const cachedData = await getFromCache<SearchResult[]>();
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL!, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    await setInCache(data);
    return data;
  } catch (error) {
    console.error("Error fetching all funds:", error);
    return [];
  }
}

export function searchLocalFunds(
  funds: SearchResult[],
  query: string
): SearchResult[] {
  const searchTerms = query.toLowerCase().split(" ");
  return funds
    .filter((fund) => {
      const fundName = fund.schemeName.toLowerCase();
      const fundHouse = fund.fundHouse?.toLowerCase() || "";
      return searchTerms.every(
        (term) => fundName.includes(term) || fundHouse.includes(term)
      );
    })
    .slice(0, 20);
}