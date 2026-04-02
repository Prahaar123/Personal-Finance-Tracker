import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { navItems, months } from './navConfig';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();

  const monthParam = Number(searchParams.get('month'));
  const yearParam = Number(searchParams.get('year'));
  const currentMonth = monthParam >= 1 && monthParam <= 12 ? monthParam - 1 : new Date().getMonth();
  const currentYear = yearParam >= 2000 ? yearParam : new Date().getFullYear();

  const updateMonth = (monthIndex) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(monthIndex + 1));
    params.set('year', String(currentYear));
    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  };

  const primaryItems = navItems.slice(0, 4);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
        <div className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-[color:var(--panel-bg)] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/5 text-lg font-semibold text-white">PF</div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Personal</p>
            <p className="text-lg font-semibold text-[var(--text-main)]">Finance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" className="h-12 w-12 rounded-[20px] border border-white/8 bg-[color:var(--panel-bg)] p-0 text-[var(--text-main)] shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl hover:bg-white/[0.06]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-[color:var(--app-bg-soft)] p-0 text-[var(--text-main)] backdrop-blur-2xl sm:max-w-md">
              <div className="h-full overflow-y-auto p-5">
                <SheetHeader className="border-b border-white/8 pb-4 text-left">
                  <SheetTitle className="text-[var(--text-main)]">Navigation</SheetTitle>
                </SheetHeader>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex min-h-[72px] flex-col items-center justify-center rounded-[22px] border px-3 py-4 text-center transition ${
                          isActive
                            ? 'sidebar-tile-active border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.18)]'
                            : 'border-white/6 bg-white/[0.03] text-[var(--text-soft)] hover:bg-white/[0.06] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="mt-2 text-xs font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center gap-2 text-[var(--text-muted)]">
                    <CalendarDays className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.22em]">Month</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => updateMonth(index)}
                        className={`rounded-xl px-2 py-2 text-sm font-medium transition ${
                          index === currentMonth
                            ? 'bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-accent-strong)]'
                            : 'bg-white/[0.03] text-[var(--text-soft)] hover:bg-white/[0.06] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={logout}
                  className="mt-6 h-12 w-full rounded-2xl border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[color:var(--app-bg-soft)] px-3 py-2 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-accent-strong)]'
                    : 'text-[var(--text-soft)] hover:bg-white/[0.05] hover:text-[var(--text-main)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNav;

