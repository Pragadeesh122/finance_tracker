"use client";

import { forwardRef } from "react";
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
        <div className='absolute -inset-0.5 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700'></div>
        <div className='relative'>
          <input
            ref={ref}
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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