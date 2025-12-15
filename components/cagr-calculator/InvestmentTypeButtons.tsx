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
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      investmentType === type
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
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
