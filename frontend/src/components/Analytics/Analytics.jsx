import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getCategoryBreakdown, getDailyTrends, getIncomeExpenseAnalytics } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/currency';

const COLORS = ['#ff7d4d', '#f25068', '#6f48ff', '#2bd2ff', '#4ce8a2', '#f5c451', '#eb67d7', '#6be4ff'];
const tooltipStyle = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '16px',
  color: 'var(--chart-tooltip-text)',
};

const Analytics = () => {
  const { user } = useAuth();
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('income-expense');
  const [searchParams, setSearchParams] = useSearchParams();
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
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [incomeExpense, category, daily] = await Promise.all([
          getIncomeExpenseAnalytics({ period, year: selectedYear }),
          getCategoryBreakdown({ month: selectedMonth, year: selectedYear, type: 'expense' }),
          getDailyTrends({ month: selectedMonth, year: selectedYear }),
        ]);

        setIncomeExpenseData(processIncomeExpenseData(incomeExpense.data, period));
        setCategoryData(category.data || []);
        setDailyData(processDailyData(daily.data || []));
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, selectedMonth, selectedYear]);

  const totalIncome = useMemo(
    () => incomeExpenseData.reduce((sum, item) => sum + (item.income || 0), 0),
    [incomeExpenseData]
  );
  const totalExpense = useMemo(
    () => incomeExpenseData.reduce((sum, item) => sum + (item.expense || 0), 0),
    [incomeExpenseData]
  );
  const categoryTotal = useMemo(
    () => categoryData.reduce((sum, item) => sum + (item.total || 0), 0),
    [categoryData]
  );

  const currencyCode = user?.currency || 'USD';

  const renderLoading = () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
    </div>
  );

  const renderEmpty = (message) => (
    <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-white/10 px-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="finance-eyebrow">Analytics</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Read the money patterns behind your month.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Income trends, category concentration, and day-by-day movement now share the same high-contrast dashboard aesthetic.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedMonth.toString()} onValueChange={(value) => updatePeriod(parseInt(value, 10), selectedYear)}>
              <SelectTrigger className="glass-field w-36"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>{format(new Date(2024, i, 1), 'MMMM')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => updatePeriod(selectedMonth, parseInt(value, 10))}>
              <SelectTrigger className="glass-field w-28"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white">
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="metric-tile"><p className="finance-eyebrow">Income</p><p className="mt-2 text-3xl font-semibold text-cyan-400">{formatCurrency(totalIncome, currencyCode)}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Expense</p><p className="mt-2 text-3xl font-semibold text-orange-300">{formatCurrency(totalExpense, currencyCode)}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Net</p><p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totalIncome - totalExpense, currencyCode)}</p></div>
        </div>
      </section>

      <section className="finance-card">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><BarChart3 className="h-5 w-5 text-cyan-400" /></div>
          <div><p className="finance-eyebrow">Visual Reports</p><p className="text-sm text-slate-400">Switch between trend modes without leaving the dashboard feel</p></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 rounded-[22px] bg-white/[0.04] p-1">
            <TabsTrigger value="income-expense" className="rounded-[18px] data-[state=active]:bg-white/10">Income vs Expense</TabsTrigger>
            <TabsTrigger value="category" className="rounded-[18px] data-[state=active]:bg-white/10">Category Breakdown</TabsTrigger>
            <TabsTrigger value="daily" className="rounded-[18px] data-[state=active]:bg-white/10">Daily Trends</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'income-expense' ? (
          <div className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="glass-field w-32"><SelectValue /></SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111633] text-white"><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="h-[420px] rounded-[28px] bg-white/[0.03] p-4">
              {loading ? renderLoading() : !incomeExpenseData.length ? renderEmpty('No income or expense data is available for this period yet.') : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={incomeExpenseData} margin={{ top: 12, right: 18, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inFillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2bd2ff" stopOpacity={0.32} /><stop offset="100%" stopColor="#2bd2ff" stopOpacity={0} /></linearGradient>
                      <linearGradient id="exFillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8a3d" stopOpacity={0.3} /><stop offset="100%" stopColor="#ff8a3d" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 8" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={52} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value, currencyCode), '']} />
                    <Area type="monotone" dataKey="expense" stroke="#ff8a3d" strokeWidth={3} fill="url(#exFillA)" dot={false} />
                    <Area type="monotone" dataKey="income" stroke="#2bd2ff" strokeWidth={3} fill="url(#inFillA)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === 'category' ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="h-[420px] rounded-[28px] bg-white/[0.03] p-4">
              {loading ? renderLoading() : !categoryData.length ? renderEmpty('No category spending has been recorded for this month yet.') : (
                <div className="relative h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="total" innerRadius={78} outerRadius={126} paddingAngle={4} stroke="none">
                        {categoryData.map((entry, index) => <Cell key={entry._id || index} fill={entry.color || COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value, currencyCode), 'Spent']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-white/5 px-6 py-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]" style={{ backgroundColor: 'var(--chart-center-bg)' }}>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expense</p>
                      <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(categoryTotal, currencyCode)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {categoryData.length ? categoryData.map((entry, index) => (
                <div key={entry._id || index} className="data-row">
                  <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: entry.color || COLORS[index % COLORS.length] }} /><span className="text-white">{entry.name}</span></div>
                  <span className="font-semibold text-slate-200">{formatCurrency(entry.total, currencyCode)}</span>
                </div>
              )) : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'daily' ? (
          <div className="mt-6 space-y-4">
            {dailyData.length > 0 && dailyData.length < 3 ? (
              <p className="text-sm text-slate-400">Only {dailyData.length} day{dailyData.length === 1 ? '' : 's'} with transactions found for this month so far.</p>
            ) : null}
            <div className="h-[420px] rounded-[28px] bg-white/[0.03] p-4">
              {loading ? renderLoading() : !dailyData.length ? renderEmpty('No daily transaction trends are available for this month yet.') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 12, right: 18, left: -8, bottom: 0 }} barCategoryGap="28%">
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 8" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={52} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value, currencyCode), '']} />
                    <Bar dataKey="income" fill="#2bd2ff" radius={[8, 8, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="expense" fill="#ff8a3d" radius={[8, 8, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

const processIncomeExpenseData = (data, period) => {
  const grouped = {};
  data.forEach((item) => {
    const key = period === 'monthly' ? `${item._id.month}/${item._id.year}` : item._id.year;
    if (!grouped[key]) grouped[key] = { name: key, income: 0, expense: 0 };
    grouped[key][item._id.type] = item.total;
  });
  return Object.values(grouped);
};

const processDailyData = (data) => {
  const grouped = {};
  data.forEach((item) => {
    const day = item._id.day;
    if (!grouped[day]) grouped[day] = { day, income: 0, expense: 0 };
    grouped[day][item._id.type] = item.total;
  });
  return Object.values(grouped).sort((a, b) => a.day - b.day);
};

export default Analytics;
