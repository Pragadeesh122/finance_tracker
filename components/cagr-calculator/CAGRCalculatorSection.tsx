import {CAGRInputs} from "./types";
import {calculateCAGR, calculateTaxAmount} from "./utils";
import TaxToggle from "./TaxToggle";

interface CAGRCalculatorSectionProps {
  cagrInputs: CAGRInputs;
  onInputChange: (field: keyof CAGRInputs, value: string | number) => void;
  includeTax: boolean;
  onTaxToggle: (includeTax: boolean) => void;
}

export default function CAGRCalculatorSection({
  cagrInputs,
  onInputChange,
  includeTax,
  onTaxToggle,
}: CAGRCalculatorSectionProps) {
  const cagr = calculateCAGR(
    cagrInputs.initialAmount,
    cagrInputs.finalAmount,
    cagrInputs.years + cagrInputs.months / 12
  );

  const totalGains = cagrInputs.finalAmount - cagrInputs.initialAmount;

  return (
    <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
      <div className='grid gap-4 sm:gap-6'>
        <div>
          <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
            Initial Investment Amount (₹)
          </label>
          <input
            type='number'
            value={cagrInputs.initialAmount || ""}
            onChange={(e) => onInputChange("initialAmount", e.target.value)}
            placeholder='Enter initial amount'
            className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
            min='0'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
            Final Amount (₹)
          </label>
          <input
            type='number'
            value={cagrInputs.finalAmount || ""}
            onChange={(e) => onInputChange("finalAmount", e.target.value)}
            placeholder='Enter final amount'
            className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
            min='0'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Years
            </label>
            <input
              type='number'
              value={cagrInputs.years || ""}
              onChange={(e) => onInputChange("years", e.target.value)}
              placeholder='Years'
              className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
              min='0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Months
            </label>
            <input
              type='number'
              value={cagrInputs.months || ""}
              onChange={(e) => onInputChange("months", e.target.value)}
              placeholder='Months'
              className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
              min='0'
              max='11'
            />
          </div>
        </div>

        <TaxToggle includeTax={includeTax} onToggle={onTaxToggle} />

        <div className='mt-6 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-white p-4 dark:from-slate-800 dark:to-slate-900/80'>
          <div className='text-sm text-slate-600 dark:text-slate-400'>
            Calculated CAGR
          </div>
          <div className='mt-1 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent dark:from-indigo-400 dark:via-fuchsia-400 dark:to-violet-400'>
            {cagr.toFixed(2)}%
          </div>
          <div className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
            This is the annualized return rate that represents the geometric
            progression ratio that provides a constant rate of return over the
            time period.
          </div>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
              <div className='text-sm text-slate-500 dark:text-slate-400'>
                Initial Amount
              </div>
              <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                ₹{Math.round(cagrInputs.initialAmount).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
              <div className='text-sm text-slate-500 dark:text-slate-400'>
                Final Amount
              </div>
              <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                ₹{Math.round(cagrInputs.finalAmount).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
              <div className='text-sm text-slate-500 dark:text-slate-400'>
                Total Returns
              </div>
              <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                ₹{Math.round(totalGains).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
              <div className='text-sm text-slate-500 dark:text-slate-400'>
                Total Corpus (Before Tax)
              </div>
              <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                ₹{Math.round(cagrInputs.finalAmount).toLocaleString()}
              </div>
            </div>
            {includeTax && (
              <>
                <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                  <div className='text-sm text-slate-500 dark:text-slate-400'>
                    Tax Amount
                  </div>
                  <div className='mt-1 font-semibold text-red-600 dark:text-red-400'>
                    ₹
                    {Math.round(
                      calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
                <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
                  <div className='text-sm text-slate-500 dark:text-slate-400'>
                    Post-tax Amount
                  </div>
                  <div className='mt-1 font-semibold text-emerald-600 dark:text-emerald-400'>
                    ₹
                    {Math.round(
                      cagrInputs.finalAmount -
                        calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
              </>
            )}
            <div className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
              <div className='text-sm text-slate-500 dark:text-slate-400'>
                Investment Period
              </div>
              <div className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                {Math.round(cagrInputs.years)} Years {cagrInputs.months} Months
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
