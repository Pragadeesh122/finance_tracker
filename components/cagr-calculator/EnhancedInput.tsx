"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
  IndianRupee,
  User,
  Target,
  ArrowUpCircle,
  ArrowDownCircle,
  Info
} from "lucide-react";

export type InputVariant = "currency" | "percentage" | "years" | "months" | "number" | "age";
export type IconPosition = "prefix" | "suffix" | "none";

interface EnhancedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  variant?: InputVariant;
  value: number | string;
  onChange: (value: number) => void;
  helperText?: string;
  error?: string;
  showFloatingLabel?: boolean;
  iconPosition?: IconPosition;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

const variantConfig = {
  currency: {
    icon: IndianRupee,
    iconPosition: "prefix" as IconPosition,
    placeholder: "0",
    inputMode: "decimal" as const,
    step: 1,
    min: 0,
    max: undefined,
    suffix: ""
  },
  percentage: {
    icon: Percent,
    iconPosition: "suffix" as IconPosition,
    placeholder: "0.0",
    inputMode: "decimal" as const,
    step: 0.1,
    min: 0,
    max: 100,
    suffix: "%"
  },
  years: {
    icon: Calendar,
    iconPosition: "prefix" as IconPosition,
    placeholder: "0",
    inputMode: "numeric" as const,
    step: 1,
    min: 0,
    max: 50,
    suffix: "yrs"
  },
  months: {
    icon: Calendar,
    iconPosition: "prefix" as IconPosition,
    placeholder: "0",
    inputMode: "numeric" as const,
    step: 1,
    min: 0,
    max: 11,
    suffix: "mo"
  },
  age: {
    icon: User,
    iconPosition: "prefix" as IconPosition,
    placeholder: "0",
    inputMode: "numeric" as const,
    step: 1,
    min: 18,
    max: 100,
    suffix: "years"
  },
  number: {
    icon: null,
    iconPosition: "none" as IconPosition,
    placeholder: "0",
    inputMode: "numeric" as const,
    step: 1,
    min: 0,
    max: undefined,
    suffix: ""
  }
};

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      label,
      variant = "number",
      value,
      onChange,
      helperText,
      error,
      showFloatingLabel = true,
      iconPosition: customIconPosition,
      unit,
      className,
      min: customMin,
      max: customMax,
      step: customStep,
      placeholder: customPlaceholder,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(!!value);

    const config = variantConfig[variant];
    const Icon = config.icon;
    const iconPos = customIconPosition || config.iconPosition;

    // Determine values with custom overrides
    const minValue = customMin !== undefined ? customMin : config.min;
    const maxValue = customMax !== undefined ? customMax : config.max;
    const stepValue = customStep !== undefined ? customStep : config.step;
    const placeholderText = customPlaceholder || config.placeholder;
    const displayUnit = unit || config.suffix;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (inputValue === "") {
        onChange(0);
        setIsFilled(false);
        return;
      }

      const numValue = parseFloat(inputValue);
      if (isNaN(numValue)) {
        return;
      }

      // Apply min/max constraints
      let constrainedValue = numValue;
      if (minValue !== undefined && numValue < minValue) {
        constrainedValue = minValue;
      }
      if (maxValue !== undefined && numValue > maxValue) {
        constrainedValue = maxValue;
      }

      onChange(constrainedValue);
      setIsFilled(true);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const isActive = isFocused || isFilled;

    return (
      <div className={cn("relative", className)}>
        {/* Container with enhanced styling */}
        <div
          className={cn(
            "group relative rounded-xl border-2 bg-background/50 backdrop-blur-sm transition-all duration-300",
            // Border colors based on state
            error
              ? "border-red-300 dark:border-red-800"
              : isFocused
              ? "border-accent shadow-sm shadow-accent/20 ring-4 ring-accent/10"
              : isFilled
              ? "border-accent/40 hover:border-accent/60"
              : "border-border hover:border-accent/30",
            // Background transitions
            isFocused && "bg-background",
            // Add subtle glow on focus
            isFocused && "shadow-lg shadow-accent/5"
          )}
        >
          {/* Floating Label */}
          {showFloatingLabel && (
            <label
              className={cn(
                "absolute left-3 z-10 origin-left px-1 font-medium transition-all duration-300 ease-out pointer-events-none",
                // Position and size based on state
                isActive
                  ? "-top-2.5 scale-75 bg-background text-xs"
                  : "top-3.5 text-sm",
                // Color based on state
                error
                  ? "text-red-500 dark:text-red-400"
                  : isFocused
                  ? "text-accent"
                  : "text-muted-foreground",
                // Add icon offset when prefix icon exists
                iconPos === "prefix" && Icon && (isActive ? "left-3" : "left-10")
              )}
            >
              {label}
            </label>
          )}

          {/* Input Container */}
          <div className="flex items-center">
            {/* Prefix Icon */}
            {Icon && iconPos === "prefix" && (
              <div
                className={cn(
                  "flex items-center justify-center pl-3.5 pr-1 transition-colors duration-300",
                  error
                    ? "text-red-400"
                    : isFocused
                    ? "text-accent"
                    : isFilled
                    ? "text-accent/70"
                    : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "transition-all duration-300",
                    isFocused ? "h-5 w-5" : "h-4.5 w-4.5"
                  )}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </div>
            )}

            {/* Input Field */}
            <input
              ref={ref}
              type="number"
              value={value || ""}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={showFloatingLabel && !isActive ? "" : placeholderText}
              inputMode={config.inputMode}
              min={minValue}
              max={maxValue}
              step={stepValue}
              className={cn(
                "w-full border-0 bg-transparent py-3.5 text-base font-medium text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-300",
                // Padding adjustments based on icons
                iconPos === "prefix" && Icon ? "pl-2 pr-3" : "px-4",
                iconPos === "suffix" && Icon ? "pr-2" : "",
                // Larger text on focus for better readability
                isFocused && "text-lg",
                // Floating label spacing
                showFloatingLabel && "pt-5 pb-2"
              )}
              {...props}
            />

            {/* Suffix (Unit or Icon) */}
            {displayUnit && iconPos !== "suffix" && (
              <div
                className={cn(
                  "pr-4 text-sm font-semibold transition-colors duration-300",
                  isFocused
                    ? "text-accent"
                    : isFilled
                    ? "text-accent/70"
                    : "text-muted-foreground/60"
                )}
              >
                {displayUnit}
              </div>
            )}

            {/* Suffix Icon */}
            {Icon && iconPos === "suffix" && (
              <div
                className={cn(
                  "flex items-center justify-center pl-1 pr-3.5 transition-colors duration-300",
                  error
                    ? "text-red-400"
                    : isFocused
                    ? "text-accent"
                    : isFilled
                    ? "text-accent/70"
                    : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "transition-all duration-300",
                    isFocused ? "h-5 w-5" : "h-4.5 w-4.5"
                  )}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </div>
            )}
          </div>

          {/* Focus indicator bar at bottom */}
          <div
            className={cn(
              "absolute bottom-0 left-0 h-0.5 w-full origin-center scale-x-0 rounded-full bg-accent transition-transform duration-300",
              isFocused && "scale-x-100"
            )}
          />
        </div>

        {/* Helper Text or Error Message */}
        {(helperText || error) && (
          <div
            className={cn(
              "mt-1.5 flex items-start gap-1.5 px-1 text-xs font-medium transition-colors duration-200",
              error ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
            )}
          >
            {error && (
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span>{error || helperText}</span>
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

// Export icon components for use in other parts of the app
export const FinanceIcons = {
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
  IndianRupee,
  User,
  Target,
  ArrowUpCircle,
  ArrowDownCircle,
  Info
};
