"use client";

import { FundData } from "./types";

interface FundHeaderProps {
  selectedFund: FundData;
  isDiscontinued: boolean;
}

export function FundHeader({ selectedFund, isDiscontinued }: FundHeaderProps) {
  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div>
        <h2 className='font-display text-xl font-semibold text-foreground sm:text-2xl'>
          {selectedFund.name}
        </h2>
        <div className='mt-2 flex flex-wrap gap-4'>
          <div className='rounded-full bg-secondary px-3 py-1 text-sm text-foreground border border-border'>
            {selectedFund.data.schemeCategory}
          </div>
          <div className='rounded-full bg-secondary px-3 py-1 text-sm text-foreground border border-border'>
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