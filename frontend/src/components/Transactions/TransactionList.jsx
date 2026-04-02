import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarRange, Pencil, Plus, Search, Trash2, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { deleteTransaction, getCategories, getTransactions } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryIcon } from '@/lib/categoryIcons';
import { formatCurrency } from '@/lib/currency';
import TransactionForm from './TransactionForm';

const TransactionList = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const currencyCode = user?.currency || 'USD';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, filters]);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await getTransactions({ page, limit: 10, ...filters });
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTransaction(null);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const incomeTotal = filteredTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = filteredTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="finance-eyebrow">Transactions</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Track every inflow and outflow in one place.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Filter your ledger, review categories, and keep the day-to-day cash story aligned with the new dashboard experience.</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="accent-button h-12 px-6" onClick={() => setSelectedTransaction(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-white/10 bg-[#111633] text-white">
              <DialogHeader>
                <DialogTitle>{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              </DialogHeader>
              <TransactionForm transaction={selectedTransaction} categories={categories} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="metric-tile"><p className="finance-eyebrow">Visible Entries</p><p className="mt-2 text-3xl font-semibold text-white">{filteredTransactions.length}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Income</p><p className="mt-2 text-3xl font-semibold text-cyan-400">{formatCurrency(incomeTotal, currencyCode)}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Expenses</p><p className="mt-2 text-3xl font-semibold text-orange-300">{formatCurrency(expenseTotal, currencyCode)}</p></div>
        </div>
      </section>

      <div className="page-grid">
        <section className="finance-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><Search className="h-5 w-5 text-cyan-400" /></div>
            <div><p className="finance-eyebrow">Filters</p><p className="text-sm text-slate-400">Search, date-range, and category slices</p></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input className="glass-field pl-4" placeholder="Search notes or category" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}>
              <SelectTrigger className="glass-field"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white"><SelectItem value="all">All Types</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
            </Select>
            <Select value={filters.category || 'all'} onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}>
              <SelectTrigger className="glass-field"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111633] text-white"><SelectItem value="all">All Categories</SelectItem>{categories.map((cat) => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="glass-field" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <Input className="glass-field" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
        </section>

        <section className="finance-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><CalendarRange className="h-5 w-5 text-orange-300" /></div>
            <div><p className="finance-eyebrow">Period Snapshot</p><p className="text-sm text-slate-400">Page {page} of {totalPages}</p></div>
          </div>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="data-row"><span>Current filter window</span><span>{filters.startDate || 'Any'} to {filters.endDate || 'Any'}</span></div>
            <div className="data-row"><span>Category focus</span><span>{categories.find((cat) => cat._id === filters.category)?.name || 'All categories'}</span></div>
            <div className="data-row"><span>Net movement</span><span className="font-semibold text-white">{formatCurrency(incomeTotal - expenseTotal, currencyCode)}</span></div>
          </div>
        </section>
      </div>

      <section className="finance-card">
        <div className="flex items-center justify-between gap-4">
          <div><p className="finance-eyebrow">Ledger</p><p className="mt-2 text-2xl font-semibold text-white">Recent movements</p></div>
          <div className="hidden items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-2 text-sm text-slate-400 md:flex"><WalletCards className="h-4 w-4" />Synced to finance dashboard</div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="data-row gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/[0.06] text-cyan-300"><CategoryIcon icon={transaction.category?.icon} className="h-6 w-6" /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-lg font-semibold text-white">{transaction.category?.name}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${transaction.type === 'income' ? 'bg-cyan-400/15 text-cyan-300' : 'bg-orange-400/15 text-orange-300'}`}>{transaction.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    {transaction.notes && <p className="mt-2 text-sm text-slate-300">{transaction.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-semibold ${transaction.type === 'income' ? 'text-cyan-400' : 'text-orange-300'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currencyCode)}</span>
                  <Button variant="ghost" size="icon" className="muted-button h-10 w-10" onClick={() => { setSelectedTransaction(transaction); setIsFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="muted-button h-10 w-10 text-red-300 hover:text-red-200" onClick={() => handleDelete(transaction._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">No transactions found for the current filter set.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" className="muted-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <div className="flex items-center rounded-2xl bg-white/[0.04] px-4 text-sm text-slate-300">Page {page} of {totalPages}</div>
            <Button variant="outline" className="muted-button" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default TransactionList;
