export function LoadingSkeleton() {
  return (
    <section className='bg-slate-900 p-4 rounded-lg border border-slate-800 animate-pulse'>
      {/* Fund Name Skeleton */}
      <div className='h-8 w-2/3 bg-slate-800 rounded mb-4'></div>

      {/* Price Chart Section Skeleton */}
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-4'>
          <div className='w-full'>
            <div className='h-5 w-24 bg-slate-800 rounded mb-4'></div>
            <div className='grid grid-cols-4 gap-4 mt-2'>
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className='h-4 w-16 bg-slate-800 rounded mb-2'></div>
                  <div className='h-6 w-20 bg-slate-800 rounded'></div>
                </div>
              ))}
            </div>
          </div>
          <div className='flex gap-2'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='h-8 w-12 bg-slate-800 rounded'></div>
            ))}
          </div>
        </div>

        {/* Chart Area Skeleton */}
        <div className='h-[400px] w-full bg-slate-800 rounded'></div>
      </div>

      {/* Fund Details Skeleton */}
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className='h-4 w-24 bg-slate-800 rounded mb-2'></div>
              <div className='h-6 w-32 bg-slate-800 rounded'></div>
            </div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className='h-4 w-24 bg-slate-800 rounded mb-2'></div>
            <div className='h-6 w-48 bg-slate-800 rounded'></div>
          </div>
        ))}
      </div>

      {/* Metrics Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        {[...Array(9)].map((_, i) => (
          <div key={i}>
            <div className='h-4 w-24 bg-slate-800 rounded mb-2'></div>
            <div className='h-6 w-32 bg-slate-800 rounded'></div>
          </div>
        ))}
      </div>

      {/* Calculator Section Skeleton */}
      <div className='mt-8 bg-slate-800 p-4 rounded-lg'>
        <div className='h-6 w-48 bg-slate-700 rounded mb-4'></div>
        <div className='space-y-6'>
          <div className='flex gap-4'>
            {[...Array(2)].map((_, i) => (
              <div key={i} className='h-10 w-24 bg-slate-700 rounded'></div>
            ))}
          </div>
          <div className='grid grid-cols-2 gap-4'>
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className='h-4 w-32 bg-slate-700 rounded mb-2'></div>
                <div className='h-8 w-full bg-slate-700 rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
