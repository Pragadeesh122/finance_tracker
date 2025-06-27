import {ProjectionInputs} from "./types";

interface InvestmentTypeButtonsProps {
  investmentType: ProjectionInputs["investmentType"];
  onTypeChange: (type: ProjectionInputs["investmentType"]) => void;
}

export default function InvestmentTypeButtons({
  investmentType,
  onTypeChange,
}: InvestmentTypeButtonsProps) {
  const buttonClass = (type: ProjectionInputs["investmentType"]) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
      investmentType === type
        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm dark:from-indigo-500 dark:to-violet-500"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    }`;

  return (
    <div className='flex flex-wrap gap-2'>
      <button
        onClick={() => onTypeChange("lumpsum")}
        className={buttonClass("lumpsum")}>
        Lumpsum
      </button>
      <button
        onClick={() => onTypeChange("sip")}
        className={buttonClass("sip")}>
        Monthly SIP
      </button>
      <button
        onClick={() => onTypeChange("yearly")}
        className={buttonClass("yearly")}>
        Yearly SIP
      </button>
    </div>
  );
}
