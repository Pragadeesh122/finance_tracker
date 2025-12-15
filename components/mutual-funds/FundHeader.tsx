"use client";

import { FundData } from "./types";

interface FundHeaderProps {
  selectedFund: FundData;
  isDiscontinued: boolean;
}

export function FundHeader({ selectedFund, isDiscontinued }: FundHeaderProps) {
  return (
    <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
      <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
      <div className='relative'>
        <h2 className='text-xl font-semibold text-foreground sm:text-2xl'>
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
  );
}