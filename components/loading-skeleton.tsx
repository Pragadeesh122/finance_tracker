export function LoadingSkeleton() {
  return (
    <div className='space-y-8'>
      {/* Fund Name Skeleton */}
      <div className='h-8 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800' />

      {/* Chart Section Skeleton */}
      <div className='space-y-4'>
        <div className='flex justify-between'>
          <div className='space-y-2'>
            <div className='h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
            <div className='grid grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='space-y-1'>
                  <div className='h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
                  <div className='h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
                </div>
              ))}
            </div>
          </div>
          <div className='flex gap-2'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800'
              />
            ))}
          </div>
        </div>
        <div className='h-[400px] w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800' />
      </div>

      {/* Fund Details Skeleton */}
      <div className='grid grid-cols-2 gap-4'>
        {[...Array(6)].map((_, i) => (
          <div key={i} className='space-y-1'>
            <div className='h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
            <div className='h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
          </div>
        ))}
      </div>

      {/* Metrics Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[...Array(9)].map((_, i) => (
          <div key={i} className='space-y-1'>
            <div className='h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
            <div className='h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
          </div>
        ))}
      </div>

      {/* Calculator Section Skeleton */}
      <div className='space-y-4'>
        <div className='h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
        <div className='flex gap-4'>
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className='h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800'
            />
          ))}
        </div>
        <div className='grid grid-cols-2 gap-4'>
          {[...Array(2)].map((_, i) => (
            <div key={i} className='space-y-1'>
              <div className='h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
              <div className='h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
