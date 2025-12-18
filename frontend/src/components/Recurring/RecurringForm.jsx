import { useState, useEffect } from 'react';
import { createRecurringTransaction, updateRecurringTransaction } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const RecurringForm = ({ recurring, categories, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    dayOfMonth: '1',
    notes: '',
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recurring) {
      setFormData({
        amount: recurring.amount.toString(),
        type: recurring.type,
        category: recurring.category._id,
        dayOfMonth: recurring.dayOfMonth.toString(),
        notes: recurring.notes || '',
        enabled: recurring.enabled,
      });
    }
  }, [recurring]);

  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        dayOfMonth: parseInt(formData.dayOfMonth),
      };

      if (recurring) {
        await updateRecurringTransaction(recurring._id, data);
        toast.success('Recurring transaction updated successfully');
      } else {
        await createRecurringTransaction(data);
        toast.success('Recurring transaction created successfully');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save recurring transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              type: value,
              category: '',
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dayOfMonth">Day of Month</Label>
        <Select value={formData.dayOfMonth} onValueChange={(value) => setFormData({ ...formData, dayOfMonth: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 31 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="enabled">Enabled</Label>
        <Switch id="enabled" checked={formData.enabled} onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : recurring ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default RecurringForm;