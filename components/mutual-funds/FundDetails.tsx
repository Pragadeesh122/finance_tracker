"use client";

import { FundData } from "./types";

interface FundDetailsProps {
  selectedFund: FundData;
}

export function FundDetails({ selectedFund }: FundDetailsProps) {
  return (
    <>
      {/* Fund Details Grid */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50'></div>
          <div className='relative'>
            <div className='text-sm font-medium text-slate-400 dark:text-slate-500'>
              Fund House
            </div>
            <div className='mt-2 text-lg font-medium text-foreground'>
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
            <div className='mt-2 text-lg font-medium text-foreground'>
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
            <div className='mt-2 text-lg font-medium text-foreground'>
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
              <div className='mt-2 text-lg font-medium text-foreground'>
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
              <div className='mt-2 text-lg font-medium text-foreground'>
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
              <div className='mt-2 text-lg font-medium text-foreground'>
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
              <div className='mt-2 text-lg font-medium text-foreground'>
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
              <div className='mt-2 text-lg font-medium text-foreground'>
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
              <div className='mt-2 text-lg font-medium text-foreground'>
                {selectedFund.data.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}