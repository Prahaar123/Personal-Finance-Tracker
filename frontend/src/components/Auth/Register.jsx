import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeDollarSign, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import MouseGlow from '@/components/Layout/MouseGlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', currency: 'USD' });
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    const result = await register(formData.name, formData.email, formData.password, formData.currency);
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    const result = await googleLogin();
    if (result.success) {
      toast.success('Google signup successful!');
      navigate('/');
    } else {
      toast.error(result.message || 'Google signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <MouseGlow />
      <div className="auth-shell relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[38px] border shadow-[0_35px_90px_rgba(0,0,0,0.28)] lg:grid-cols-[0.98fr_1.02fr]">
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="finance-eyebrow">Create Account</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Build your finance HQ.</h2>
            <p className="mt-3 text-slate-400">Start with a polished dashboard, custom categories, budgets, reports, and everything else in the same premium UI.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" type="text" className="glass-field h-12" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" className="glass-field h-12" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" className="glass-field h-12" placeholder="At least 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" className="glass-field h-12" placeholder="Repeat password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="currency">Preferred Currency</Label><Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}><SelectTrigger className="glass-field h-12"><SelectValue placeholder="Select currency" /></SelectTrigger><SelectContent className="border-white/10 bg-[#111633] text-white"><SelectItem value="USD">USD - US Dollar</SelectItem><SelectItem value="EUR">EUR - Euro</SelectItem><SelectItem value="GBP">GBP - British Pound</SelectItem><SelectItem value="INR">INR - Indian Rupee</SelectItem><SelectItem value="JPY">JPY - Japanese Yen</SelectItem><SelectItem value="CNY">CNY - Chinese Yuan</SelectItem><SelectItem value="AUD">AUD - Australian Dollar</SelectItem><SelectItem value="CAD">CAD - Canadian Dollar</SelectItem></SelectContent></Select></div>
              <Button type="submit" className="accent-button h-12 w-full" disabled={loading}>{loading ? 'Creating account...' : 'Register'}<ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button type="button" className="muted-button h-12 w-full" onClick={handleGoogleRegister} disabled={loading}><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="mr-2 h-5 w-5" />Sign up with Google</Button>
            </form>

            <p className="mt-6 text-sm text-slate-400">Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Login</Link></p>
          </div>
        </section>

        <section className="auth-side-panel hidden flex-col justify-between border-l p-10 lg:flex">
          <div>
            <p className="finance-eyebrow">Why It Feels Different</p>
            <h1 className="mt-4 max-w-md text-5xl font-semibold leading-tight text-white">A visual-first workspace for money decisions.</h1>
            <p className="mt-4 max-w-md text-slate-400">From the first screen to the reports view, the app now keeps one coherent dashboard-inspired mood.</p>
          </div>
          <div className="space-y-4">
            <div className="metric-tile"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-orange-300" /><span className="text-white">Premium dashboard styling across every page</span></div></div>
            <div className="metric-tile"><div className="flex items-center gap-3"><BadgeDollarSign className="h-5 w-5 text-cyan-400" /><span className="text-white">Budgets, analytics, reports, and profile in one system</span></div></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
