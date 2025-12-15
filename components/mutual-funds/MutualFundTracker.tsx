"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { FundSearch } from "./FundSearch";
import { FundHeader } from "./FundHeader";
import { NAVChart } from "./NAVChart";
import { FundDetails } from "./FundDetails";
import { InvestmentCalculator } from "./InvestmentCalculator";
import { 
  FundData, 
  SearchResult, 
  TimePeriod 
} from "./types";
import { 
  getAllFunds, 
  searchFunds, 
  searchLocalFunds, 
  getFundDetails, 
  getFundMetrics,
  getCAGR 
} from "./utils";

function MutualFundTrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1Y");
  const [allFunds, setAllFunds] = useState<SearchResult[]>([]);

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
        fundDetails.data = { ...fundDetails.data, ...additionalMetrics };
        router.push(`?fund=${amfiCode}`, { scroll: false });
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

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      // First try client-side search
      if (allFunds.length > 0) {
        const localResults = searchLocalFunds(allFunds, searchQuery);
        if (localResults.length > 0) {
          setSearchResults(localResults);
          setLoading(false);
          return;
        }
      }

      // Fall back to API search if no local results
      const results = await searchFunds(searchQuery);
      setSearchResults(results);
      setLoading(false);
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allFunds]);

  const cagrData = selectedFund?.data?.navData
    ? getCAGR(selectedFund.data.navData)
    : {};

  // Check if fund is discontinued
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
            <p className='mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base'>
              Track, analyze, and compare mutual fund performance with real-time
              data and interactive charts
            </p>
          </div>

          <FundSearch
            ref={searchInputRef}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            loading={loading}
            onFundSelect={handleFundSelect}
            allFunds={allFunds}
          />
        </div>
      </div>

      {/* Selected Fund Details or Empty State */}
      {loading ? (
        <LoadingSkeleton />
      ) : selectedFund && selectedFund.data ? (
        <div className='mx-[6%] py-8'>
          {/* Back Button */}
          <button
            onClick={() => {
              window.location.href = '/mutual_fund';
            }}
            className='group mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-950 dark:hover:text-violet-300'
          >
            <svg
              className='h-4 w-4 transition-transform group-hover:-translate-x-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Search
          </button>

          <div className='space-y-6'>
            <FundHeader selectedFund={selectedFund} isDiscontinued={isDiscontinued} />

            <NAVChart
              selectedFund={selectedFund}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />

            <FundDetails selectedFund={selectedFund} />

            <InvestmentCalculator selectedFund={selectedFund} cagrData={cagrData} />
          </div>
        </div>
      ) : (
        <div className='mx-[6%] py-12'>
          {/* Empty State with Featured Content */}
          <div className='space-y-8'>
            {/* Popular Searches */}
            <div>
              <h2 className='mb-4 text-2xl font-bold text-foreground'>
                Popular Searches
              </h2>
              <div className='flex flex-wrap gap-3'>
                {[
                  'HDFC',
                  'ICICI',
                  'SBI',
                  'Axis',
                  'Kotak',
                  'Nippon',
                  'Aditya Birla',
                  'UTI',
                  'Parag Parikh',
                  'Motilal Oswal',
                  'Mirae Asset',
                  'Tata',
                ].map((fundHouse) => (
                  <button
                    key={fundHouse}
                    onClick={() => {
                      setSearchQuery(fundHouse);
                      setTimeout(() => {
                        searchInputRef.current?.focus();
                      }, 100);
                    }}
                    className='rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:scale-105 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-950 dark:hover:text-violet-300'
                  >
                    {fundHouse}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className='grid gap-6 md:grid-cols-3'>
              <div className='rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-slate-800 dark:from-blue-950/30 dark:to-cyan-950/30'>
                <div className='mb-3 text-3xl'>🎯</div>
                <h3 className='mb-2 text-lg font-semibold text-foreground'>
                  Real-time NAV Data
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Access up-to-date Net Asset Values and historical performance data for thousands of mutual funds
                </p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-slate-800 dark:from-green-950/30 dark:to-emerald-950/30'>
                <div className='mb-3 text-3xl'>📊</div>
                <h3 className='mb-2 text-lg font-semibold text-foreground'>
                  Performance Analysis
                </h3>
                <p className='text-sm text-muted-foreground'>
                  View interactive charts and analyze CAGR returns across different time periods
                </p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-slate-800 dark:from-purple-950/30 dark:to-pink-950/30'>
                <div className='mb-3 text-3xl'>💡</div>
                <h3 className='mb-2 text-lg font-semibold text-foreground'>
                  Investment Calculator
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Plan your investments with built-in SIP and lumpsum calculators for any fund
                </p>
              </div>
            </div>

            {/* Getting Started */}
            <div className='rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
              <h2 className='mb-4 text-2xl font-bold text-foreground'>
                Getting Started
              </h2>
              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white'>
                    1
                  </div>
                  <div>
                    <h4 className='font-semibold text-foreground'>
                      Search for a Fund
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      Use the search bar above to find any mutual fund by name or fund house
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white'>
                    2
                  </div>
                  <div>
                    <h4 className='font-semibold text-foreground'>
                      Analyze Performance
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      View NAV charts, historical returns, and key metrics to evaluate the fund
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white'>
                    3
                  </div>
                  <div>
                    <h4 className='font-semibold text-foreground'>
                      Plan Your Investment
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      Use the investment calculator to project returns and plan your SIP or lumpsum investment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function MutualFundTracker() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MutualFundTrackerContent />
    </Suspense>
  );
}