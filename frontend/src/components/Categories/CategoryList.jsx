import { useEffect, useState } from 'react';
import { Layers3, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteCategory, getCategories } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryIcon } from '@/lib/categoryIcons';
import CategoryForm from './CategoryForm';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      toast.error('Cannot delete default categories');
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  const CategoryCard = ({ category }) => (
    <div className="data-row gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/[0.06] text-cyan-300"><CategoryIcon icon={category.icon} className="h-6 w-6" /></div>
        <div>
          <p className="text-lg font-semibold text-white">{category.name}</p>
          <p className="text-sm text-slate-400">{category.isDefault ? 'Default category' : 'Custom category'}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" className="muted-button h-10 w-10" onClick={() => { if (category.isDefault) { toast.error('Cannot edit default categories'); return; } setSelectedCategory(category); setIsFormOpen(true); }} disabled={category.isDefault}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="muted-button h-10 w-10 text-red-300 hover:text-red-200" onClick={() => handleDelete(category._id, category.isDefault)} disabled={category.isDefault}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="finance-eyebrow">Categories</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Organize the rules behind every transaction.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Income and expense categories now live in the same visual system as the rest of the product, with fast editing and clearer grouping.</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="accent-button h-12 px-6" onClick={() => setSelectedCategory(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-white/10 bg-[#111633] text-white">
              <DialogHeader>
                <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              </DialogHeader>
              <CategoryForm category={selectedCategory} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="metric-tile"><p className="finance-eyebrow">Total</p><p className="mt-2 text-3xl font-semibold text-white">{categories.length}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Expense</p><p className="mt-2 text-3xl font-semibold text-orange-300">{expenseCategories.length}</p></div>
          <div className="metric-tile"><p className="finance-eyebrow">Income</p><p className="mt-2 text-3xl font-semibold text-cyan-400">{incomeCategories.length}</p></div>
        </div>
      </section>

      <section className="finance-card">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><Layers3 className="h-5 w-5 text-cyan-400" /></div>
          <div>
            <p className="finance-eyebrow">Library</p>
            <p className="text-sm text-slate-400">Switch between expense and income groups</p>
          </div>
        </div>

        <Tabs defaultValue="expense" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 rounded-[22px] bg-white/[0.04] p-1">
            <TabsTrigger value="expense" className="rounded-[18px] data-[state=active]:bg-white/10 data-[state=active]:text-white">Expense Categories</TabsTrigger>
            <TabsTrigger value="income" className="rounded-[18px] data-[state=active]:bg-white/10 data-[state=active]:text-white">Income Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="expense" className="mt-6 space-y-3">
            {loading ? <div className="flex h-48 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div> : expenseCategories.length ? expenseCategories.map((category) => <CategoryCard key={category._id} category={category} />) : <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">No expense categories yet.</div>}
          </TabsContent>
          <TabsContent value="income" className="mt-6 space-y-3">
            {loading ? <div className="flex h-48 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div> : incomeCategories.length ? incomeCategories.map((category) => <CategoryCard key={category._id} category={category} />) : <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">No income categories yet.</div>}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default CategoryList;
