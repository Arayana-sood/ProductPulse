import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-console-bg flex flex-col font-sans text-console-text-main selection:bg-console-accent selection:text-white">
      <TopNav />
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
