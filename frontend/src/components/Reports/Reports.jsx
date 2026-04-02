import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportCSV, exportPDF } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Reports = () => {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    if (!filters.startDate || !filters.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const exportFunc = format === 'csv' ? exportCSV : exportPDF;
      const { data } = await exportFunc(filters);
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${filters.startDate}_to_${filters.endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div>
          <p className="finance-eyebrow">Reports</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Export polished snapshots of your transaction history.</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Choose a window, select a type filter if needed, and generate files that are ready for analysis, sharing, or record-keeping.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="metric-tile"><p className="finance-eyebrow">Formats</p><p className="mt-2 text-3xl font-semibold text-white">2</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Date Range</p><p className="mt-2 text-3xl font-semibold text-cyan-400">Custom</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Delivery</p><p className="mt-2 text-3xl font-semibold text-orange-300">Instant</p></div>
        </div>
      </section>

      <div className="page-grid">
        <section className="finance-card space-y-5">
          <div>
            <p className="finance-eyebrow">Export Builder</p>
            <p className="mt-2 text-2xl font-semibold text-white">Prepare a report</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" className="glass-field" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" className="glass-field" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}>
              <SelectTrigger className="glass-field"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white"><SelectItem value="all">All Types</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button className="accent-button flex-1 h-12" onClick={() => handleExport('csv')} disabled={loading}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
            <Button className="muted-button flex-1 h-12" onClick={() => handleExport('pdf')} disabled={loading}><FileText className="mr-2 h-4 w-4" />Export PDF</Button>
          </div>
        </section>

        <section className="finance-card">
          <p className="finance-eyebrow">Included</p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="data-row"><span>CSV columns</span><span>Date, type, category, amount, notes</span></div>
            <div className="data-row"><span>PDF summary</span><span>Income, expense, and balance recap</span></div>
            <div className="data-row"><span>Filter support</span><span>Date window plus optional type</span></div>
          </div>
          <div className="mt-6 rounded-[26px] border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3"><FileSpreadsheet className="h-5 w-5 text-cyan-400" /><p className="text-white font-semibold">Best for bookkeeping and sharing</p></div>
            <p className="mt-3 text-sm text-slate-400">Use CSV for spreadsheet work and PDF when you want something presentation-ready.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
