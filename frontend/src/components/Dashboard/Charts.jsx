import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '16px',
  color: 'var(--chart-tooltip-text)',
};

const formatCurrency = (value, currencyCode) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const Charts = ({ data = [], variant = 'trend', currencyCode = 'USD' }) => {
  if (variant === 'donut') {
    const total = data.reduce((sum, item) => sum + (item.total || item.value || 0), 0);

    return (
      <div className="relative h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.map((item) => ({ ...item, value: item.total || item.value || 0 }))}
              dataKey="value"
              innerRadius={50}
              outerRadius={82}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry._id || `${entry.name}-${index}`} fill={entry.color || '#6f48ff'} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value, currencyCode), 'Spent']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full border border-white/5 px-5 py-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
            style={{ backgroundColor: 'var(--chart-center-bg)' }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expense</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(total, currencyCode)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#25d5d3" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#25d5d3" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8a3d" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 8" vertical={false} />
        <XAxis dataKey="month" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value, currencyCode), '']} />
        <Area type="monotone" dataKey="expense" stroke="#ff8a3d" strokeWidth={3} fill="url(#expenseFill)" dot={false} />
        <Area type="monotone" dataKey="income" stroke="#25d5d3" strokeWidth={3} fill="url(#incomeFill)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Charts;
