/**
 * Calculator Icons - Professional icon mapping for finance calculators
 *
 * This file provides a centralized icon system using lucide-react,
 * specifically curated for financial calculator interfaces.
 */

import {
  Calculator,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  BarChart3,
  LineChart,
  Calendar,
  Clock,
  Percent,
  IndianRupee,
  DollarSign,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Home,
  GraduationCap,
  Plane,
  Heart,
  ShoppingCart,
  User,
  Users,
  Crown,
  Zap,
  Shield,
  CheckCircle2,
  Info,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart2,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff
} from "lucide-react";

/**
 * Calculator Type Icons - Main calculator categories
 */
export const CalculatorTypeIcons = {
  cagr: TrendingUp,
  sip: PiggyBank,
  lumpsum: Wallet,
  stepUp: ArrowUpRight,
  retirement: Crown,
  goal: Target,
  general: Calculator
};

/**
 * Investment Icons - For investment-related UI elements
 */
export const InvestmentIcons = {
  growth: TrendingUp,
  decline: TrendingDown,
  returns: Sparkles,
  corpus: Wallet,
  portfolio: Briefcase,
  monthly: Calendar,
  yearly: Clock,
  initial: DollarSign,
  final: Target
};

/**
 * Goal Icons - For different financial goals
 */
export const GoalIcons = {
  retirement: Crown,
  home: Home,
  education: GraduationCap,
  travel: Plane,
  wedding: Heart,
  emergency: Shield,
  general: Target
};

/**
 * Chart & Data Icons
 */
export const ChartIcons = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  area: BarChart2,
  activity: Activity
};

/**
 * Input Field Icons - For different input types
 */
export const InputFieldIcons = {
  currency: IndianRupee,
  percentage: Percent,
  calendar: Calendar,
  time: Clock,
  user: User,
  family: Users
};

/**
 * Action Icons - For buttons and interactive elements
 */
export const ActionIcons = {
  calculate: Calculator,
  reset: RefreshCw,
  download: Download,
  upload: Upload,
  view: Eye,
  hide: EyeOff,
  expand: ChevronDown,
  collapse: ChevronUp,
  next: ChevronRight
};

/**
 * Status Icons - For feedback and states
 */
export const StatusIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: AlertCircle
};

/**
 * Icon Size Presets
 */
export const IconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10"
} as const;

/**
 * Icon Color Classes - Using the forest green accent theme
 */
export const IconColors = {
  accent: "text-accent", // Forest green
  muted: "text-muted-foreground",
  foreground: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  growth: "text-emerald-600 dark:text-emerald-400",
  decline: "text-red-600 dark:text-red-400"
} as const;

/**
 * Unified export of all calculator-related icons
 */
export const CalculatorIcons = {
  ...CalculatorTypeIcons,
  ...InvestmentIcons,
  ...GoalIcons,
  ...ChartIcons,
  ...InputFieldIcons,
  ...ActionIcons,
  ...StatusIcons
};

// Type exports for TypeScript support
export type CalculatorIconType = keyof typeof CalculatorTypeIcons;
export type InvestmentIconType = keyof typeof InvestmentIcons;
export type GoalIconType = keyof typeof GoalIcons;
export type IconSize = keyof typeof IconSizes;
export type IconColor = keyof typeof IconColors;
