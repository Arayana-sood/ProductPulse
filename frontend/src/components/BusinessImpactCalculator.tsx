import { useState } from 'react';
import type { StatsResponse } from '../api/types';

interface BusinessImpactCalculatorProps {
  stats: StatsResponse;
}

export default function BusinessImpactCalculator({ stats }: BusinessImpactCalculatorProps) {
  // Extract real numbers from stats.json
  const totalUsers = stats.dataset.users_analyzed; // 273,366
  const retainedUsers = stats.dataset.retained_users; // 25,113
  const actualRetentionRate = stats.dataset.retention_rate; // 0.0919 (9.19%)
  
  // Total At-Risk Cohort (Disengaged or at risk of churn)
  const atRiskUsers = totalUsers - retainedUsers; // 248,253
  const atRiskPct = ((atRiskUsers / totalUsers) * 100); // 90.81%

  // Model-tested at-risk estimate (SVM predicts 84.1% of test users as at-risk)
  const svmAtRiskTestRate = stats.model_output.predicted_at_risk_rate_test; // 0.841

  // Interactive assumption states
  // Default AOV $32.00 (Empirical benchmark calculated from Cosmetics dataset session transactions ~ $31.74 - $43.44)
  const [aov, setAov] = useState<number>(32.0);
  const [retentionImprovementPct, setRetentionImprovementPct] = useState<number>(2.5);

  // Calculations:
  // Additional Retained Customers = At-Risk Customers * (Retention Improvement Percentage / 100)
  const additionalRetainedCustomers = Math.round(atRiskUsers * (retentionImprovementPct / 100));
  
  // Estimated Revenue Preserved = Additional Retained Customers * Average Order Value
  const estimatedRevenuePreserved = Math.round(additionalRetainedCustomers * aov);

  // Projected new retention rate
  const projectedRetainedTotal = retainedUsers + additionalRetainedCustomers;
  const projectedRetentionRate = (projectedRetainedTotal / totalUsers) * 100;

  return (
    <div className="console-panel p-6 bg-console-surface border-console-border space-y-6">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-console-border-light gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="console-mono text-[9px] font-bold bg-console-accent text-white px-1.5 py-0.5 rounded-sm">
              DECISION ECONOMICS
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wide text-console-text-main">
              BUSINESS IMPACT ANALYSIS & RETENTION CALCULATOR
            </h3>
          </div>
          <p className="text-xs text-console-text-muted mt-1">
            Translates ProductPulse machine learning churn predictions into quantifiable customer retention and preserved revenue scenarios.
          </p>
        </div>

        <span className="console-mono text-[10px] text-console-text-faint bg-console-bg px-2.5 py-1 rounded-sm border border-console-border self-start sm:self-auto">
          COHORT: DEC 2019 (273,366 USERS)
        </span>
      </div>

      {/* Baseline Cohort Exposure Grid (Real Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
          <span className="console-header block text-[10px] text-console-text-faint mb-1">
            TOTAL ANALYSED COHORT
          </span>
          <span className="console-mono text-xl font-bold text-console-text-main">
            {totalUsers.toLocaleString()}
          </span>
          <span className="block text-[10px] text-console-text-muted mt-0.5">
            Dec 1–21 observed users
          </span>
        </div>

        <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
          <span className="console-header block text-[10px] text-console-text-faint mb-1">
            PREDICTED AT-RISK USERS
          </span>
          <span className="console-mono text-xl font-bold text-console-red">
            {atRiskUsers.toLocaleString()}
          </span>
          <span className="block text-[10px] text-console-text-muted mt-0.5">
            {atRiskPct.toFixed(2)}% of total cohort
          </span>
        </div>

        <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
          <span className="console-header block text-[10px] text-console-text-faint mb-1">
            CURRENT RETENTION RATE
          </span>
          <span className="console-mono text-xl font-bold text-console-amber">
            {(actualRetentionRate * 100).toFixed(2)}%
          </span>
          <span className="block text-[10px] text-console-text-muted mt-0.5">
            {retainedUsers.toLocaleString()} returning customers
          </span>
        </div>

        <div className="p-3.5 bg-console-bg/50 border border-console-border-light rounded-sm">
          <span className="console-header block text-[10px] text-console-text-faint mb-1">
            SVM HELD-OUT CHURN RATE
          </span>
          <span className="console-mono text-xl font-bold text-console-text-main">
            {(svmAtRiskTestRate * 100).toFixed(1)}%
          </span>
          <span className="block text-[10px] text-console-text-muted mt-0.5">
            Test set disengagement rate
          </span>
        </div>

      </div>

      {/* Interactive Simulation Controls */}
      <div className="p-4 bg-console-bg/80 border border-console-border rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="console-header text-console-text-main font-bold text-[11px] flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/></svg>
            HYPOTHETICAL INTERVENTION ASSUMPTIONS
          </span>
          <span className="text-[10px] text-console-text-faint">
            Adjust levers to simulate business impact from proactive retention campaigns
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          
          {/* Lever 1: Retention Improvement Percentage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="retention-slider" className="font-semibold text-console-text-main">
                Target Retention Lift on At-Risk Cohort (%):
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={retentionImprovementPct}
                  onChange={(e) => setRetentionImprovementPct(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-16 bg-console-surface border border-console-border px-2 py-0.5 console-mono text-xs font-bold text-console-accent text-right rounded-sm focus:outline-none focus:border-console-accent"
                />
                <span className="console-mono font-bold text-console-text-muted">%</span>
              </div>
            </div>

            <input
              id="retention-slider"
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
              <span>2.5% (Moderate Target)</span>
              <span>10.0% (Aggressive)</span>
            </div>
          </div>

          {/* Lever 2: Average Order Value (AOV) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="aov-input" className="font-semibold text-console-text-main">
                Assumed Average Order Value (AOV):
              </label>
              <div className="flex items-center space-x-1">
                <span className="console-mono font-bold text-console-text-muted">$</span>
                <input
                  id="aov-input"
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  value={aov}
                  onChange={(e) => setAov(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-20 bg-console-surface border border-console-border px-2 py-0.5 console-mono text-xs font-bold text-console-green text-right rounded-sm focus:outline-none focus:border-console-accent"
                />
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="120"
              step="1"
              value={aov}
              onChange={(e) => setAov(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-console-border rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-console-text-faint console-mono">
              <span>$10 (Single item)</span>
              <span>$32 (Cosmetics Median Basket)</span>
              <span>$100+ (VIP Routine)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Projection Outcomes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        <div className="p-4 bg-console-accent/5 border-l-4 border-l-console-accent border border-console-border rounded-sm space-y-1">
          <span className="console-header block text-[10px] text-console-accent font-bold">
            ADDITIONAL RETAINED CUSTOMERS
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="console-mono text-2xl font-bold text-console-accent">
              +{additionalRetainedCustomers.toLocaleString()}
            </span>
            <span className="text-xs text-console-text-muted">users saved</span>
          </div>
          <p className="text-[11px] text-console-text-muted pt-1">
            Calculated as {atRiskUsers.toLocaleString()} at-risk users × {retentionImprovementPct}% lift.
          </p>
        </div>

        <div className="p-4 bg-console-green/5 border-l-4 border-l-console-green border border-console-border rounded-sm space-y-1">
          <span className="console-header block text-[10px] text-console-green font-bold">
            ESTIMATED PRESERVED REVENUE
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="console-mono text-2xl font-bold text-console-green">
              ${estimatedRevenuePreserved.toLocaleString()}
            </span>
            <span className="text-xs text-console-text-muted">gross value</span>
          </div>
          <p className="text-[11px] text-console-text-muted pt-1">
            Calculated as {additionalRetainedCustomers.toLocaleString()} saved users × ${aov.toFixed(2)} AOV assumption.
          </p>
        </div>

        <div className="p-4 bg-console-surface border-l-4 border-l-console-amber border border-console-border rounded-sm space-y-1">
          <span className="console-header block text-[10px] text-console-amber font-bold">
            PROJECTED COHORT RETENTION
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
            Shifts cohort from {retainedUsers.toLocaleString()} to {projectedRetainedTotal.toLocaleString()} returning customers.
          </p>
        </div>

      </div>

      {/* Methodological Context & Academic Disclaimer */}
      <div className="p-3 bg-console-bg border border-console-border-light rounded-sm flex items-start gap-2.5 text-xs text-console-text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-text-faint shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
        <div className="leading-relaxed">
          <strong className="text-console-text-main">Analytical Note & Assumption Boundary:</strong>{' '}
          Baseline cohort counts and at-risk distributions are real empirical values derived from the 273,366 user dataset. 
          The $32.00 baseline AOV reflects empirical cosmetics transaction basket medians (~$31.74). 
          These scenario projections represent simulated potential business impact for growth planning and decision support, not guaranteed revenue outcomes.
        </div>
      </div>

    </div>
  );
}
