import { useEffect, useState } from 'react';
import { CalendarSync, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { deleteRecurringTransaction, generateRecurringTransactions, getCategories, getRecurringTransactions } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { CategoryIcon } from '@/lib/categoryIcons';
import { formatCurrency } from '@/lib/currency';
import RecurringForm from './RecurringForm';

const RecurringList = () => {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const currencyCode = user?.currency || 'USD';

  useEffect(() => { fetchCategories(); fetchRecurring(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const { data } = await getRecurringTransactions();
      setRecurring(data);
    } catch (error) {
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await deleteRecurringTransaction(id);
      toast.success('Recurring transaction deleted successfully');
      fetchRecurring();
    } catch (error) {
      toast.error('Failed to delete recurring transaction');
    }
  };

  const handleGenerate = async () => {
    try {
      const { data } = await generateRecurringTransactions();
      toast.success(data.message);
      fetchRecurring();
    } catch (error) {
      toast.error('Failed to generate transactions');
    }
  };

  const enabledCount = recurring.filter((item) => item.enabled).length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="finance-eyebrow">Recurring</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Automate the transactions that should never need babysitting.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Subscriptions, salary, and monthly obligations now sit inside the same polished card system as the rest of the tracker.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="muted-button h-12 px-5" onClick={handleGenerate}><RefreshCw className="mr-2 h-4 w-4" />Generate Now</Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild><Button className="accent-button h-12 px-6" onClick={() => setSelectedRecurring(null)}><Plus className="mr-2 h-4 w-4" />Add Recurring</Button></DialogTrigger>
              <DialogContent className="max-w-md border-white/10 bg-[#111633] text-white">
                <DialogHeader><DialogTitle>{selectedRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</DialogTitle></DialogHeader>
                <RecurringForm recurring={selectedRecurring} categories={categories} onSuccess={() => { setIsFormOpen(false); setSelectedRecurring(null); fetchRecurring(); }} onCancel={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="metric-tile"><p className="finance-eyebrow">Schedules</p><p className="mt-2 text-3xl font-semibold text-white">{recurring.length}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Enabled</p><p className="mt-2 text-3xl font-semibold text-cyan-400">{enabledCount}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Monthly Flow</p><p className="mt-2 text-3xl font-semibold text-orange-300">{formatCurrency(recurring.reduce((sum, item) => sum + item.amount, 0), currencyCode)}</p></div>
        </div>
      </section>

      <section className="finance-card">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><CalendarSync className="h-5 w-5 text-cyan-400" /></div><div><p className="finance-eyebrow">Recurring Rules</p><p className="text-sm text-slate-400">Edit the cadence and amount behind your automated flows</p></div></div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {loading ? <div className="col-span-full flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div> : recurring.length ? recurring.map((item) => (
            <div key={item._id} className="rounded-[28px] border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/[0.06] text-cyan-300"><CategoryIcon icon={item.category?.icon} className="h-6 w-6" /></div>
                  <div>
                    <p className="text-lg font-semibold text-white">{item.category?.name}</p>
                    <p className="text-sm text-slate-400">Monthly, day {item.dayOfMonth}</p>
                  </div>
                </div>
                <Switch checked={item.enabled} disabled />
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="data-row"><span className="text-slate-400">Amount</span><span className={`font-semibold ${item.type === 'income' ? 'text-cyan-400' : 'text-orange-300'}`}>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currencyCode)}</span></div>
                <div className="data-row"><span className="text-slate-400">Direction</span><span className="text-white">{item.type}</span></div>
                {item.notes && <div className="rounded-[22px] border border-white/5 bg-white/[0.03] px-4 py-4 text-slate-300">{item.notes}</div>}
              </div>
              <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" className="muted-button" onClick={() => { setSelectedRecurring(item); setIsFormOpen(true); }}><Pencil className="mr-2 h-4 w-4" />Edit</Button><Button variant="ghost" className="muted-button text-red-300 hover:text-red-200" onClick={() => handleDelete(item._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div>
            </div>
          )) : <div className="col-span-full rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">No recurring transactions yet.</div>}
        </div>
      </section>
    </div>
  );
};

export default RecurringList;
