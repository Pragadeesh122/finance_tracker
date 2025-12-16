"use client";

import { forwardRef } from "react";
import { Search } from "lucide-react";
import { SearchResult } from "./types";

interface FundSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  loading: boolean;
  onFundSelect: (amfiCode: string) => void;
  allFunds: SearchResult[];
}

export const FundSearch = forwardRef<HTMLInputElement, FundSearchProps>(
  function FundSearch({
    searchQuery,
    onSearchChange,
    searchResults,
    loading,
    onFundSelect,
  }, ref) {

  return (
    <div className='mx-auto mt-8 max-w-2xl'>
      <div className='relative group'>
        <div className='relative'>
          {/* Search Icon */}
          <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent'>
            <Search className='h-5 w-5' strokeWidth={2} />
          </div>

          <input
            ref={ref}
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search mutual funds by name or fund house...'
            className='w-full rounded-lg border border-border bg-background pl-12 pr-12 py-3.5 text-foreground placeholder-muted-foreground transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.05)] hover:border-accent/50'
          />

          {loading && (
            <div className='absolute right-4 top-1/2 -translate-y-1/2'>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent'></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className='relative mt-2'>
          <div className='relative max-h-96 space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-2'>
            {searchResults.map((fund) => (
              <button
                key={fund.schemeCode}
                onClick={() => onFundSelect(fund.schemeCode)}
                className='w-full rounded-md p-3 text-left transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700'>
                <div className='font-medium text-foreground'>
                  {fund.schemeName}
                </div>
                <div className='mt-0.5 text-sm text-muted-foreground'>
                  {fund.fundHouse}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});