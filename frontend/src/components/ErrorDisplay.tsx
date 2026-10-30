export default function ErrorDisplay({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <div className="console-panel p-8 max-w-lg mx-auto text-center border-console-red/30 bg-console-red/5">
      <div className="w-12 h-12 rounded-full bg-console-red/10 flex items-center justify-center mx-auto mb-4 border border-console-red/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-red"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2 className="text-lg font-bold text-console-red mb-2 uppercase tracking-wide">SYSTEM OFFLINE</h2>
      <p className="text-sm text-console-text-muted mb-6">Unable to retrieve live analytics. The backend service may be down or unreachable.</p>
      
      {onRetry ? (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-console-bg hover:bg-console-surface border border-console-border text-console-text-main text-sm font-semibold rounded-sm transition-colors"
        >
          RETRY CONNECTION
        </button>
      ) : (
        <div className="text-xs console-mono text-console-text-faint p-2 bg-console-bg border border-console-border-light text-left overflow-x-auto">
          {message}
        </div>
      )}
    </div>
  );
}
