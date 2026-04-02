import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import MouseGlow from '@/components/Layout/MouseGlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await googleLogin();
    if (result.success) {
      toast.success('Google login successful!');
      navigate('/');
    } else {
      toast.error(result.message || 'Google login failed');
    }
    setLoading(false);
  };

  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <MouseGlow />
      <div className="auth-shell relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[38px] border shadow-[0_35px_90px_rgba(0,0,0,0.28)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-side-panel hidden flex-col justify-between border-r p-10 lg:flex">
          <div>
            <p className="finance-eyebrow">Personal Finance Tracker</p>
            <h1 className="mt-4 max-w-md text-5xl font-semibold leading-tight text-white">A premium command center for your money flow.</h1>
            <p className="mt-4 max-w-md text-slate-400">The same dashboard-inspired UI now starts right from sign-in, so the product feels cohesive from the first click.</p>
          </div>
          <div className="space-y-4">
            <div className="metric-tile"><div className="flex items-center gap-3"><ChartNoAxesCombined className="h-5 w-5 text-cyan-400" /><span className="text-white">Live overview, trends, and budgets</span></div></div>
            <div className="metric-tile"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-orange-300" /><span className="text-white">Protected auth with account persistence</span></div></div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="finance-eyebrow">Welcome Back</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Sign in to your workspace.</h2>
            <p className="mt-3 text-slate-400">Use email and password or continue with Google.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" className="glass-field h-12" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" className="glass-field h-12" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <Button type="submit" className="accent-button h-12 w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}<ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button type="button" className="muted-button h-12 w-full" onClick={handleGoogleLogin} disabled={loading}><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="mr-2 h-5 w-5" />Continue with Google</Button>
            </form>

            <p className="mt-6 text-sm text-slate-400">Don't have an account? <Link to="/register" className="text-cyan-400 hover:underline">Register</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
