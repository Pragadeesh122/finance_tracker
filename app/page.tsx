"use client";

import {Suspense, useEffect, useState} from "react";
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
    exitLoad?: string;
    fundSize?: number;
    peRatio?: number;
    pbRatio?: number;
    beta?: number;
    stdDev?: number;
    sharpeRatio?: number;
    turnoverRatio?: number;
    riskLevel?: string;
    minSIPAmount?: number;
    minLumpSumAmount?: number;
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
      `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`
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
    const response = await fetch(`https://api.mfapi.in/mf/${amfiCode}`);
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
  const getExitLoad = (category?: string) => {
    if (!category) return "1% if redeemed within 1 year";
    category = category.toLowerCase();
    if (category.includes("liquid") || category.includes("overnight")) {
      return "NIL";
    }
    if (category.includes("debt")) {
      return "0.5% if redeemed within 6 months";
    }
    return "1% if redeemed within 1 year";
  };

  return {
    exitLoad: getExitLoad(category),
    minSIPAmount: 500,
    minLumpSumAmount: 5000,
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
  const now = new Date();
  const monthsAgo = new Date();

  switch (period) {
    case "6M":
      monthsAgo.setMonth(now.getMonth() - 6);
      break;
    case "1Y":
      monthsAgo.setFullYear(now.getFullYear() - 1);
      break;
    case "3Y":
      monthsAgo.setFullYear(now.getFullYear() - 3);
      break;
    case "5Y":
      monthsAgo.setFullYear(now.getFullYear() - 5);
      break;
    case "7Y":
      monthsAgo.setFullYear(now.getFullYear() - 7);
      break;
    case "10Y":
      monthsAgo.setFullYear(now.getFullYear() - 10);
      break;
    case "15Y":
      monthsAgo.setFullYear(now.getFullYear() - 15);
      break;
    case "Max":
      return data;
  }

  return data.filter((item) => {
    const itemDate = new Date(item.date.split("-").reverse().join("-"));
    return itemDate >= monthsAgo;
  });
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
  const currentDate = new Date(latestData.date.split("-").reverse().join("-"));
  const oldestDate = new Date(
    sortedData[0].date.split("-").reverse().join("-")
  );

  const cagr: {[key in Exclude<TimePeriod, "6M">]?: number} = {};

  // Calculate Max period CAGR
  const maxYears =
    (currentDate.getTime() - oldestDate.getTime()) /
    (365.25 * 24 * 60 * 60 * 1000);
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
    const targetDate = new Date(currentDate);
    targetDate.setFullYear(currentDate.getFullYear() - years);

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
        (currentDate.getTime() - startDate.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000);

      if (actualYears >= 0.9 * years) {
        // Only calculate if we have at least 90% of the period
        cagr[period as keyof typeof cagr] = calculateCAGR(
          startNAV,
          currentNAV,
          actualYears
        );
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
  const exemptionLimit = 150000;
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

function MutualFundTracker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1Y");
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    investmentType: "lumpsum",
    amount: 10000,
    years: 5,
  });

  // Load fund from URL params on initial render
  useEffect(() => {
    const amfiCode = searchParams.get("fund");
    if (amfiCode && !selectedFund) {
      handleFundSelect(amfiCode);
    }
  }, [searchParams]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      const results = await searchFunds(debouncedSearchQuery);
      setSearchResults(results);
      setLoading(false);
    };

    handleSearch();
  }, [debouncedSearchQuery]);

  const handleFundSelect = async (amfiCode: string) => {
    setLoading(true);
    const fundDetails = await getFundDetails(amfiCode);
    if (fundDetails) {
      // Fetch additional metrics
      const additionalMetrics = await getFundMetrics(
        amfiCode,
        fundDetails.data.schemeCategory
      );
      fundDetails.data = {...fundDetails.data, ...additionalMetrics};

      // Update URL with the selected fund's AMFI code
      router.push(`?fund=${amfiCode}`, {scroll: false});
    }
    setSelectedFund(fundDetails);
    // Clear search results and query after selection
    setSearchResults([]);
    setSearchQuery("");
    setLoading(false);
  };

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

  const maxNav = Math.max(...(chartData.map((item) => item.nav) || [0]));
  const minNav = Math.min(...(chartData.map((item) => item.nav) || [0]));

  return (
    <main className='p-8 min-h-screen bg-slate-950 text-slate-50'>
      <h1 className='text-2xl font-bold mb-4 text-slate-50'>
        Indian Mutual Funds Performance Tracker
      </h1>

      <div className='space-y-8'>
        {/* Search Section */}
        <section className='bg-slate-900 p-4 rounded-lg border border-slate-800'>
          <div className='relative'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search mutual funds...'
              className='w-full px-4 py-2 rounded bg-slate-800 text-slate-50 border border-slate-700 focus:outline-none focus:border-slate-500'
            />
            {loading && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
                Searching...
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className='mt-4 space-y-2 max-h-96 overflow-y-auto'>
              {searchResults.map((fund) => (
                <button
                  key={fund.schemeCode}
                  onClick={() => handleFundSelect(fund.schemeCode)}
                  className='w-full text-left p-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700'>
                  <div className='font-medium'>{fund.schemeName}</div>
                  <div className='text-sm text-slate-400'>{fund.fundHouse}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Selected Fund Details */}
        {loading ? (
          <LoadingSkeleton />
        ) : selectedFund && selectedFund.data ? (
          <section className='bg-slate-900 p-4 rounded-lg border border-slate-800'>
            <h2 className='text-xl font-semibold mb-4'>{selectedFund.name}</h2>

            {/* Price Chart Section */}
            <div className='mb-8'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <div className='text-slate-400'>Price Chart</div>
                  <div className='grid grid-cols-4 gap-4 mt-2'>
                    <div>
                      <div className='text-slate-400'>Low</div>
                      <div className='font-semibold'>₹{minNav.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className='text-slate-400'>High</div>
                      <div className='font-semibold'>₹{maxNav.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className='text-slate-400'>Current</div>
                      <div className='font-semibold'>
                        ₹{selectedFund.data.currentNAV}
                      </div>
                    </div>
                    {selectedPeriod !== "6M" && cagrData[selectedPeriod] && (
                      <div>
                        <div className='text-slate-400'>
                          CAGR ({selectedPeriod})
                        </div>
                        <div className='font-semibold'>
                          {cagrData[selectedPeriod]?.toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {availablePeriods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 rounded ${
                        selectedPeriod === period
                          ? "bg-slate-700 text-slate-50"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
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

              <div className='h-[400px] w-full'>
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
                          stopColor='rgb(34, 197, 94)'
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor='rgb(34, 197, 94)'
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
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{fill: "rgb(148, 163, 184)"}}
                      tickLine={{stroke: "rgb(148, 163, 184)"}}
                      tickFormatter={(value) => `₹${value.toFixed(2)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgb(15, 23, 42)",
                        border: "1px solid rgb(51, 65, 85)",
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
                      stroke='rgb(34, 197, 94)'
                      fill='url(#navGradient)'
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Existing fund details */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-slate-400'>Current NAV</div>
                  <div className='text-xl font-semibold'>
                    ₹{selectedFund.data.currentNAV}
                  </div>
                </div>
                <div>
                  <div className='text-slate-400'>Last Updated</div>
                  <div>{selectedFund.data.lastUpdated}</div>
                </div>
              </div>
              <div>
                <div className='text-slate-400'>Fund House</div>
                <div>{selectedFund.data.fundHouse}</div>
              </div>
              <div>
                <div className='text-slate-400'>Category</div>
                <div>{selectedFund.data.schemeCategory}</div>
              </div>
              <div>
                <div className='text-slate-400'>Type</div>
                <div>{selectedFund.data.schemeType}</div>
              </div>
            </div>

            {/* Fund Metrics Section */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
              {selectedFund.data.exitLoad && (
                <div>
                  <div className='text-slate-400'>Exit Load</div>
                  <div>{selectedFund.data.exitLoad}</div>
                </div>
              )}
              {selectedFund.data.fundSize && (
                <div>
                  <div className='text-slate-400'>Fund Size</div>
                  <div>
                    ₹{(selectedFund.data.fundSize / 10000000).toFixed(2)} Cr
                  </div>
                </div>
              )}
              {selectedFund.data.peRatio && (
                <div>
                  <div className='text-slate-400'>P/E Ratio</div>
                  <div>{selectedFund.data.peRatio.toFixed(2)}</div>
                </div>
              )}
              {selectedFund.data.pbRatio && (
                <div>
                  <div className='text-slate-400'>P/B Ratio</div>
                  <div>{selectedFund.data.pbRatio.toFixed(2)}</div>
                </div>
              )}
              {selectedFund.data.beta && (
                <div>
                  <div className='text-slate-400'>Beta</div>
                  <div>{selectedFund.data.beta.toFixed(2)}</div>
                </div>
              )}
              {selectedFund.data.stdDev && (
                <div>
                  <div className='text-slate-400'>Standard Deviation</div>
                  <div>{selectedFund.data.stdDev.toFixed(2)}%</div>
                </div>
              )}
              {selectedFund.data.sharpeRatio && (
                <div>
                  <div className='text-slate-400'>Sharpe Ratio</div>
                  <div>{selectedFund.data.sharpeRatio.toFixed(2)}</div>
                </div>
              )}
              {selectedFund.data.turnoverRatio && (
                <div>
                  <div className='text-slate-400'>Portfolio Turnover</div>
                  <div>{selectedFund.data.turnoverRatio.toFixed(2)}%</div>
                </div>
              )}
              {selectedFund.data.riskLevel && (
                <div>
                  <div className='text-slate-400'>Risk Level</div>
                  <div>{selectedFund.data.riskLevel}</div>
                </div>
              )}
              {selectedFund.data.minSIPAmount && (
                <div>
                  <div className='text-slate-400'>Min. SIP Amount</div>
                  <div>₹{selectedFund.data.minSIPAmount.toLocaleString()}</div>
                </div>
              )}
              {selectedFund.data.minLumpSumAmount && (
                <div>
                  <div className='text-slate-400'>Min. Lump Sum</div>
                  <div>
                    ₹{selectedFund.data.minLumpSumAmount.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {selectedFund && selectedFund.data && cagrData["Max"] && (
              <section className='bg-slate-900 p-4 rounded-lg border border-slate-800 mt-8'>
                <h3 className='text-lg font-semibold mb-4'>
                  Investment Calculator
                </h3>
                <div className='space-y-6'>
                  <div className='flex gap-4'>
                    <button
                      onClick={() =>
                        setCalculatorInputs((prev) => ({
                          ...prev,
                          investmentType: "lumpsum",
                        }))
                      }
                      className={`px-4 py-2 rounded ${
                        calculatorInputs.investmentType === "lumpsum"
                          ? "bg-slate-700 text-slate-50"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
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
                      className={`px-4 py-2 rounded ${
                        calculatorInputs.investmentType === "sip"
                          ? "bg-slate-700 text-slate-50"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}>
                      Monthly SIP
                    </button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm text-slate-400 mb-1'>
                        {calculatorInputs.investmentType === "lumpsum"
                          ? "Lumpsum Amount"
                          : "Monthly SIP Amount"}
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
                        className='w-full px-4 py-2 rounded bg-slate-800 text-slate-50 border border-slate-700 focus:outline-none focus:border-slate-500'
                        min='0'
                      />
                    </div>
                    <div>
                      <label className='block text-sm text-slate-400 mb-1'>
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
                        className='w-full px-4 py-2 rounded bg-slate-800 text-slate-50 border border-slate-700 focus:outline-none focus:border-slate-500'
                        min='1'
                        max='50'
                      />
                    </div>
                  </div>

                  <div className='bg-slate-800 p-4 rounded-lg'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <div className='text-slate-400'>Expected CAGR</div>
                        <div className='text-xl font-semibold'>
                          {cagrData["Max"].toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400'>Total Investment</div>
                        <div className='text-xl font-semibold'>
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
                        <div className='text-slate-400'>Total Corpus</div>
                        <div className='text-xl font-semibold text-green-500'>
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
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400'>Total Returns</div>
                        <div className='text-xl font-semibold text-green-500'>
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
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400'>Tax Amount</div>
                        <div className='text-xl font-semibold text-red-500'>
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
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400'>Corpus After Tax</div>
                        <div className='text-xl font-semibold text-green-500'>
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
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </section>
        ) : null}
      </div>
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
