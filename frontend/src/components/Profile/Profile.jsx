import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { deleteAccount, getProfile, updateProfile } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Profile = () => {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', currency: 'USD', monthlySavings: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await getProfile();
      setProfile(data);
      setFormData({ name: data.name, currency: data.currency, monthlySavings: data.financialGoals?.monthlySavings?.toString() || '', avatar: data.avatar || '' });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: formData.name, currency: formData.currency, avatar: formData.avatar, financialGoals: { monthlySavings: parseFloat(formData.monthlySavings) || 0 } });
      updateUser({ name: formData.name, currency: formData.currency, avatar: formData.avatar });
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-300 via-orange-300 to-pink-500 text-2xl font-bold text-slate-950">
              {formData.avatar ? <img src={formData.avatar} alt={formData.name} className="h-full w-full object-cover" /> : profile?.name?.slice(0, 2)?.toUpperCase() || 'PF'}
            </div>
            <div>
              <p className="finance-eyebrow">Profile</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">{profile?.name}</h1>
              <p className="mt-2 text-slate-400">{profile?.email}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-tile"><p className="finance-eyebrow">Currency</p><p className="mt-2 text-3xl font-semibold text-cyan-400">{formData.currency}</p></div>
            <div className="metric-tile"><p className="finance-eyebrow">Savings Goal</p><p className="mt-2 text-3xl font-semibold text-orange-300">{formData.monthlySavings || 0}</p></div>
          </div>
        </div>
      </section>

      <div className="page-grid">
        <section className="finance-card">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"><UserRound className="h-5 w-5 text-cyan-400" /></div><div><p className="finance-eyebrow">Personal Information</p><p className="text-sm text-slate-400">Update the details used across your finance workspace</p></div></div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" className="glass-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" className="glass-field" value={profile?.email} disabled /><p className="text-xs text-slate-500">Email cannot be changed</p></div>
            <div className="space-y-3">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/5">
                  {formData.avatar ? <img src={formData.avatar} alt="Profile preview" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8 text-slate-400" />}
                </div>
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <Button type="button" className="muted-button" onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
                  {formData.avatar ? <Button type="button" className="muted-button" onClick={() => setFormData({ ...formData, avatar: '' })}>Remove</Button> : null}
                </div>
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="currency">Preferred Currency</Label><Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}><SelectTrigger className="glass-field"><SelectValue /></SelectTrigger><SelectContent className="border-white/10 bg-[#111633] text-white"><SelectItem value="USD">USD - US Dollar</SelectItem><SelectItem value="EUR">EUR - Euro</SelectItem><SelectItem value="GBP">GBP - British Pound</SelectItem><SelectItem value="INR">INR - Indian Rupee</SelectItem><SelectItem value="JPY">JPY - Japanese Yen</SelectItem><SelectItem value="CNY">CNY - Chinese Yuan</SelectItem><SelectItem value="AUD">AUD - Australian Dollar</SelectItem><SelectItem value="CAD">CAD - Canadian Dollar</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="monthlySavings">Monthly Savings Goal</Label><Input id="monthlySavings" className="glass-field" type="number" step="0.01" min="0" value={formData.monthlySavings} onChange={(e) => setFormData({ ...formData, monthlySavings: e.target.value })} /></div>
            <Button type="submit" className="accent-button h-12 px-6" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </section>

        <section className="finance-card">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-400/10"><ShieldAlert className="h-5 w-5 text-red-300" /></div><div><p className="finance-eyebrow text-red-300">Danger Zone</p><p className="text-sm text-slate-400">Permanent actions that affect the whole account</p></div></div>
          <div className="mt-6 rounded-[26px] border border-red-400/15 bg-red-400/5 p-5 text-sm text-slate-300">
            Deleting your account removes all of your data and cannot be undone.
          </div>
          <div className="mt-5 flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild><Button className="h-12 rounded-2xl bg-red-500 px-6 text-white hover:bg-red-600">Delete Account</Button></AlertDialogTrigger>
              <AlertDialogContent className="border-white/10 bg-[#111633] text-white">
                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel className="muted-button">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 text-white hover:bg-red-600">Delete Account</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
