import { useState, useEffect } from 'react';
import { getRecurringTransactions, deleteRecurringTransaction, generateRecurringTransactions, getCategories } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import RecurringForm from './RecurringForm';

const RecurringList = () => {
  const [recurring, setRecurring] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRecurring();
  }, []);

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

  const handleEdit = (item) => {
    setSelectedRecurring(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedRecurring(null);
    fetchRecurring();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recurring Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Now
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedRecurring(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</DialogTitle>
              </DialogHeader>
              <RecurringForm
                recurring={selectedRecurring}
                categories={categories}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {recurring.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {recurring.map((item) => (
            <Card key={item._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.category?.icon}</span>
                    <CardTitle className="text-lg">{item.category?.name}</CardTitle>
                  </div>
                  <Switch checked={item.enabled} disabled />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Frequency</span>
                  <span className="text-sm font-medium">Monthly (Day {item.dayOfMonth})</span>
                </div>
                {item.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Notes: </span>
                    <span className="text-sm">{item.notes}</span>
                  </div>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id)}>
                    <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No recurring transactions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecurringList;