import { useState } from 'react';
import { exportCSV, exportPDF } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
  });
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

      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Export Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type (Optional)</Label>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={() => handleExport('csv')} disabled={loading} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button onClick={() => handleExport('pdf')} disabled={loading} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• CSV format includes: Date, Type, Category, Amount, and Notes</p>
          <p>• PDF format includes a summary section with total income, expenses, and balance</p>
          <p>• Select a date range to filter transactions for your report</p>
          <p>• Optionally filter by transaction type (income or expense)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;