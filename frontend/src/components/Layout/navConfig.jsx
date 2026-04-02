import {
  ChartColumnBig,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Receipt,
  Settings,
  Shapes,
  WalletCards,
} from 'lucide-react';

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/categories', icon: Shapes, label: 'Categories' },
  { path: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { path: '/analytics', icon: ChartColumnBig, label: 'Analytics' },
  { path: '/recurring', icon: Repeat, label: 'Recurring' },
  { path: '/reports', icon: WalletCards, label: 'Reports' },
  { path: '/profile', icon: Settings, label: 'Profile' },
];

