import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { deleteBudget, getBudgets, getCategories } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryIcon } from '@/lib/categoryIcons';
import { formatCurrency } from '@/lib/currency';
import BudgetForm from './BudgetForm';

const BudgetList = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam = Number(searchParams.get('month'));
  const yearParam = Number(searchParams.get('year'));
  const selectedMonth = monthParam >= 1 && monthParam <= 12 ? monthParam : new Date().getMonth() + 1;
  const selectedYear = yearParam >= 2000 ? yearParam : new Date().getFullYear();
  const currencyCode = user?.currency || 'USD';

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchBudgets(); }, [selectedMonth, selectedYear]);

  const updatePeriod = (nextMonth, nextYear) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(nextMonth));
    params.set('year', String(nextYear));
    setSearchParams(params, { replace: true });
  };

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories({ type: 'expense' });
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const { data } = await getBudgets({ month: selectedMonth, year: selectedYear });
      setBudgets(data);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await deleteBudget(id);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="finance-eyebrow">Budgets</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Set limits that feel as polished as the dashboard.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Review monthly envelopes, watch category burn rate, and adjust spending plans without leaving the new visual language.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedMonth.toString()} onValueChange={(value) => updatePeriod(parseInt(value, 10), selectedYear)}>
              <SelectTrigger className="glass-field w-36"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white">{Array.from({ length: 12 }, (_, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>{format(new Date(2024, i, 1), 'MMMM')}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => updatePeriod(selectedMonth, parseInt(value, 10))}>
              <SelectTrigger className="glass-field w-28"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white">{Array.from({ length: 5 }, (_, i) => { const year = new Date().getFullYear() - i; return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>; })}</SelectContent>
            </Select>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild><Button className="accent-button h-12 px-6" onClick={() => setSelectedBudget(null)}><Plus className="mr-2 h-4 w-4" />Add Budget</Button></DialogTrigger>
              <DialogContent className="max-w-md border-white/10 bg-[#111633] text-white">
                <DialogHeader><DialogTitle>{selectedBudget ? 'Edit Budget' : 'Add Budget'}</DialogTitle></DialogHeader>
                <BudgetForm budget={selectedBudget} categories={categories} month={selectedMonth} year={selectedYear} onSuccess={() => { setIsFormOpen(false); setSelectedBudget(null); fetchBudgets(); }} onCancel={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="metric-tile"><p className="finance-eyebrow">Active Budgets</p><p className="mt-2 text-3xl font-semibold text-white">{budgets.length}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Allocated</p><p className="mt-2 text-3xl font-semibold text-cyan-400">{formatCurrency(totalAllocated, currencyCode)}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Spent</p><p className="mt-2 text-3xl font-semibold text-orange-300">{formatCurrency(totalSpent, currencyCode)}</p></div>
        </div>
      </section>

      <section className="finance-card">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><PiggyBank className="h-5 w-5 text-violet-300" /></div>
          <div><p className="finance-eyebrow">Budget Grid</p><p className="text-sm text-slate-400">Monitor how close each category is to its limit</p></div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>
          ) : budgets.length ? budgets.map((budget) => {
            const remaining = Math.max(0, budget.amount - budget.spent);
            return (
              <div key={budget._id} className="rounded-[28px] border border-white/5 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/[0.06] text-cyan-300"><CategoryIcon icon={budget.category?.icon} className="h-6 w-6" /></div>
                    <div>
                      <p className="text-lg font-semibold text-white">{budget.category?.name}</p>
                      <p className="text-sm text-slate-400">{format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="muted-button h-9 w-9" onClick={() => { setSelectedBudget(budget); setIsFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="muted-button h-9 w-9 text-red-300 hover:text-red-200" onClick={() => handleDelete(budget._id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                {budget.alert && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-orange-400/15 bg-orange-400/10 px-4 py-3 text-sm text-orange-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{budget.alert.message}</span></div>
                )}

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300"><span>Spent vs limit</span><span>{formatCurrency(budget.spent, currencyCode)} / {formatCurrency(budget.amount, currencyCode)}</span></div>
                  <div className="h-3 rounded-full bg-[#0d112f]"><div className={`h-3 rounded-full ${budget.percentage >= 100 ? 'bg-red-400' : budget.percentage >= 80 ? 'bg-orange-300' : 'bg-cyan-400'}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }} /></div>
                  <p className="mt-2 text-right text-xs uppercase tracking-[0.22em] text-slate-500">{budget.percentage}% used</p>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-400">Remaining</span><span className={`font-semibold ${remaining > 0 ? 'text-cyan-400' : 'text-orange-300'}`}>{formatCurrency(remaining, currencyCode)}</span></div>
              </div>
            );
          }) : <div className="col-span-full rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">No budgets set for this period.</div>}
        </div>
      </section>
    </div>
  );
};

export default BudgetList;
