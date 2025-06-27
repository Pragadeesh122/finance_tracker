interface TaxToggleProps {
  includeTax: boolean;
  onToggle: (includeTax: boolean) => void;
}

export default function TaxToggle({includeTax, onToggle}: TaxToggleProps) {
  return (
    <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50'>
      <div className='flex items-center gap-3'>
        <div className='text-sm font-medium text-slate-700 dark:text-slate-300'>
          Include Tax Calculations
        </div>
        <div className='text-xs text-slate-500 dark:text-slate-400'>
          12.5% tax on gains above ₹1.5L exemption
        </div>
      </div>
      <button
        onClick={() => onToggle(!includeTax)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          includeTax
            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
            : "bg-slate-200 dark:bg-slate-700"
        }`}>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            includeTax ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
