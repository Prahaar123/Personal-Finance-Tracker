import Sidebar from './Sidebar';
import MouseGlow from './MouseGlow';
import ThemeToggle from './ThemeToggle';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
  return (
    <div className="app-shell min-h-screen">
      <MouseGlow />
      <div className="flex min-h-screen w-full gap-3 px-2 py-2 sm:px-3 sm:py-3 lg:gap-5 lg:px-4 lg:py-6">
        <Sidebar />
        <main className="main-shell relative z-10 min-w-0 flex-1 rounded-[28px] border px-3 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:rounded-[32px] sm:px-5 sm:py-5 lg:rounded-[36px] lg:px-8 lg:py-8">
          <MobileNav />
          <div className="absolute right-4 top-4 z-30 hidden lg:block">
            <ThemeToggle />
          </div>
          <div className="pb-20 lg:pb-0">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
