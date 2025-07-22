"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
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
            <p className='mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base'>
              Track, analyze, and compare mutual fund performance with real-time
              data and interactive charts
            </p>
          </div>

          <FundSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            loading={loading}
            onFundSelect={handleFundSelect}
            allFunds={allFunds}
          />
        </div>
      </div>

      {/* Selected Fund Details */}
      {loading ? (
        <LoadingSkeleton />
      ) : selectedFund && selectedFund.data ? (
        <div className='mx-[6%] py-8'>
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
      ) : null}
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