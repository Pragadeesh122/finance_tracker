interface TaxToggleProps {
  includeTax: boolean;
  onToggle: (includeTax: boolean) => void;
}

export default function TaxToggle({includeTax, onToggle}: TaxToggleProps) {
  return (
    <div className='flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3'>
      <div className='flex items-center gap-3'>
        <div className='text-sm font-medium text-foreground'>
          Include Tax Calculations
        </div>
        <div className='text-xs text-muted-foreground'>
          12.5% tax on gains above ₹1.5L exemption
        </div>
      </div>
      <button
        onClick={() => onToggle(!includeTax)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
          includeTax
            ? "bg-accent"
            : "bg-secondary"
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
