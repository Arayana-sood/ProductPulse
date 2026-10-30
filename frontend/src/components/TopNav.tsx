import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function TopNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'OVERVIEW', path: '/' },
    { name: 'ANALYSIS', path: '/analyze' },
    { name: 'SEGMENTS', path: '/segments' },
    { name: 'MODELS', path: '/models' },
    { name: 'SIGNALS', path: '/insights' },
    { name: 'ABOUT', path: '/about' },
  ];

  return (
    <header className="bg-console-surface border-b border-console-border px-4 text-sm sticky top-0 z-50 transition-colors">
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center font-bold tracking-tight text-console-text-main group hover:text-console-accent transition-colors">
            <span className="bg-console-text-main group-hover:bg-console-accent text-console-surface px-1.5 py-0.5 rounded-sm mr-2 text-xs transition-colors">PP</span>
            PRODUCTPULSE
          </Link>
          
          <div className="hidden lg:flex items-center space-x-1 border-l border-console-border pl-8">
            <span className="console-header text-console-text-faint mr-4">WORKSPACE</span>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-console-bg text-console-accent border border-console-border shadow-sm' 
                      : 'text-console-text-muted hover:bg-console-bg hover:text-console-text-main border border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-1.5 text-console-text-muted hover:text-console-accent hover:bg-console-bg rounded-sm transition-colors border border-transparent hover:border-console-border"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
          </button>
          
          <div className="hidden sm:flex items-center console-mono text-[10px] text-console-green bg-console-bg border border-console-border px-2 py-1 rounded-sm shadow-sm cursor-help" title="API System Status: Online">
            <span className="w-1.5 h-1.5 bg-console-green rounded-full mr-1.5 animate-pulse"></span>
            SYSTEM ONLINE
          </div>

          <button 
            className="lg:hidden p-1 text-console-text-muted border border-console-border rounded-sm hover:bg-console-bg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-console-border py-2 bg-console-surface flex flex-col space-y-1 pb-4">
          <span className="console-header text-console-text-faint px-4 py-2">WORKSPACE</span>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-console-bg text-console-accent border-l-2 border-console-accent' 
                    : 'text-console-text-muted hover:bg-console-bg hover:text-console-text-main border-l-2 border-transparent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
