import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Landmark,
  PiggyBank,
  Receipt,
  Target,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  getBudgets,
  getCategoryBreakdown,
  getDashboard,
  getIncomeExpenseAnalytics,
  getRecurringTransactions,
} from '@/services/api';
import { useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Charts from '@/components/Dashboard/Charts';

const currency = (value, code = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const fillMonthlySeries = (analytics, selectedYear) => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: format(new Date(selectedYear, index, 1), 'MMM'),
    income: 0,
    expense: 0,
  }));

  analytics.forEach((item) => {
    const monthIndex = (item?._id?.month || 1) - 1;
    if (monthIndex < 0 || monthIndex > 11) return;
    months[monthIndex][item?._id?.type || 'expense'] = item.total || 0;
  });

  return months;
};

const StatCard = ({ label, value, tone = 'text-white', hint, icon: Icon }) => (
  <div className="metric-tile">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="finance-eyebrow">{label}</p>
        <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
        <Icon className="h-5 w-5 text-slate-300" />
      </div>
    </div>
    {hint ? <p className="mt-3 text-sm text-slate-400">{hint}</p> : null}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const monthParam = Number(searchParams.get('month'));
  const yearParam = Number(searchParams.get('year'));
  const selectedMonth = monthParam >= 1 && monthParam <= 12 ? monthParam : new Date().getMonth() + 1;
  const selectedYear = yearParam >= 2000 ? yearParam : new Date().getFullYear();

  const updatePeriod = (nextMonth, nextYear) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(nextMonth));
    params.set('year', String(nextYear));
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [summaryRes, budgetsRes, breakdownRes, analyticsRes, recurringRes] = await Promise.all([
          getDashboard({ month: selectedMonth, year: selectedYear }),
          getBudgets({ month: selectedMonth, year: selectedYear }),
          getCategoryBreakdown({ month: selectedMonth, year: selectedYear, type: 'expense' }),
          getIncomeExpenseAnalytics({ period: 'monthly', year: selectedYear }),
          getRecurringTransactions(),
        ]);

        setSummary(summaryRes.data);
        setBudgets(budgetsRes.data);
        setExpenseBreakdown(breakdownRes.data);
        setTrendData(fillMonthlySeries(analyticsRes.data, selectedYear));
        setRecurring(recurringRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const recurringMonthlyTotal = useMemo(
    () => recurring.filter((item) => item.enabled).reduce((sum, item) => sum + item.amount, 0),
    [recurring]
  );

  const topBudgets = useMemo(
    () => [...budgets].sort((a, b) => (b.percentage || 0) - (a.percentage || 0)).slice(0, 4),
    [budgets]
  );

  const enabledRecurring = useMemo(() => recurring.filter((item) => item.enabled), [recurring]);

  const currencyCode = user?.currency || 'USD';
  const savingsProgress = summary?.savingsGoal > 0 ? Math.min(100, Math.max(0, summary?.savingsPercentage || 0)) : 0;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="finance-eyebrow">Personal Finance Tracker</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Available Balance</h1>
            <p className="mt-2 text-4xl font-semibold text-cyan-400 sm:text-[2.6rem]">{currency(summary?.balance || 0, currencyCode)}</p>
            <p className="mt-3 max-w-2xl text-slate-400">
              Your dashboard is back to being a real finance workspace: live transactions, real budgets, actual category spend, and actionable monthly summaries.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap xl:w-auto xl:flex-nowrap">
            <Select value={selectedMonth.toString()} onValueChange={(value) => updatePeriod(parseInt(value, 10), selectedYear)}>
              <SelectTrigger className="glass-field w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white">
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {format(new Date(selectedYear, index, 1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(value) => updatePeriod(selectedMonth, parseInt(value, 10))}>
              <SelectTrigger className="glass-field w-full sm:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white">
                {Array.from({ length: 5 }, (_, index) => {
                  const year = new Date().getFullYear() - index;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="flex w-full items-center gap-3 rounded-[24px] border border-white/5 bg-[#161a46] px-5 py-4 sm:min-w-[250px] xl:w-auto">
              <CalendarDays className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">{format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy')}</p>
                <p className="text-xs text-slate-500">{user?.name || 'Your finance workspace'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Income" value={currency(summary?.income || 0, currencyCode)} tone="text-cyan-400" hint="Total income recorded this month" icon={ArrowUpRight} />
          <StatCard label="Expenses" value={currency(summary?.expenses || 0, currencyCode)} tone="text-orange-300" hint="Total expense transactions this month" icon={ArrowDownRight} />
          <StatCard label="Budget Use" value={`${summary?.budgetUtilization || 0}%`} hint={`${budgets.length} budget ${budgets.length === 1 ? 'category' : 'categories'} active`} icon={Target} />
          <StatCard label="Recurring" value={currency(recurringMonthlyTotal, currencyCode)} hint={`${enabledRecurring.length} enabled monthly schedules`} icon={Clock3} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.75fr_1.05fr]">
        <div className="space-y-6">
          <section className="finance-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="finance-eyebrow">Cash Flow Trend</p>
                <p className="mt-2 text-2xl font-semibold text-white">Income vs expenses across the year</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-semibold text-white">{currency(summary?.income || 0, currencyCode)}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Current Income</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{currency(summary?.expenses || 0, currencyCode)}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Current Expenses</p>
                </div>
              </div>
            </div>
            <div className="mt-6 h-[320px]">
              <Charts variant="trend" data={trendData} currencyCode={currencyCode} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="finance-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                  <Receipt className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="finance-eyebrow">Recent Transactions</p>
                  <p className="text-sm text-slate-400">Your last recorded activity</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {summary?.recentTransactions?.length ? (
                  summary.recentTransactions.map((transaction) => (
                    <div key={transaction._id} className="data-row gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] text-xl" style={{ backgroundColor: `${transaction.category?.color || '#6366f1'}22` }}>
                          {transaction.category?.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">{transaction.category?.name}</p>
                          <p className="text-sm text-slate-400">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-cyan-400' : 'text-orange-300'}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {currency(transaction.amount, currencyCode)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">
                    No transactions yet. Add your first income or expense to begin tracking.
                  </div>
                )}
              </div>
            </section>

            <section className="finance-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                  <Landmark className="h-5 w-5 text-orange-300" />
                </div>
                <div>
                  <p className="finance-eyebrow">Expense Breakdown</p>
                  <p className="text-sm text-slate-400">Where your spending is going this month</p>
                </div>
              </div>

              <div className="mt-6 h-[240px]">
                <Charts variant="donut" data={expenseBreakdown} currencyCode={currencyCode} />
              </div>

              <div className="mt-4 space-y-3">
                {expenseBreakdown.slice(0, 4).map((entry) => (
                  <div key={entry._id} className="data-row">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color || '#6f48ff' }} />
                      <span className="text-white">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-200">{currency(entry.total, currencyCode)}</span>
                  </div>
                ))}
                {!expenseBreakdown.length ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-center text-sm text-slate-400">
                    No expense categories recorded for this month.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="finance-card finance-card-tight">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold text-cyan-400">{Math.round(savingsProgress)}%</p>
                <p className="mt-1 text-sm font-medium text-white">Savings Goal</p>
                <p className="text-sm text-slate-400">Monthly target progress</p>
              </div>
              <PiggyBank className="mt-1 h-10 w-10 text-violet-400" />
            </div>
            <div className="mt-7">
              <div className="mb-2 flex justify-between text-sm text-slate-300">
                <span>{currency(summary?.balance || 0, currencyCode)}</span>
                <span>/ {currency(summary?.savingsGoal || 0, currencyCode)}</span>
              </div>
              <div className="h-3 rounded-full bg-[#0d112f]">
                <div className="h-3 rounded-full bg-gradient-to-r from-[#6f48ff] to-[#9248ff]" style={{ width: `${Math.min(100, Math.max(0, savingsProgress))}%` }} />
              </div>
            </div>
          </section>

          <section className="finance-card finance-card-tight">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                <WalletCards className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="finance-eyebrow">Budget Watch</p>
                <p className="text-sm text-slate-400">The categories closest to their limit</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {topBudgets.length ? (
                topBudgets.map((budget) => (
                  <div key={budget._id} className="rounded-[24px] border border-white/5 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{budget.category?.icon}</div>
                        <div>
                          <p className="font-semibold text-white">{budget.category?.name}</p>
                          <p className="text-xs text-slate-500">{currency(budget.spent, currencyCode)} spent</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${budget.percentage >= 100 ? 'text-red-300' : budget.percentage >= 80 ? 'text-orange-300' : 'text-cyan-400'}`}>
                        {budget.percentage}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#0d112f]">
                      <div className={`h-2 rounded-full ${budget.percentage >= 100 ? 'bg-red-400' : budget.percentage >= 80 ? 'bg-orange-300' : 'bg-cyan-400'}`} style={{ width: `${Math.min(100, budget.percentage || 0)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-center text-sm text-slate-400">
                  No budgets set for this month yet.
                </div>
              )}
            </div>
          </section>

          <section className="finance-card finance-card-tight">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                <Clock3 className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <p className="finance-eyebrow">Recurring Plans</p>
                <p className="text-sm text-slate-400">Monthly automated transactions</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {enabledRecurring.slice(0, 4).map((item) => (
                <div key={item._id} className="data-row">
                  <div>
                    <p className="font-semibold text-white">{item.category?.name}</p>
                    <p className="text-xs text-slate-500">Day {item.dayOfMonth} of each month</p>
                  </div>
                  <span className={`font-semibold ${item.type === 'income' ? 'text-cyan-400' : 'text-orange-300'}`}>
                    {item.type === 'income' ? '+' : '-'}
                    {currency(item.amount, currencyCode)}
                  </span>
                </div>
              ))}
              {!enabledRecurring.length ? (
                <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-center text-sm text-slate-400">
                  No recurring plans enabled.
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
