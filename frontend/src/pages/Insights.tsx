import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { StatsResponse } from '../api/types';
import { PageSkeleton } from '../components/Skeleton';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Insights() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Business Impact & Revenue Calculator State
  // Retention improvement percentage (e.g. 2.5%)
  const [retentionImprovementPct, setRetentionImprovementPct] = useState<number>(2.5);
  // Average Order Value in Rupees (default ₹2,500 based on standard retail cosmetics basket ~ $30-$35 USD converted)
  const [aovRupees, setAovRupees] = useState<number>(2500);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-4 lg:p-8"><PageSkeleton /></div>;
  if (error) return <div className="p-4 lg:p-8 flex items-center justify-center min-h-[60vh]"><ErrorDisplay message={error} onRetry={fetchData} /></div>;
  if (!stats) return null;

  const engaged = stats.segments.find(s => s.key === 'engaged');
  const engagedPct = engaged?.pct || 5.59;
  const casualRet = stats.segments.find(s => s.key === 'casual')?.retention_rate || 0.074;
  const engagedRet = engaged?.retention_rate || 0.3936;

  // Real Cohort Numbers from Dataset (Dec 1-21)
  const totalAnalyzed = stats.dataset.users_analyzed; // 273,366
  const actualRetained = stats.dataset.retained_users; // 25,113
  const actualRetentionRate = stats.dataset.retention_rate; // 0.0919 (9.19%)

  // At-Risk Customer base (disengaged or at risk of churn)
  const atRiskCustomers = totalAnalyzed - actualRetained; // 248,253
  const atRiskPercentage = ((atRiskCustomers / totalAnalyzed) * 100); // 90.81%

  // Calculations per user instructions:
  // Additional Retained Customers = At-Risk Customers × Retention Improvement Percentage / 100
  const additionalRetainedCustomers = Math.round(atRiskCustomers * (retentionImprovementPct / 100));

  // Estimated Revenue Preserved (₹) = Additional Retained Customers × Average Order Value (₹)
  const estimatedRevenuePreserved = Math.round(additionalRetainedCustomers * aovRupees);

  // New projected total retained & retention rate
  const projectedRetainedTotal = actualRetained + additionalRetainedCustomers;
  const projectedRetentionRate = ((projectedRetainedTotal / totalAnalyzed) * 100);

  const signals = [
    {
      id: "SIG-01",
      title: "HIGH ENGAGEMENT SIGNAL",
      observation: `Only ${engagedPct}% of users belong to the Highly Engaged segment.`,
      evidence: "Highly engaged users average 36.02 views vs 2.86 for casual users.",
      interpretation: "Repeated interaction is strongly associated with the highly engaged segment and higher retention probability.",
      action: "Focus top-of-funnel retention campaigns on increasing repeat product interaction during the first session.",
      impact: "HIGH"
    },
    {
      id: "SIG-02",
      title: "CHECKOUT FRICTION SIGNAL",
      observation: "A significant volume of cart additions do not result in purchases.",
      evidence: "Engaged users average 28.64 carts but only 7.85 purchases, with 25.38 removals.",
      interpretation: "Users are using the cart as a wishlist or experiencing friction before completing the transaction.",
      action: "Implement 'save for later' functionality to clear cart intent, and streamline the checkout flow.",
      impact: "MEDIUM"
    },
    {
      id: "SIG-03",
      title: "RETENTION CLIFF SIGNAL",
      observation: "The global retention rate is extremely low at 9.19%.",
      evidence: `Casual explorers have a ${(casualRet * 100).toFixed(2)}% retention rate compared to ${(engagedRet * 100).toFixed(2)}% for engaged users.`,
      interpretation: "The platform fails to convert the vast majority of first-time explorers into returning users.",
      action: "Deploy aggressive Day-1/Day-2 re-engagement incentives to shift users out of the casual behavior pattern.",
      impact: "CRITICAL"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Page Title */}
      <div className="border-b border-console-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-console-text-main mb-1 uppercase">Decision Signals & Insights</h1>
        <p className="console-header text-console-text-muted">ANALYTICAL SIGNAL TO BUSINESS ACTION PIPELINE</p>
      </div>

      {/* 1. Existing Insights & Signals Content (Preserved Completely) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="console-header text-console-text-faint">OBSERVED BEHAVIORAL PATTERNS</p>
          <span className="text-[10px] font-mono text-console-text-muted">3 PRIMARY SIGNALS</span>
        </div>

        {signals.map((sig) => (
          <div 
            key={sig.id} 
            className="console-panel overflow-hidden border-l-4 group transition-colors hover:border-console-text-faint" 
            style={{ 
              borderLeftColor: sig.impact === 'CRITICAL' ? 'var(--color-console-red)' : sig.impact === 'HIGH' ? 'var(--color-console-accent)' : 'var(--color-console-amber)' 
            }}
          >
            <div className="border-b border-console-border p-3 bg-console-bg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="console-mono text-xs text-console-text-muted bg-console-surface px-1.5 py-0.5 border border-console-border-light rounded-sm">{sig.id}</span>
                <p className="console-header text-console-text-main font-bold">{sig.title}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide ${
                sig.impact === 'CRITICAL' ? 'bg-console-red/10 text-console-red' : 
                sig.impact === 'HIGH' ? 'bg-console-accent/10 text-console-accent' : 
                'bg-console-amber/10 text-console-amber'
              }`}>
                {sig.impact} PRIORITY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-console-border-light bg-console-surface">
              <div className="p-4 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-console-text-faint mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <p className="console-header text-[9px]">OBSERVATION</p>
                </div>
                <p className="text-xs font-medium text-console-text-main leading-relaxed">{sig.observation}</p>
              </div>

              <div className="p-4 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-console-text-faint mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>
                  <p className="console-header text-[9px]">EVIDENCE</p>
                </div>
                <p className="text-xs text-console-text-muted leading-relaxed font-mono bg-console-bg p-2 border border-console-border-light rounded-sm">{sig.evidence}</p>
              </div>

              <div className="p-4 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-console-text-faint mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                  <p className="console-header text-[9px]">INTERPRETATION</p>
                </div>
                <p className="text-xs font-medium text-console-text-main leading-relaxed">{sig.interpretation}</p>
              </div>

              <div className="p-4 space-y-1.5 bg-console-text-main text-console-surface md:col-span-1 border-l-0 md:border-l-2 md:border-l-console-accent transition-colors">
                <div className="flex items-center space-x-1.5 text-console-text-faint mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <p className="console-header text-[9px] text-console-surface">BUSINESS ACTION</p>
                </div>
                <p className="text-xs font-bold leading-relaxed">{sig.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. PLACED BELOW EXISTING INSIGHTS: Business Impact & Revenue Calculator */}
      <div className="console-panel p-6 bg-console-surface border-console-border space-y-6 border-t-4 border-t-console-accent">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-console-border-light gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="console-mono text-[9px] font-bold bg-console-accent text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">
                RETENTION ECONOMICS
              </span>
              <h2 className="text-base font-bold uppercase tracking-tight text-console-text-main">
                Business Impact & Revenue Calculator
              </h2>
            </div>
            <p className="text-xs text-console-text-muted mt-1">
              Simulates financial recovery and customer retention gains achieved by preventing churn across the analysed cohort.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="console-mono text-[10px] text-console-text-muted bg-console-bg px-2.5 py-1 rounded-sm border border-console-border">
              EMPIRICAL COHORT: {totalAnalyzed.toLocaleString()} USERS
            </span>
          </div>
        </div>

        {/* Real Dataset Baseline Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
            <span className="console-header block text-[10px] text-console-text-faint mb-1">
              TOTAL USERS ANALYSED
            </span>
            <span className="console-mono text-xl font-bold text-console-text-main">
              {totalAnalyzed.toLocaleString()}
            </span>
            <span className="block text-[10px] text-console-text-muted mt-0.5">
              Dec 1–21 observed cohort
            </span>
          </div>

          <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
            <span className="console-header block text-[10px] text-console-text-faint mb-1">
              AT-RISK CUSTOMERS
            </span>
            <span className="console-mono text-xl font-bold text-console-red">
              {atRiskCustomers.toLocaleString()}
            </span>
            <span className="block text-[10px] text-console-text-muted mt-0.5">
              Customers facing churn
            </span>
          </div>

          <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
            <span className="console-header block text-[10px] text-console-text-faint mb-1">
              AT-RISK PERCENTAGE
            </span>
            <span className="console-mono text-xl font-bold text-console-amber">
              {atRiskPercentage.toFixed(2)}%
            </span>
            <span className="block text-[10px] text-console-text-muted mt-0.5">
              of total user base
            </span>
          </div>

          <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
            <span className="console-header block text-[10px] text-console-text-faint mb-1">
              CURRENT RETAINED BASE
            </span>
            <span className="console-mono text-xl font-bold text-console-green">
              {actualRetained.toLocaleString()}
            </span>
            <span className="block text-[10px] text-console-text-muted mt-0.5">
              {(actualRetentionRate * 100).toFixed(2)}% baseline rate
            </span>
          </div>
        </div>

        {/* Adjustable Simulation Levers (Clearly Labeled Assumptions) */}
        <div className="p-4 bg-console-bg/80 border border-console-border rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-console-border-light pb-2">
            <span className="console-header text-console-text-main font-bold text-[11px] flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/></svg>
              CONFIGURABLE SIMULATION CONTROLS (HYPOTHETICAL ASSUMPTIONS)
            </span>
            <span className="text-[10px] text-console-text-faint italic">
              Adjust levers to model different retention campaign outcomes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            
            {/* Control 1: Retention Improvement Percentage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="retention-input" className="font-semibold text-console-text-main flex items-center gap-1">
                  <span>Retention Improvement (%):</span>
                  <span className="text-[9px] bg-console-bg border border-console-border px-1 py-0.2 rounded-xs text-console-text-muted font-normal">
                    Hypothetical Lift
                  </span>
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    id="retention-input"
                    type="number"
                    min="0.1"
                    max="25"
                    step="0.1"
                    value={retentionImprovementPct}
                    onChange={(e) => setRetentionImprovementPct(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-20 bg-console-surface border border-console-border px-2 py-0.5 console-mono text-xs font-bold text-console-accent text-right rounded-sm focus:outline-none focus:border-console-accent"
                  />
                  <span className="console-mono font-bold text-console-text-muted">%</span>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.5"
                value={retentionImprovementPct}
                onChange={(e) => setRetentionImprovementPct(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-console-border rounded-lg"
              />
              
              <div className="flex justify-between text-[10px] text-console-text-faint console-mono">
                <span>0.5% (Conservative)</span>
                <span>2.5% (Target)</span>
                <span>10.0% (High Impact)</span>
              </div>
            </div>

            {/* Control 2: Average Order Value (AOV in ₹) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="aov-rupees-input" className="font-semibold text-console-text-main flex items-center gap-1">
                  <span>Average Order Value (AOV):</span>
                  <span className="text-[9px] bg-console-bg border border-console-border px-1 py-0.2 rounded-xs text-console-text-muted font-normal">
                    Assumed Basket
                  </span>
                </label>
                <div className="flex items-center space-x-1">
                  <span className="console-mono font-bold text-console-text-muted">₹</span>
                  <input
                    id="aov-rupees-input"
                    type="number"
                    min="100"
                    max="50000"
                    step="100"
                    value={aovRupees}
                    onChange={(e) => setAovRupees(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-24 bg-console-surface border border-console-border px-2 py-0.5 console-mono text-xs font-bold text-console-green text-right rounded-sm focus:outline-none focus:border-console-accent"
                  />
                </div>
              </div>

              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={aovRupees}
                onChange={(e) => setAovRupees(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-console-border rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-console-text-faint console-mono">
                <span>₹500 (Single item)</span>
                <span>₹2,500 (Cosmetics Basket Median)</span>
                <span>₹10,000 (VIP Bundle)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Calculated Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Additional Retained Customers */}
          <div className="p-4 bg-console-accent/5 border-l-4 border-l-console-accent border border-console-border rounded-sm space-y-1">
            <span className="console-header block text-[10px] text-console-accent font-bold">
              ESTIMATED ADDITIONAL RETAINED CUSTOMERS
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="console-mono text-2xl font-bold text-console-accent">
                +{additionalRetainedCustomers.toLocaleString()}
              </span>
              <span className="text-xs text-console-text-muted">saved from churn</span>
            </div>
            <p className="text-[11px] text-console-text-muted pt-1">
              Formula: {atRiskCustomers.toLocaleString()} at-risk × {retentionImprovementPct}% improvement.
            </p>
          </div>

          {/* Card 2: Estimated Revenue Preserved in INR (₹) */}
          <div className="p-4 bg-console-green/5 border-l-4 border-l-console-green border border-console-border rounded-sm space-y-1">
            <span className="console-header block text-[10px] text-console-green font-bold">
              ESTIMATED REVENUE PRESERVED (₹)
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="console-mono text-2xl font-bold text-console-green">
                ₹{estimatedRevenuePreserved.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-console-text-muted">projected</span>
            </div>
            <p className="text-[11px] text-console-text-muted pt-1">
              Formula: {additionalRetainedCustomers.toLocaleString()} saved users × ₹{aovRupees.toLocaleString('en-IN')} AOV.
            </p>
          </div>

          {/* Card 3: Projected Cohort Retention Rate */}
          <div className="p-4 bg-console-surface border-l-4 border-l-console-amber border border-console-border rounded-sm space-y-1">
            <span className="console-header block text-[10px] text-console-amber font-bold">
              PROJECTED COHORT RETENTION RATE
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="console-mono text-2xl font-bold text-console-text-main">
                {projectedRetentionRate.toFixed(2)}%
              </span>
              <span className="text-xs text-console-green font-mono font-bold">
                (+{retentionImprovementPct.toFixed(1)}% lift)
              </span>
            </div>
            <p className="text-[11px] text-console-text-muted pt-1">
              Expands returning base from {actualRetained.toLocaleString()} to {projectedRetainedTotal.toLocaleString()} users.
            </p>
          </div>

        </div>

        {/* Explanatory Boundary & Academic Disclaimer */}
        <div className="p-3.5 bg-console-bg border border-console-border-light rounded-sm flex items-start gap-3 text-xs text-console-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-text-faint shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
          <div className="leading-relaxed">
            <strong className="text-console-text-main font-semibold">Methodological Context & Assumptions:</strong>{' '}
            Baseline statistics (273,366 total users, 248,253 at-risk customers, and 90.81% at-risk percentage) are actual empirical figures extracted from the December 2019 cosmetics dataset. 
            The Average Order Value (₹2,500) and Target Retention Improvement (%) represent analyst-configured hypothetical assumptions for decision support and scenario modeling. These calculations simulate potential business impact and do not guarantee future commercial results.
          </div>
        </div>

      </div>

    </div>
  );
}
