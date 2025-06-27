import {ProjectionInputs} from "./types";
import {
  calculateLumpsumValue,
  calculateSIPValue,
  calculateYearlySIPValue,
  calculateTaxAmount,
} from "./utils";
import InvestmentTypeButtons from "./InvestmentTypeButtons";
import TaxToggle from "./TaxToggle";

interface ProjectionCalculatorSectionProps {
  projectionInputs: ProjectionInputs;
  onInputChange: (
    field: keyof ProjectionInputs,
    value: string | number | "lumpsum" | "sip" | "yearly"
  ) => void;
  includeTax: boolean;
  onTaxToggle: (includeTax: boolean) => void;
}

export default function ProjectionCalculatorSection({
  projectionInputs,
  onInputChange,
  includeTax,
  onTaxToggle,
}: ProjectionCalculatorSectionProps) {
  const projectedAmount =
    projectionInputs.investmentType === "lumpsum"
      ? calculateLumpsumValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : projectionInputs.investmentType === "sip"
      ? calculateSIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        )
      : calculateYearlySIPValue(
          projectionInputs.amount,
          projectionInputs.cagr,
          projectionInputs.years
        );

  const totalInvestment =
    projectionInputs.investmentType === "lumpsum"
      ? projectionInputs.amount
      : projectionInputs.investmentType === "sip"
      ? projectionInputs.amount * projectionInputs.years * 12
      : projectionInputs.amount * projectionInputs.years;

  const totalGains = projectedAmount - totalInvestment;

  return (
    <div className='transform rounded-lg border border-slate-200/60 bg-white/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80 sm:p-6'>
      <div className='grid gap-3'>
        <InvestmentTypeButtons
          investmentType={projectionInputs.investmentType}
          onTypeChange={(type) => onInputChange("investmentType", type)}
        />

        <TaxToggle includeTax={includeTax} onToggle={onTaxToggle} />

        <div className='grid gap-3 sm:grid-cols-3'>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
              {projectionInputs.investmentType === "lumpsum"
                ? "Lumpsum Amount (₹)"
                : projectionInputs.investmentType === "sip"
                ? "Monthly SIP Amount (₹)"
                : "Yearly SIP Amount (₹)"}
            </label>
            <input
              type='number'
              value={projectionInputs.amount || ""}
              onChange={(e) => onInputChange("amount", e.target.value)}
              placeholder={
                projectionInputs.investmentType === "lumpsum"
                  ? "Enter lumpsum amount"
                  : projectionInputs.investmentType === "sip"
                  ? "Enter monthly SIP amount"
                  : "Enter yearly SIP amount"
              }
              className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
              min='0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Expected CAGR (%)
            </label>
            <input
              type='number'
              value={projectionInputs.cagr || ""}
              onChange={(e) => onInputChange("cagr", e.target.value)}
              placeholder='Enter expected CAGR'
              className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
              min='0'
              max='100'
              step='0.1'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Investment Period (Years)
            </label>
            <input
              type='number'
              value={projectionInputs.years || ""}
              onChange={(e) => onInputChange("years", e.target.value)}
              placeholder='Enter investment period'
              className='mt-1 block w-full rounded-md border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500'
              min='1'
              max='50'
            />
          </div>
        </div>

        <div className='mt-2 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-white p-3 dark:from-slate-800 dark:to-slate-900/80'>
          <div
            className={`grid grid-cols-2 gap-3 ${
              includeTax ? "sm:grid-cols-5" : "sm:grid-cols-3"
            }`}>
            <div>
              <div className='text-xs text-slate-600 dark:text-slate-400'>
                Total Investment
              </div>
              <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400'>
                ₹{Math.round(totalInvestment).toLocaleString()}
              </div>
            </div>
            <div>
              <div className='text-xs text-slate-600 dark:text-slate-400'>
                Total Returns
              </div>
              <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400'>
                ₹{Math.round(totalGains).toLocaleString()}
              </div>
            </div>
            <div>
              <div className='text-xs text-slate-600 dark:text-slate-400'>
                Total Corpus
              </div>
              <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400'>
                ₹{Math.round(projectedAmount).toLocaleString()}
              </div>
            </div>
            {includeTax && (
              <>
                <div>
                  <div className='text-xs text-slate-600 dark:text-slate-400'>
                    Tax Amount
                  </div>
                  <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent dark:from-rose-400 dark:to-red-400'>
                    ₹
                    {Math.round(
                      calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-slate-600 dark:text-slate-400'>
                    Post-tax Amount
                  </div>
                  <div className='mt-0.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400'>
                    ₹
                    {Math.round(
                      projectedAmount -
                        calculateTaxAmount(totalGains, includeTax)
                    ).toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
