export function LoadingSkeleton() {
  return (
    <div className='mx-[6%] py-8'>
      <div className='space-y-6'>
        {/* Fund Header Skeleton */}
        <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-700'></div>
            <div className='flex gap-4'>
              <div className='h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-700'></div>
              <div className='h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-700'></div>
            </div>
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <div className='animate-pulse space-y-6'>
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
              <div className='space-y-4'>
                <div className='h-5 w-24 rounded-lg bg-slate-200 dark:bg-slate-700'></div>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className='rounded-lg bg-slate-100 p-3 dark:bg-slate-800'>
                      <div className='h-4 w-16 rounded bg-slate-200 dark:bg-slate-700'></div>
                      <div className='mt-2 h-6 w-24 rounded bg-slate-200 dark:bg-slate-700'></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='h-9 w-16 rounded-lg bg-slate-200 dark:bg-slate-700'></div>
                ))}
              </div>
            </div>
            <div className='h-[400px] rounded-lg bg-slate-100 dark:bg-slate-800'></div>
          </div>
        </div>

        {/* Fund Details Grid Skeleton */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='animate-pulse space-y-3'>
                <div className='h-4 w-24 rounded bg-slate-200 dark:bg-slate-700'></div>
                <div className='h-6 w-32 rounded bg-slate-200 dark:bg-slate-700'></div>
              </div>
            </div>
          ))}
        </div>

        {/* Fund Metrics Grid Skeleton */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
              <div className='animate-pulse space-y-3'>
                <div className='h-4 w-32 rounded bg-slate-200 dark:bg-slate-700'></div>
                <div className='h-6 w-24 rounded bg-slate-200 dark:bg-slate-700'></div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculator Section Skeleton */}
        <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <div className='animate-pulse space-y-6'>
            <div className='h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-700'></div>
            <div className='space-y-6'>
              <div className='flex gap-2'>
                <div className='h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-700'></div>
                <div className='h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-700'></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='h-5 w-32 rounded bg-slate-200 dark:bg-slate-700'></div>
                  <div className='h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700'></div>
                </div>
                <div className='space-y-2'>
                  <div className='h-5 w-40 rounded bg-slate-200 dark:bg-slate-700'></div>
                  <div className='h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700'></div>
                </div>
              </div>
              <div className='rounded-xl bg-slate-50 p-6 dark:bg-slate-800/50'>
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className='space-y-2'>
                      <div className='h-4 w-28 rounded bg-slate-200 dark:bg-slate-700'></div>
                      <div className='h-8 w-36 rounded bg-slate-200 dark:bg-slate-700'></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
