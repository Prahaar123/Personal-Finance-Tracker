import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CarFront,
  Clapperboard,
  FileText,
  Gamepad2,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Home,
  Plane,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';

const iconMap = {
  salary: BadgeDollarSign,
  freelance: BriefcaseBusiness,
  investment: HandCoins,
  food: UtensilsCrossed,
  transport: CarFront,
  shopping: ShoppingBag,
  entertainment: Clapperboard,
  bills: FileText,
  healthcare: HeartPulse,
  education: GraduationCap,
  housing: Home,
  travel: Plane,
  gaming: Gamepad2,
  phone: Smartphone,
  wallet: Wallet,
};

const legacyIconAliases = {
  '💰': 'salary',
  '💼': 'freelance',
  '📈': 'investment',
  '🍔': 'food',
  '🚗': 'transport',
  '🛍️': 'shopping',
  '🎮': 'gaming',
  '📄': 'bills',
  '🏥': 'healthcare',
  '📚': 'education',
  '🏠': 'housing',
  '✈️': 'travel',
};

export const CATEGORY_ICON_OPTIONS = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'bills', label: 'Bills' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'housing', label: 'Housing' },
  { value: 'travel', label: 'Travel' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'phone', label: 'Phone' },
  { value: 'wallet', label: 'Wallet' },
];

export const CategoryIcon = ({ icon, className = 'h-5 w-5', fallbackClassName = 'text-xl' }) => {
  const normalizedIcon = legacyIconAliases[icon] || icon;
  const LucideIcon = iconMap[normalizedIcon];

  if (LucideIcon) {
    return <LucideIcon className={className} />;
  }

  return <span className={fallbackClassName}>{icon || '•'}</span>;
};
