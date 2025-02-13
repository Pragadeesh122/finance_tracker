"use client";

import {Suspense, useEffect, useState, useCallback} from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {useRouter, useSearchParams} from "next/navigation";
import {LoadingSkeleton} from "@/components/loading-skeleton";
import {getFromCache, setInCache} from "../utils/cache";

interface NAVData {
  date: string;
  nav: string;
}

interface MFAPIResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: string;
    scheme_name: string;
  };
  data: NAVData[];
}

interface FundData {
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

interface SearchResult {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
}

interface CalculatorInputs {
  investmentType: "lumpsum" | "sip";
  amount: number;
  years: number;
}

async function searchFunds(query: string): Promise<SearchResult[]> {
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

async function getFundDetails(amfiCode: string): Promise<FundData | null> {
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

async function getFundMetrics(
  amfiCode: string,
  category?: string
): Promise<Partial<FundData["data"]>> {
  return {
    riskLevel: getRiskLevel(category),
  };
}

// Helper function to determine risk level based on fund category
function getRiskLevel(category?: string): string {
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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

type TimePeriod = "6M" | "1Y" | "3Y" | "5Y" | "7Y" | "10Y" | "15Y" | "Max";

function getFilteredData(data: NAVData[], period: TimePeriod): NAVData[] {
  if (!data || data.length === 0) return [];

  // Sort data to find the latest date
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date.split("-").reverse().join("-"));
    const dateB = new Date(b.date.split("-").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  const latestDate = new Date(
    sortedData[0].date.split("-").reverse().join("-")
  );

  // Use the last NAV date as the end date for calculations
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

  // Return empty array if we don't have enough data for the period
  if (filteredData.length === 0) return [];

  return filteredData;
}

function calculateCAGR(
  startNAV: number,
  endNAV: number,
  years: number
): number {
  // Ensure we're using positive numbers and valid years
  if (startNAV <= 0 || endNAV <= 0 || years <= 0) return 0;
  return (Math.pow(endNAV / startNAV, 1 / years) - 1) * 100;
}

function getCAGR(data: NAVData[]): {
  [key in Exclude<TimePeriod, "6M">]?: number;
} {
  if (data.length === 0) return {};

  // Sort data from oldest to newest
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

  // Calculate Max period CAGR
  const maxYears =
    (endDate.getTime() - oldestDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (maxYears >= 1) {
    const oldestNAV = parseFloat(sortedData[0].nav);
    cagr["Max"] = calculateCAGR(oldestNAV, currentNAV, maxYears);
  }

  // Calculate CAGR for specific periods
  const periods = {
    "1Y": 1,
    "3Y": 3,
    "5Y": 5,
    "7Y": 7,
    "10Y": 10,
    "15Y": 15,
  };

  // For each period, find the NAV closest to that period's start date
  Object.entries(periods).forEach(([period, years]) => {
    const targetDate = new Date(endDate);
    targetDate.setFullYear(endDate.getFullYear() - years);

    // Only proceed if we have enough historical data for this period
    if (oldestDate <= targetDate) {
      // Binary search to find the closest date
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

        // Only calculate if we have the complete period (with a small buffer for date misalignment)
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
  const exemptionLimit = 150000; // ₹1.5L exemption on gains
  if (totalGains <= exemptionLimit) return 0;
  return (totalGains - exemptionLimit) * 0.125; // 12.5% tax on gains above exemption
}

function getMaxDuration(data: NAVData[]): string {
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
  const totalMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days in a month

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months}M`;
  if (months === 0) return `${years}Y`;
  return `${years}Y ${months}M`;
}

// Add new function to fetch all funds
async function getAllFunds(): Promise<SearchResult[]> {
  try {
    // Try to get data from cache first
    const cachedData = await getFromCache<SearchResult[]>();
    if (cachedData) {
      return cachedData;
    }

    // If no cached data, fetch from API with CORS headers
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

    // Cache the data
    await setInCache(data);

    return data;
  } catch (error) {
    console.error("Error fetching all funds:", error);
    return [];
  }
}

// Add function for client-side search
function searchLocalFunds(
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
    .slice(0, 20); // Limit to 20 results for better performance
}

function MutualFundTracker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1Y");
  const [allFunds, setAllFunds] = useState<SearchResult[]>([]);
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    investmentType: "lumpsum",
    amount: 10000,
    years: 5,
  });

  // Fetch all funds on mount
  useEffect(() => {
    const fetchAllFunds = async () => {
      try {
        setLoading(true);
        const funds = await getAllFunds();
        setAllFunds(funds);
      } catch (error) {
        console.error("Error in fetchAllFunds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFunds();
  }, []);

  const handleFundSelect = useCallback(
    async (amfiCode: string) => {
      setLoading(true);
      const fundDetails = await getFundDetails(amfiCode);
      if (fundDetails) {
        const additionalMetrics = await getFundMetrics(
          amfiCode,
          fundDetails.data.schemeCategory
        );
        fundDetails.data = {...fundDetails.data, ...additionalMetrics};
        router.push(`?fund=${amfiCode}`, {scroll: false});
      }
      setSelectedFund(fundDetails);
      setSearchResults([]);
      setSearchQuery("");
      setLoading(false);
    },
    [router]
  );

  // Load fund from URL params on initial render
  useEffect(() => {
    const amfiCode = searchParams.get("fund");
    if (amfiCode && !selectedFund) {
      handleFundSelect(amfiCode);
    }
  }, [searchParams, handleFundSelect, selectedFund]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      // First try client-side search
      if (allFunds.length > 0) {
        const localResults = searchLocalFunds(allFunds, debouncedSearchQuery);
        if (localResults.length > 0) {
          setSearchResults(localResults);
          setLoading(false);
          return;
        }
      }

      // Fall back to API search if no local results
      const results = await searchFunds(debouncedSearchQuery);
      setSearchResults(results);
      setLoading(false);
    };

    handleSearch();
  }, [debouncedSearchQuery, allFunds]);

  const chartData = selectedFund?.data?.navData
    ? getFilteredData(selectedFund.data.navData, selectedPeriod)
        .sort((a, b) => {
          const dateA = new Date(a.date.split("-").reverse().join("-"));
          const dateB = new Date(b.date.split("-").reverse().join("-"));
          return dateA.getTime() - dateB.getTime(); // Sort from old to new
        })
        .map((item) => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }))
    : [];

  const cagrData = selectedFund?.data?.navData
    ? getCAGR(selectedFund.data.navData)
    : {};

  const availablePeriods = [
    "6M",
    "1Y",
    "3Y",
    "5Y",
    "7Y",
    "10Y",
    "15Y",
    "Max",
  ].filter((period) => {
    if (period === "6M" || period === "Max") return true;
    return cagrData[period as keyof typeof cagrData] !== undefined;
  }) as TimePeriod[];

  const maxNav =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.nav))
      : null;
  const minNav =
    chartData.length > 0
      ? Math.min(...chartData.map((item) => item.nav))
      : null;

  // Check if fund is discontinued (last NAV date > 6 months old)
  const isDiscontinued = selectedFund?.data?.lastUpdated
    ? (() => {
        const lastNavDate = new Date(
          selectedFund.data.lastUpdated.split("-").reverse().join("-")
        );
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return lastNavDate < sixMonthsAgo;
      })()
    : false;

  return (
    <main className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-50 py-12 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800'>
        <div className='absolute inset-0 bg-grid-slate-200/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.7))] dark:bg-grid-slate-800/30'></div>
        <div className='relative mx-[6%]'>
          <div className='text-center'>
            <h1 className='bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-slate-200 dark:via-slate-100 dark:to-slate-200 sm:text-5xl'>
              Indian Mutual Funds
            </h1>
            <p className='mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base'>
              Track, analyze, and compare mutual fund performance with real-time
              data and interactive charts
            </p>
          </div>

          {/* Search Section */}
          <div className='mx-auto mt-8 max-w-2xl'>
            <div className='relative group'>
              <div className='absolute -inset-0.5 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700'></div>
              <div className='relative'>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search mutual funds by name or fund house...'
                  className='w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-500/50'
                />
                {loading && (
                  <div className='absolute right-4 top-1/2 -translate-y-1/2'>
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent dark:border-slate-500'></div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className='relative mt-2'>
                <div className='absolute -inset-0.5 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 rounded-lg blur opacity-30 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700'></div>
                <div className='relative max-h-96 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white/80 p-2 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80'>
                  {searchResults.map((fund) => (
                    <button
                      key={fund.schemeCode}
                      onClick={() => handleFundSelect(fund.schemeCode)}
                      className='w-full rounded-md p-3 text-left transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700'>
                      <div className='font-medium text-slate-900 dark:text-slate-100'>
                        {fund.schemeName}
                      </div>
                      <div className='mt-0.5 text-sm text-slate-500 dark:text-slate-400'>
                        {fund.fundHouse}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Fund Details */}
      {loading ? (
        <LoadingSkeleton />
      ) : selectedFund && selectedFund.data ? (
        <div className='mx-[6%] py-8'>
          <div className='space-y-6'>
            {/* Fund Header */}
            <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
              <div className='relative'>
                <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl'>
                  {selectedFund.name}
                </h2>
                <div className='mt-2 flex flex-wrap gap-4'>
                  <div className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                    {selectedFund.data.schemeCategory}
                  </div>
                  <div className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                    {selectedFund.data.schemeType}
                  </div>
                  {isDiscontinued && (
                    <div className='rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                      Discontinued/Merged Fund • Last NAV:{" "}
                      {selectedFund.data.lastUpdated}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Chart Section */}
            <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
              <div className='relative'>
                <div className='mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                  <div>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      Price Chart
                    </div>
                    <div className='mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4'>
                      <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                        <div className='text-sm text-slate-500 dark:text-slate-400'>
                          Low
                        </div>
                        <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                          {minNav !== null ? `₹${minNav.toFixed(2)}` : "N/A"}
                        </div>
                      </div>
                      <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                        <div className='text-sm text-slate-500 dark:text-slate-400'>
                          High
                        </div>
                        <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                          {maxNav !== null ? `₹${maxNav.toFixed(2)}` : "N/A"}
                        </div>
                      </div>
                      <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                        <div className='text-sm text-slate-500 dark:text-slate-400'>
                          Current
                        </div>
                        <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                          ₹{selectedFund.data.currentNAV}
                        </div>
                      </div>
                      {selectedPeriod !== "6M" && cagrData[selectedPeriod] && (
                        <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                          <div className='text-sm text-slate-500 dark:text-slate-400'>
                            CAGR ({selectedPeriod})
                          </div>
                          <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                            {cagrData[selectedPeriod]?.toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {availablePeriods.map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          selectedPeriod === period
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        }`}>
                        {period === "Max"
                          ? `Max (${getMaxDuration(
                              selectedFund?.data?.navData || []
                            )})`
                          : period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='h-[400px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id='navGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'>
                          <stop
                            offset='5%'
                            stopColor='rgb(16, 185, 129)'
                            stopOpacity={0.2}
                          />
                          <stop
                            offset='95%'
                            stopColor='rgb(16, 185, 129)'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey='date'
                        tickFormatter={(date) => {
                          const [day, month, year] = date.split("-");
                          return `${day}/${month}/${year.slice(-2)}`;
                        }}
                        tick={{fill: "rgb(148, 163, 184)"}}
                        tickLine={{stroke: "rgb(148, 163, 184)"}}
                        axisLine={{stroke: "rgb(148, 163, 184)"}}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{fill: "rgb(148, 163, 184)"}}
                        tickLine={{stroke: "rgb(148, 163, 184)"}}
                        axisLine={{stroke: "rgb(148, 163, 184)"}}
                        tickFormatter={(value) => `₹${value.toFixed(2)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(15, 23, 42)",
                          border: "1px solid rgb(51, 65, 85)",
                          borderRadius: "0.5rem",
                          padding: "0.75rem",
                        }}
                        labelStyle={{color: "rgb(148, 163, 184)"}}
                        formatter={(value: number) => [
                          `₹${value.toFixed(2)}`,
                          "NAV",
                        ]}
                      />
                      <Area
                        type='monotone'
                        dataKey='nav'
                        stroke='rgb(16, 185, 129)'
                        strokeWidth={2}
                        fill='url(#navGradient)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fund Details Grid */}
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                <div className='relative'>
                  <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                    Fund House
                  </div>
                  <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                    {selectedFund.data.fundHouse}
                  </div>
                </div>
              </div>
              <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                <div className='relative'>
                  <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                    Last Updated
                  </div>
                  <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                    {selectedFund.data.lastUpdated}
                  </div>
                </div>
              </div>
              <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                <div className='relative'>
                  <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                    Risk Level
                  </div>
                  <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                    {selectedFund.data.riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Fund Metrics Section */}
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {selectedFund.data.fundSize && (
                <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                  <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                  <div className='relative'>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      Fund Size
                    </div>
                    <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                      ₹{(selectedFund.data.fundSize / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                </div>
              )}
              {selectedFund.data.peRatio && (
                <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                  <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                  <div className='relative'>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      P/E Ratio
                    </div>
                    <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                      {selectedFund.data.peRatio.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
              {selectedFund.data.pbRatio && (
                <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                  <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                  <div className='relative'>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      P/B Ratio
                    </div>
                    <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                      {selectedFund.data.pbRatio.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
              {selectedFund.data.beta && (
                <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                  <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                  <div className='relative'>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      Beta
                    </div>
                    <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                      {selectedFund.data.beta.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
              {selectedFund.data.stdDev && (
                <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                  <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                  <div className='relative'>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      Standard Deviation
                    </div>
                    <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                      {selectedFund.data.stdDev.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}
              {selectedFund.data.sharpeRatio && (
                <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                  <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                  <div className='relative'>
                    <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
                      Sharpe Ratio
                    </div>
                    <div className='mt-2 text-lg font-medium text-slate-900 dark:text-slate-100'>
                      {selectedFund.data.sharpeRatio.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculator Section */}
            {selectedFund && selectedFund.data && cagrData["Max"] && (
              <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
                <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
                <div className='relative'>
                  <h3 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                    Investment Calculator
                  </h3>
                  <div className='mt-6 space-y-6'>
                    <div className='flex flex-wrap gap-2'>
                      <button
                        onClick={() =>
                          setCalculatorInputs((prev) => ({
                            ...prev,
                            investmentType: "lumpsum",
                          }))
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          calculatorInputs.investmentType === "lumpsum"
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        }`}>
                        Lumpsum
                      </button>
                      <button
                        onClick={() =>
                          setCalculatorInputs((prev) => ({
                            ...prev,
                            investmentType: "sip",
                          }))
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          calculatorInputs.investmentType === "sip"
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        }`}>
                        Monthly SIP
                      </button>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div>
                        <label className='block text-sm font-medium text-slate-600 dark:text-slate-400'>
                          {calculatorInputs.investmentType === "lumpsum"
                            ? "Lumpsum Amount (₹)"
                            : "Monthly SIP Amount (₹)"}
                        </label>
                        <input
                          type='number'
                          value={calculatorInputs.amount}
                          onChange={(e) =>
                            setCalculatorInputs((prev) => ({
                              ...prev,
                              amount: Math.max(0, Number(e.target.value)),
                            }))
                          }
                          className='mt-1 block w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-500/50'
                          min='0'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-slate-600 dark:text-slate-400'>
                          Investment Period (Years)
                        </label>
                        <input
                          type='number'
                          value={calculatorInputs.years}
                          onChange={(e) =>
                            setCalculatorInputs((prev) => ({
                              ...prev,
                              years: Math.max(
                                1,
                                Math.min(50, Number(e.target.value))
                              ),
                            }))
                          }
                          className='mt-1 block w-full rounded-lg border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm transition-all duration-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-500/50'
                          min='1'
                          max='50'
                        />
                      </div>
                    </div>

                    <div className='overflow-hidden rounded-xl bg-slate-50 p-6 dark:bg-slate-800/50'>
                      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        <div>
                          <div className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            Expected CAGR
                          </div>
                          <div className='mt-1.5 text-2xl font-semibold text-slate-900 dark:text-slate-100'>
                            {cagrData["Max"].toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            Total Investment
                          </div>
                          <div className='mt-1.5 text-2xl font-semibold text-slate-900 dark:text-slate-100'>
                            ₹
                            {(calculatorInputs.investmentType === "lumpsum"
                              ? calculatorInputs.amount
                              : calculatorInputs.amount *
                                calculatorInputs.years *
                                12
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            Total Returns
                          </div>
                          <div className='mt-1.5 text-2xl font-semibold text-emerald-600 dark:text-emerald-400'>
                            ₹
                            {(
                              (calculatorInputs.investmentType === "lumpsum"
                                ? calculateLumpsumValue(
                                    calculatorInputs.amount,
                                    cagrData["Max"],
                                    calculatorInputs.years
                                  )
                                : calculateSIPValue(
                                    calculatorInputs.amount,
                                    cagrData["Max"],
                                    calculatorInputs.years
                                  )) -
                              (calculatorInputs.investmentType === "lumpsum"
                                ? calculatorInputs.amount
                                : calculatorInputs.amount *
                                  calculatorInputs.years *
                                  12)
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            Tax Amount
                          </div>
                          <div className='mt-1.5 text-2xl font-semibold text-red-600 dark:text-red-400'>
                            ₹
                            {calculateTaxAmount(
                              (calculatorInputs.investmentType === "lumpsum"
                                ? calculateLumpsumValue(
                                    calculatorInputs.amount,
                                    cagrData["Max"],
                                    calculatorInputs.years
                                  )
                                : calculateSIPValue(
                                    calculatorInputs.amount,
                                    cagrData["Max"],
                                    calculatorInputs.years
                                  )) -
                                (calculatorInputs.investmentType === "lumpsum"
                                  ? calculatorInputs.amount
                                  : calculatorInputs.amount *
                                    calculatorInputs.years *
                                    12)
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            Final Amount
                          </div>
                          <div className='mt-1.5 text-2xl font-semibold text-emerald-600 dark:text-emerald-400'>
                            ₹
                            {(calculatorInputs.investmentType === "lumpsum"
                              ? calculateLumpsumValue(
                                  calculatorInputs.amount,
                                  cagrData["Max"],
                                  calculatorInputs.years
                                )
                              : calculateSIPValue(
                                  calculatorInputs.amount,
                                  cagrData["Max"],
                                  calculatorInputs.years
                                )
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            Post-tax Amount
                          </div>
                          <div className='mt-1.5 text-2xl font-semibold text-emerald-600 dark:text-emerald-400'>
                            ₹
                            {(
                              (calculatorInputs.investmentType === "lumpsum"
                                ? calculateLumpsumValue(
                                    calculatorInputs.amount,
                                    cagrData["Max"],
                                    calculatorInputs.years
                                  )
                                : calculateSIPValue(
                                    calculatorInputs.amount,
                                    cagrData["Max"],
                                    calculatorInputs.years
                                  )) -
                              calculateTaxAmount(
                                (calculatorInputs.investmentType === "lumpsum"
                                  ? calculateLumpsumValue(
                                      calculatorInputs.amount,
                                      cagrData["Max"],
                                      calculatorInputs.years
                                    )
                                  : calculateSIPValue(
                                      calculatorInputs.amount,
                                      cagrData["Max"],
                                      calculatorInputs.years
                                    )) -
                                  (calculatorInputs.investmentType === "lumpsum"
                                    ? calculatorInputs.amount
                                    : calculatorInputs.amount *
                                      calculatorInputs.years *
                                      12)
                              )
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-1 text-xs text-slate-500 dark:text-slate-400'>
                      <div>
                        • Tax calculation assumes LTCG at 12.5% on gains above
                        ₹1.5L exemption limit.
                      </div>
                      <div>
                        • Returns % is calculated based on total investment
                        amount.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MutualFundTracker />
    </Suspense>
  );
}
