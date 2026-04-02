import { MoonStar, Palette, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';

const themes = [
  { value: 'light', label: 'Light', icon: SunMedium },
  { value: 'black', label: 'Dark', icon: MoonStar },
  { value: 'navy', label: 'Navy', icon: Palette },
];

const ThemeToggle = ({ compact = false }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="group/theme relative">
      <button
        type="button"
        className={`flex items-center justify-center border border-white/8 bg-[color:var(--panel-bg)] text-[var(--text-main)] shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[color:var(--theme-accent)] ${
          compact ? 'h-12 w-12 rounded-[20px]' : 'h-14 w-14 rounded-[22px]'
        }`}
        title="Change theme"
      >
        <MoonStar className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>

      <div className={`pointer-events-none absolute right-0 z-40 w-44 translate-y-2 rounded-[24px] border border-white/8 bg-[color:var(--panel-bg)] p-3 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-200 group-hover/theme:pointer-events-auto group-hover/theme:translate-y-0 group-hover/theme:opacity-100 ${
        compact ? 'top-14' : 'top-16'
      }`}>
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
          Theme
        </p>
        <div className="mt-3 flex flex-col gap-2">
        {themes.map(({ value, label, icon: Icon }) => {
          const active = theme === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                active
                  ? 'border-[color:var(--theme-accent)] bg-[color:var(--theme-accent-soft)] text-[var(--theme-accent-strong)] shadow-[0_12px_26px_rgba(0,0,0,0.18)]'
                  : 'border-white/6 bg-white/[0.02] text-[var(--text-soft)] hover:border-white/12 hover:bg-white/[0.05] hover:text-[var(--text-main)]'
              }`}
              title={`Switch to ${label} theme`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
