import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { months, navItems } from './navConfig';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();
  const monthParam = Number(searchParams.get('month'));
  const yearParam = Number(searchParams.get('year'));
  const currentMonth = monthParam >= 1 && monthParam <= 12 ? monthParam - 1 : new Date().getMonth();
  const currentYear = yearParam >= 2000 ? yearParam : new Date().getFullYear();

  const handleMonthClick = (monthIndex) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(monthIndex + 1));
    params.set('year', String(currentYear));
    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  };

  return (
    <aside className="sidebar-shell group/sidebar sticky top-3 hidden h-[calc(100vh-1.5rem)] w-[126px] shrink-0 overflow-hidden rounded-[32px] border px-3 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.26)] transition-[width] duration-300 hover:w-[272px] lg:flex lg:flex-col">
      <div className="flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent text-white">
            <span className="text-xl font-semibold">PF</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Personal</p>
        <p className="text-xl font-semibold leading-5 text-[var(--text-main)]">Finance</p>
      </div>

      <nav className="mt-6 grid grid-cols-2 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-h-[50px] items-center justify-center rounded-2xl border border-white/5 px-2 py-2.5 text-center transition ${
                isActive
                  ? 'sidebar-tile-active shadow-[0_12px_30px_rgba(0,0,0,0.18)]'
                  : 'sidebar-tile-idle text-[var(--text-muted)]'
              }`}
              title={item.label}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className="mx-auto h-5 w-5 shrink-0" />
                <span
                  className={`block overflow-hidden text-[11px] font-medium leading-3 transition-all duration-300 ${
                    isActive ? 'sidebar-label-active' : 'sidebar-label'
                  } max-h-0 opacity-0 group-hover/sidebar:max-h-8 group-hover/sidebar:opacity-100`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-[24px] border border-white/5 bg-white/[0.02] px-2 py-3">
        <div className="mb-3 flex items-center justify-center text-[var(--text-muted)]">
          <CalendarDays className="h-4 w-4" />
        </div>
        <div className="space-y-1.5 text-center text-[15px] font-medium text-[var(--text-soft)]">
          {months.map((month, index) => (
            <button
              key={month}
              type="button"
              onClick={() => handleMonthClick(index)}
              className={`block w-full rounded-lg px-2 py-0.5 transition hover:bg-white/5 ${index === currentMonth ? 'text-[#ffb341]' : ''}`}
              title={`Open ${month} ${currentYear} dashboard`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-3 flex h-11 items-center justify-center rounded-2xl text-[var(--text-muted)] transition hover:bg-[#ef5350] hover:text-white"
        title="Logout"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </aside>
  );
};

export default Sidebar;
