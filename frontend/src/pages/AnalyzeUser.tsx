import { useState } from 'react';
import { api } from '../api/client';
import type { PredictionRequest, PredictionResponse } from '../api/types';
import ErrorDisplay from '../components/ErrorDisplay';
import { PageSkeleton } from '../components/Skeleton';
import { IMPROVEMENT_STRATEGIES, CATEGORIES, type Strategy } from '../data/improvementStrategies';
import SensitivityExplorer from '../components/SensitivityExplorer';

export interface BehaviorFormState {
  total_views: string;
  total_carts: string;
  total_purchases: string;
  total_removes: string;
  total_sessions: string;
  active_days: string;
  activity_duration_days: string;
}

export interface ScenarioDef {
  id: string;
  name: string;
  tag: string;
  description: string;
  values: {
    total_views: number;
    total_carts: number;
    total_purchases: number;
    total_removes: number;
    total_sessions: number;
    active_days: number;
    activity_duration_days: number;
  };
}

export const PREDEFINED_SCENARIOS: ScenarioDef[] = [
  {
    id: 'normal',
    name: 'Normal User',
    tag: 'Baseline Average',
    description: 'Average cohort behavior based on real dataset statistics (~5 views, ~3 carts, 1 purchase across 2 sessions).',
    values: {
      total_views: 5,
      total_carts: 3,
      total_purchases: 1,
      total_removes: 2,
      total_sessions: 2,
      active_days: 1,
      activity_duration_days: 1.3,
    }
  },
  {
    id: 'engaged',
    name: 'Highly Active',
    tag: 'High Engagement',
    description: 'Frequent visitor with 14 sessions across 5 active days, high checkout completion, and continuous engagement.',
    values: {
      total_views: 45,
      total_carts: 32,
      total_purchases: 8,
      total_removes: 20,
      total_sessions: 14,
      active_days: 5,
      activity_duration_days: 7.2,
    }
  },
  {
    id: 'low',
    name: 'Low Engagement',
    tag: 'Minimal / Bounced',
    description: 'Shallow single-interaction visit with 1 product view, zero cart additions, and no subsequent sessions.',
    values: {
      total_views: 1,
      total_carts: 0,
      total_purchases: 0,
      total_removes: 0,
      total_sessions: 1,
      active_days: 1,
      activity_duration_days: 0.1,
    }
  },
  {
    id: 'vip',
    name: 'High-Value VIP',
    tag: 'VIP Power Shopper',
    description: 'Top-tier customer with 24 purchases, 28 browsing sessions across 16 active days, and strong brand loyalty.',
    values: {
      total_views: 120,
      total_carts: 85,
      total_purchases: 24,
      total_removes: 15,
      total_sessions: 28,
      active_days: 16,
      activity_duration_days: 19.5,
    }
  },
  {
    id: 'at_risk',
    name: 'At-Risk User',
    tag: 'High Churn Risk',
    description: 'Stalled user across 14 days with 6 cart additions completely reversed by 6 removals and zero purchases.',
    values: {
      total_views: 10,
      total_carts: 6,
      total_purchases: 0,
      total_removes: 6,
      total_sessions: 3,
      active_days: 2,
      activity_duration_days: 14.0,
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    tag: 'Manual Experiment',
    description: 'Freeform sandbox to test arbitrary feature combinations and observe model boundary shifts.',
    values: {
      total_views: 0,
      total_carts: 0,
      total_purchases: 0,
      total_removes: 0,
      total_sessions: 0,
      active_days: 0,
      activity_duration_days: 0,
    }
  }
];

const inputFields: Array<{
  name: keyof BehaviorFormState;
  label: string;
  desc: string;
  step: string;
}> = [
  { name: 'total_views', label: 'Views', desc: 'Total number of times the user viewed any product page', step: '1' },
  { name: 'total_carts', label: 'Carts', desc: 'Total number of items the user added to their shopping cart', step: '1' },
  { name: 'total_purchases', label: 'Purchases', desc: 'Total number of completed checkout transactions', step: '1' },
  { name: 'total_removes', label: 'Removes', desc: 'Total number of items the user removed from their cart', step: '1' },
  { name: 'total_sessions', label: 'Sessions', desc: 'Total distinct browsing sessions (periods of continuous activity)', step: '1' },
  { name: 'active_days', label: 'Active Days', desc: 'Total number of unique calendar days the user was active', step: '1' },
  { name: 'activity_duration_days', label: 'Activity Duration', desc: 'Total days elapsed between first and last action (e.g. 1.5 days)', step: '0.1' },
];

function valuesToFormState(v: ScenarioDef['values']): BehaviorFormState {
  return {
    total_views: v.total_views.toString(),
    total_carts: v.total_carts.toString(),
    total_purchases: v.total_purchases.toString(),
    total_removes: v.total_removes.toString(),
    total_sessions: v.total_sessions.toString(),
    active_days: v.active_days.toString(),
    activity_duration_days: v.activity_duration_days.toString(),
  };
}

function emptyFormState(): BehaviorFormState {
  return {
    total_views: '',
    total_carts: '',
    total_purchases: '',
    total_removes: '',
    total_sessions: '',
    active_days: '',
    activity_duration_days: '',
  };
}

// ------------------------------------------------------------
// 1. CONSOLIDATED PREDICTION RESULTS PANEL (SINGLE QUERY VIEW)
// ------------------------------------------------------------
function ConsolidatedPredictionResults({
  result,
  formValues,
  label
}: {
  result: PredictionResponse;
  formValues: BehaviorFormState;
  label?: string;
}) {
  const isRetained = result.prediction.retained === 1;
  const isEngaged = result.segment.key === 'engaged';

  const views = parseFloat(formValues.total_views) || 0;
  const sessions = parseFloat(formValues.total_sessions) || 0;
  const purchases = parseFloat(formValues.total_purchases) || 0;
  const activeDays = parseFloat(formValues.active_days) || 0;

  return (
    <div className="console-panel flex flex-col h-full animate-fade-in border-t-2 border-t-console-accent">
      <div className="border-b border-console-border p-3 bg-console-bg flex items-center justify-between">
        <p className="console-header text-console-text-main font-bold">{label || 'PREDICTION ENGINE OUTPUT'}</p>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold ${
          isRetained 
            ? 'bg-console-green/10 text-console-green border border-console-green/30' 
            : 'bg-console-red/10 text-console-red border border-console-red/30'
        }`}>
          {isRetained ? 'Retained Segment' : 'At-Risk Segment'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-6 flex-1">
        
        {/* Retention Prediction */}
        <div>
          <p className="console-header mb-2 text-console-text-muted">RETENTION PREDICTION</p>
          <div className="flex items-center">
            <span className={`w-3.5 h-3.5 rounded-full mr-3 shrink-0 ${isRetained ? 'bg-console-green' : 'bg-console-red'}`}></span>
            <div>
              <h2 className={`text-2xl font-bold uppercase tracking-tight ${isRetained ? 'text-console-green' : 'text-console-red'}`}>
                {result.prediction.verdict}
              </h2>
              <p className="text-xs text-console-text-muted mt-0.5">
                {isRetained
                  ? 'User exhibits strong returning patterns and is expected to engage again within the observation window.'
                  : 'User exhibits disengagement characteristics and is at elevated risk of permanent churn.'}
              </p>
            </div>
          </div>
        </div>

        {/* SVM Decision Score */}
        <div className="border-l-2 border-console-border pl-4 bg-console-bg/40 py-2.5 pr-3 rounded-r-sm">
          <div className="flex items-baseline justify-between">
            <p className="console-header text-console-text-muted">SVM DECISION SCORE</p>
            <span className="console-mono text-[10px] text-console-text-faint">HYPERPLANE MARGIN</span>
          </div>
          <p className="console-mono text-2xl font-bold text-console-text-main my-1">
            {result.prediction.decision_score > 0 ? `+${result.prediction.decision_score.toFixed(4)}` : result.prediction.decision_score.toFixed(4)}
          </p>
          <p className="text-[10px] text-console-text-muted uppercase tracking-wide leading-relaxed">
            THIS IS AN SVM DECISION SCORE (ORTHOGONAL DISTANCE TO SEPARATING BOUNDARY), NOT A PROBABILITY. POSITIVE VALUES INDICATE PERSISTENT RETURN BEHAVIOR.
          </p>
        </div>

        {/* Behavioral Influence Analysis */}
        <div className="p-3.5 bg-console-surface border border-console-border rounded-sm">
          <p className="console-header text-console-text-main mb-1.5 flex items-center justify-between">
            <span>BEHAVIORAL INFLUENCE ANALYSIS</span>
            <span className="text-[9px] font-mono text-console-text-muted">FEATURE IMPACT</span>
          </p>
          <p className="text-xs text-console-text-muted leading-relaxed">
            {isRetained ? (
              <>
                The SVM classifier placed this user in the positive margin primarily driven by <strong className="text-console-text-main font-semibold">sustained multi-session interaction ({sessions} sessions across {activeDays} active days)</strong> and <strong className="text-console-text-main font-semibold">confirmed transactions ({purchases} purchases)</strong>.
              </>
            ) : (
              <>
                The user falls on the negative side of the decision boundary due to <strong className="text-console-text-main font-semibold">low session continuity ({sessions} sessions)</strong>, <strong className="text-console-text-main font-semibold">low active days ({activeDays} day)</strong>, and <strong className="text-console-text-main font-semibold">limited transaction velocity ({purchases} purchases out of {views} views)</strong>.
              </>
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-console-border-light text-[11px]">
            <div>
              <span className="console-header block text-[9px] text-console-text-faint">TOTAL EVENTS</span>
              <span className="console-mono font-bold text-console-text-main">{result.derived_features.total_events}</span>
            </div>
            <div>
              <span className="console-header block text-[9px] text-console-text-faint">EVENTS / SESSION</span>
              <span className="console-mono font-bold text-console-text-main">{result.derived_features.events_per_session.toFixed(2)}</span>
            </div>
            <div>
              <span className="console-header block text-[9px] text-console-text-faint">PURCHASE / VIEW</span>
              <span className="console-mono font-bold text-console-text-main">{(result.derived_features.purchase_view_ratio * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="console-header block text-[9px] text-console-text-faint">CART / VIEW</span>
              <span className="console-mono font-bold text-console-text-main">{(result.derived_features.cart_view_ratio * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* K-Means Behavioral Cohort */}
        <div className="pt-2 border-t border-console-border-light">
          <p className="console-header mb-1 text-console-text-muted">K-MEANS BEHAVIORAL COHORT</p>
          <div className="flex items-baseline justify-between">
            <p className={`text-base font-bold uppercase tracking-wide ${isEngaged ? 'text-console-accent' : 'text-console-text-main'}`}>
              {result.segment.label}
            </p>
            <p className="console-mono text-xs text-console-text-muted">
              {result.segment.segment_percentage}% OF ENTIRE COHORT
            </p>
          </div>
        </div>

        {/* Signals Detected */}
        <div className="pt-2 border-t border-console-border-light">
          <p className="console-header mb-2 text-console-text-muted">SIGNALS DETECTED</p>
          <ul className="space-y-2">
            {result.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start text-xs text-console-text-main leading-relaxed">
                <span className="text-console-accent mr-2 mt-0.5 font-bold shrink-0">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sensitivity Analysis / Tipping-Point Explorer */}
        <div className="pt-2 border-t border-console-border-light">
          <SensitivityExplorer
            baseInputs={{
              total_views: views,
              total_carts: parseFloat(formValues.total_carts) || 0,
              total_purchases: purchases,
              total_removes: parseFloat(formValues.total_removes) || 0,
              total_sessions: sessions,
              active_days: activeDays,
              activity_duration_days: parseFloat(formValues.activity_duration_days) || 0,
            }}
            baseResult={result}
          />
        </div>

        {/* Data Warnings if any */}
        {result.warnings.length > 0 && (
          <div className="p-3 bg-console-amber/10 border border-console-amber/30 rounded-sm">
            <p className="console-header text-console-amber mb-1">DATA WARNINGS</p>
            <ul className="list-disc pl-4 space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i} className="text-xs text-console-amber">{w}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 2. SEPARATE RECOMMENDED ACTIONS SECTION (SINGLE QUERY ONLY)
// ------------------------------------------------------------
function SeparateRecommendedActionsSection({
  result,
  formValues
}: {
  result: PredictionResponse | null;
  formValues: BehaviorFormState;
}) {
  const [showStrategies, setShowStrategies] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isRetained = result ? result.prediction.retained === 1 : false;
  const carts = parseFloat(formValues.total_carts) || 0;
  const purchases = parseFloat(formValues.total_purchases) || 0;
  const hasCartFriction = carts > 0 && purchases === 0;

  const filteredStrategies = IMPROVEMENT_STRATEGIES.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.example.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRelevanceBadge = (strategy: Strategy) => {
    if (!result) return null;
    if (!isRetained && (strategy.category === 'retention' || strategy.category === 'inactivity')) {
      return {
        label: 'CRITICAL PRIORITY: PREDICTED CHURN',
        className: 'bg-console-red/15 text-console-red border-console-red/30',
      };
    }
    if (hasCartFriction && strategy.id === 'freq-1') {
      return {
        label: 'HIGH IMPACT: CART FRICTION DETECTED',
        className: 'bg-console-amber/15 text-console-amber border-console-amber/30',
      };
    }
    if (isRetained && (strategy.category === 'repeat_purchases' || strategy.category === 'engagement')) {
      return {
        label: 'RETENTION AMPLIFIER',
        className: 'bg-console-green/15 text-console-green border-console-green/30',
      };
    }
    return null;
  };

  return (
    <div className="console-panel p-5 bg-console-surface border-console-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-console-border-light gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-console-text-main flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            RECOMMENDED ACTIONS & STRATEGY PLAYBOOKS
          </h3>
          <p className="text-xs text-console-text-muted mt-0.5">
            Operational and business interventions tailored to customer behavior patterns and prediction risk.
          </p>
        </div>

        <button
          onClick={() => setShowStrategies(!showStrategies)}
          className={`py-2 px-4 text-xs font-bold rounded-sm border transition-all flex items-center justify-center gap-2 uppercase tracking-wide shrink-0 ${
            showStrategies
              ? 'bg-console-text-main text-console-surface border-console-text-main'
              : 'bg-console-accent hover:bg-console-accent-hover text-white border-console-accent shadow-sm'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          {showStrategies ? 'Hide Improvement Strategies' : 'Explore Improvement Strategies'}
          <span className="font-mono text-[10px] ml-1">{showStrategies ? '▲' : '▼'}</span>
        </button>
      </div>

      {result && result.recommendations.length > 0 && (
        <div className="bg-console-bg p-3.5 border border-console-border-light rounded-sm">
          <p className="console-header text-console-text-muted text-[10px] mb-2">PRIMARY ALGORITHMIC RECOMMENDATIONS</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-console-surface p-2.5 rounded-sm border border-console-border-light">
                <span className="text-console-accent font-bold text-xs mt-0.5">→</span>
                <div>
                  <p className="text-xs font-semibold text-console-text-main">{rec.text}</p>
                  <p className="text-[10px] text-console-text-muted mt-0.5">Basis: {rec.basis.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showStrategies && (
        <div className="space-y-4 pt-3 border-t border-console-border-light animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-sm whitespace-nowrap text-[11px] font-medium transition-colors border ${
                    selectedCategory === cat.id
                      ? 'bg-console-text-main text-console-surface border-console-text-main shadow-sm'
                      : 'bg-console-surface text-console-text-muted border-console-border hover:bg-console-bg hover:text-console-text-main'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword..."
                className="w-full bg-console-surface border border-console-border px-3 py-1 text-xs text-console-text-main placeholder-console-text-faint focus:outline-none focus:border-console-accent rounded-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-console-text-faint hover:text-console-text-main text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {filteredStrategies.map((strat) => {
              const relevance = getRelevanceBadge(strat);
              return (
                <div
                  key={strat.id}
                  className={`p-4 rounded-sm border transition-all flex flex-col justify-between ${
                    relevance
                      ? 'bg-console-surface border-console-accent/40 shadow-sm'
                      : 'bg-console-surface border-console-border hover:border-console-text-muted'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="console-mono text-[9px] font-bold uppercase tracking-wider text-console-text-muted bg-console-bg px-1.5 py-0.5 border border-console-border-light rounded-sm">
                        {strat.categoryLabel}
                      </span>
                      {relevance && (
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm border font-bold uppercase tracking-wider ${relevance.className}`}>
                          {relevance.label}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-bold text-console-text-main mb-1.5">{strat.title}</h4>

                    <div className="mb-3">
                      <p className="console-header text-[9px] text-console-text-faint mb-0.5">RECOMMENDED ACTION</p>
                      <p className="text-xs font-semibold text-console-text-main leading-relaxed">
                        {strat.action}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-console-border-light">
                    <div className="bg-console-bg/60 p-2 rounded-sm border border-console-border-light">
                      <p className="console-header text-[8px] text-console-text-muted mb-0.5">WHY IT IS USEFUL</p>
                      <p className="text-[11px] text-console-text-muted leading-relaxed">
                        {strat.rationale}
                      </p>
                    </div>
                    <div className="bg-console-bg/60 p-2 rounded-sm border border-console-border-light">
                      <p className="console-header text-[8px] text-console-accent mb-0.5">PRACTICAL EXAMPLE</p>
                      <p className="text-[11px] text-console-text-main leading-relaxed italic">
                        "{strat.example}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// 3. ACTUAL ANALYTICAL SCENARIO-TO-SCENARIO COMPARISON (NO PLAYBOOKS)
// ------------------------------------------------------------
function AnalyticalScenarioComparison({
  formValuesA,
  formValuesB,
  resultA,
  resultB,
  scenarioNameA,
  scenarioNameB,
}: {
  formValuesA: BehaviorFormState;
  formValuesB: BehaviorFormState;
  resultA: PredictionResponse | null;
  resultB: PredictionResponse | null;
  scenarioNameA: string;
  scenarioNameB: string;
}) {
  // If either prediction hasn't been generated yet
  if (!resultA || !resultB) {
    return (
      <div className="console-panel p-8 text-center border-dashed border-2 bg-console-surface">
        <p className="console-header text-console-text-muted text-xs mb-2">COMPARISON ENGINE WAITING</p>
        <p className="text-xs text-console-text-faint max-w-md mx-auto">
          Please run predictions for both Scenario A and Scenario B above to generate the analytical side-by-side behavioral comparison.
        </p>
      </div>
    );
  }

  // Feature Comparison Data
  const featureComparisons = inputFields.map((field) => {
    const valA = parseFloat(formValuesA[field.name]) || 0;
    const valB = parseFloat(formValuesB[field.name]) || 0;
    const absDiff = Math.abs(valB - valA);
    const rawDiff = valB - valA;
    
    let pctDiffStr = '0.0%';
    if (valA === 0 && valB === 0) {
      pctDiffStr = '0.0%';
    } else if (valA === 0 && valB > 0) {
      pctDiffStr = '+100% (New)';
    } else if (valA > 0 && valB === 0) {
      pctDiffStr = '-100%';
    } else {
      const pct = (rawDiff / valA) * 100;
      pctDiffStr = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
    }

    const higher = valA > valB ? 'A' : valB > valA ? 'B' : 'equal';
    const hasChanged = absDiff > 0.0001;

    // Relative bar widths
    const maxVal = Math.max(valA, valB, 0.0001);
    const barA = (valA / maxVal) * 100;
    const barB = (valB / maxVal) * 100;

    return {
      field,
      valA,
      valB,
      absDiff,
      rawDiff,
      pctDiffStr,
      higher,
      hasChanged,
      barA,
      barB,
    };
  });

  // Machine Learning Output Comparisons
  const verdictA = resultA.prediction.verdict;
  const verdictB = resultB.prediction.verdict;
  const isRetainedA = resultA.prediction.retained === 1;
  const isRetainedB = resultB.prediction.retained === 1;

  const scoreA = resultA.prediction.decision_score;
  const scoreB = resultB.prediction.decision_score;
  const scoreDelta = scoreB - scoreA;

  const segmentA = resultA.segment;
  const segmentB = resultB.segment;

  const derivedA = resultA.derived_features;
  const derivedB = resultB.derived_features;

  // Dynamic Synthesis for Findings
  const changedFeatures = featureComparisons.filter(f => f.hasChanged);
  const totalEventsA = derivedA.total_events;
  const totalEventsB = derivedB.total_events;
  const purchasesA = parseFloat(formValuesA.total_purchases) || 0;
  const purchasesB = parseFloat(formValuesB.total_purchases) || 0;
  const sessionsA = parseFloat(formValuesA.total_sessions) || 0;
  const sessionsB = parseFloat(formValuesB.total_sessions) || 0;
  const activeDaysA = parseFloat(formValuesA.active_days) || 0;
  const activeDaysB = parseFloat(formValuesB.active_days) || 0;

  // Determining engagement and purchase leadership
  const engagementLeader = totalEventsB > totalEventsA ? 'Scenario B' : totalEventsA > totalEventsB ? 'Scenario A' : 'Both equal';
  const purchaseLeader = purchasesB > purchasesA ? 'Scenario B' : purchasesA > purchasesB ? 'Scenario A' : 'Both equal';

  // Analytical reasoning for verdict differences
  let predictionDeltaExplanation = '';
  if (isRetainedA !== isRetainedB) {
    const winner = isRetainedB ? 'Scenario B' : 'Scenario A';
    const loser = isRetainedB ? 'Scenario A' : 'Scenario B';
    predictionDeltaExplanation = `${winner} crossed the SVM hyperplane threshold into the positive margin (${(isRetainedB ? scoreB : scoreA) > 0 ? '+' : ''}${(isRetainedB ? scoreB : scoreA).toFixed(4)}), converting to "Predicted to Return". In contrast, ${loser} remains on the negative side (${(isRetainedB ? scoreA : scoreB).toFixed(4)}) due to insufficient session density and transaction velocity.`;
  } else if (isRetainedA && isRetainedB) {
    predictionDeltaExplanation = `Both scenarios are classified as "Predicted to Return" because their interaction intensity places both user profiles above the SVM decision boundary. However, Scenario ${scoreB > scoreA ? 'B has a wider positive margin (+' + scoreB.toFixed(4) + ' vs +' + scoreA.toFixed(4) + ')' : 'A has a wider positive margin (+' + scoreA.toFixed(4) + ' vs +' + scoreB.toFixed(4) + ')'}, demonstrating stronger resistance to churn.`;
  } else {
    predictionDeltaExplanation = `Both scenarios receive the "At-Risk / Predicted to Disengage" verdict despite their behavioral variance. Neither user established the critical threshold of multi-day repeat sessions needed to cross the SVM separating hyperplane into the returning classification.`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ------------------------------------------------------------ */}
      {/* SECTION 1: SIDE-BY-SIDE FEATURE COMPARISON MATRIX */}
      {/* ------------------------------------------------------------ */}
      <div className="console-panel overflow-hidden border-console-border">
        <div className="border-b border-console-border p-3.5 bg-console-bg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-console-text-main flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
              BEHAVIORAL INPUT COMPARISON MATRIX
            </h3>
            <p className="text-xs text-console-text-muted mt-0.5">
              Exact feature values, relative visual bars, absolute deltas, and percentage shifts between scenarios.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs console-mono">
            <span className="flex items-center gap-1.5 text-console-text-main">
              <span className="w-2.5 h-2.5 bg-console-accent rounded-sm inline-block"></span>
              A: {scenarioNameA}
            </span>
            <span className="flex items-center gap-1.5 text-console-text-main">
              <span className="w-2.5 h-2.5 bg-console-green rounded-sm inline-block"></span>
              B: {scenarioNameB}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-console-border bg-console-bg/40 text-[10px] console-header">
                <th className="py-2.5 px-4 text-left">BEHAVIORAL FEATURE</th>
                <th className="py-2.5 px-4 text-right">SCENARIO A ({scenarioNameA})</th>
                <th className="py-2.5 px-4 text-left w-36">MAGNITUDE RATIO</th>
                <th className="py-2.5 px-4 text-right">SCENARIO B ({scenarioNameB})</th>
                <th className="py-2.5 px-4 text-right">ABSOLUTE DELTA</th>
                <th className="py-2.5 px-4 text-right">% SHIFT</th>
                <th className="py-2.5 px-4 text-center">DOMINANT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-console-border-light">
              {featureComparisons.map((item) => (
                <tr 
                  key={item.field.name}
                  className={`transition-colors hover:bg-console-bg/50 ${
                    item.hasChanged ? 'bg-console-surface' : 'opacity-60 bg-console-bg/20'
                  }`}
                >
                  {/* Feature Label */}
                  <td className="py-3 px-4 font-semibold text-console-text-main">
                    <div className="flex items-center space-x-1.5">
                      <span>{item.field.label}</span>
                      {item.hasChanged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-console-accent" title="Value changed between scenarios"></span>
                      )}
                    </div>
                  </td>

                  {/* Scenario A Value */}
                  <td className="py-3 px-4 text-right console-mono font-medium text-console-text-main">
                    {item.valA}
                  </td>

                  {/* Visual Comparison Bars */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="w-full bg-console-border-light h-1.5 rounded-sm overflow-hidden">
                        <div 
                          className="bg-console-accent h-full transition-all duration-300"
                          style={{ width: `${item.barA}%` }}
                        ></div>
                      </div>
                      <div className="w-full bg-console-border-light h-1.5 rounded-sm overflow-hidden">
                        <div 
                          className="bg-console-green h-full transition-all duration-300"
                          style={{ width: `${item.barB}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Scenario B Value */}
                  <td className="py-3 px-4 text-right console-mono font-medium text-console-text-main">
                    {item.valB}
                  </td>

                  {/* Absolute Delta */}
                  <td className="py-3 px-4 text-right console-mono font-semibold">
                    {item.hasChanged ? (
                      <span className={item.rawDiff > 0 ? 'text-console-green' : 'text-console-amber'}>
                        {item.rawDiff > 0 ? `+${item.rawDiff.toFixed(item.field.step === '0.1' ? 1 : 0)}` : item.rawDiff.toFixed(item.field.step === '0.1' ? 1 : 0)}
                      </span>
                    ) : (
                      <span className="text-console-text-faint">0</span>
                    )}
                  </td>

                  {/* Percentage Shift */}
                  <td className="py-3 px-4 text-right console-mono font-semibold">
                    {item.hasChanged ? (
                      <span className={item.rawDiff > 0 ? 'text-console-green' : 'text-console-amber'}>
                        {item.pctDiffStr}
                      </span>
                    ) : (
                      <span className="text-console-text-faint">0.0%</span>
                    )}
                  </td>

                  {/* Dominant Pillar */}
                  <td className="py-3 px-4 text-center">
                    {item.higher === 'A' ? (
                      <span className="px-1.5 py-0.5 rounded-sm bg-console-accent/10 border border-console-accent/30 text-console-accent text-[9px] font-bold console-mono">
                        A &gt; B
                      </span>
                    ) : item.higher === 'B' ? (
                      <span className="px-1.5 py-0.5 rounded-sm bg-console-green/10 border border-console-green/30 text-console-green text-[9px] font-bold console-mono">
                        B &gt; A
                      </span>
                    ) : (
                      <span className="text-[10px] text-console-text-faint font-mono">Equal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* SECTION 2: MACHINE LEARNING OUTPUT COMPARISON MATRIX */}
      {/* ------------------------------------------------------------ */}
      <div className="console-panel p-5 bg-console-surface border-console-border">
        <div className="border-b border-console-border-light pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-console-text-main flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              MODEL PREDICTION & CLASSIFICATION COMPARISON
            </h3>
            <p className="text-xs text-console-text-muted mt-0.5">
              Direct comparison of retention verdicts, SVM decision hyperplane scores, and clustering assignments.
            </p>
          </div>
          <span className="console-mono text-[10px] text-console-text-faint bg-console-bg px-2 py-0.5 rounded-sm border border-console-border">
            REAL API OUTPUTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Scenario A ML Card */}
          <div className="p-4 rounded-sm border border-console-border bg-console-bg/30 space-y-4">
            <div className="flex items-center justify-between border-b border-console-border-light pb-2">
              <span className="console-header text-console-accent font-bold">SCENARIO A: {scenarioNameA}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase ${
                isRetainedA ? 'bg-console-green/15 text-console-green border border-console-green/30' : 'bg-console-red/15 text-console-red border border-console-red/30'
              }`}>
                {verdictA}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="console-header block text-[9px] text-console-text-faint">SVM DECISION SCORE</span>
                <span className="console-mono text-lg font-bold text-console-text-main">
                  {scoreA > 0 ? `+${scoreA.toFixed(4)}` : scoreA.toFixed(4)}
                </span>
                <span className="block text-[8px] text-console-text-muted mt-0.5 uppercase">Orthogonal Hyperplane Distance</span>
              </div>
              <div>
                <span className="console-header block text-[9px] text-console-text-faint">BEHAVIORAL COHORT</span>
                <span className="text-sm font-bold text-console-text-main uppercase block mt-1">
                  {segmentA.label}
                </span>
                <span className="console-mono text-[9px] text-console-text-muted">{segmentA.segment_percentage}% of cohort</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-console-border-light text-[11px]">
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">EVENTS</span>
                <span className="console-mono font-bold">{derivedA.total_events}</span>
              </div>
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">EV/SESSION</span>
                <span className="console-mono font-bold">{derivedA.events_per_session.toFixed(2)}</span>
              </div>
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">PUR/VIEW</span>
                <span className="console-mono font-bold">{(derivedA.purchase_view_ratio * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">CART/VIEW</span>
                <span className="console-mono font-bold">{(derivedA.cart_view_ratio * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Scenario B ML Card */}
          <div className="p-4 rounded-sm border border-console-border bg-console-bg/30 space-y-4">
            <div className="flex items-center justify-between border-b border-console-border-light pb-2">
              <span className="console-header text-console-green font-bold">SCENARIO B: {scenarioNameB}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase ${
                isRetainedB ? 'bg-console-green/15 text-console-green border border-console-green/30' : 'bg-console-red/15 text-console-red border border-console-red/30'
              }`}>
                {verdictB}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="console-header block text-[9px] text-console-text-faint">SVM DECISION SCORE</span>
                <span className="console-mono text-lg font-bold text-console-text-main">
                  {scoreB > 0 ? `+${scoreB.toFixed(4)}` : scoreB.toFixed(4)}
                </span>
                <span className="block text-[8px] text-console-text-muted mt-0.5 uppercase">Orthogonal Hyperplane Distance</span>
              </div>
              <div>
                <span className="console-header block text-[9px] text-console-text-faint">BEHAVIORAL COHORT</span>
                <span className="text-sm font-bold text-console-text-main uppercase block mt-1">
                  {segmentB.label}
                </span>
                <span className="console-mono text-[9px] text-console-text-muted">{segmentB.segment_percentage}% of cohort</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-console-border-light text-[11px]">
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">EVENTS</span>
                <span className="console-mono font-bold">{derivedB.total_events}</span>
              </div>
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">EV/SESSION</span>
                <span className="console-mono font-bold">{derivedB.events_per_session.toFixed(2)}</span>
              </div>
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">PUR/VIEW</span>
                <span className="console-mono font-bold">{(derivedA.purchase_view_ratio * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="console-header block text-[8px] text-console-text-faint">CART/VIEW</span>
                <span className="console-mono font-bold">{(derivedB.cart_view_ratio * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Delta Callout Bar */}
        <div className="mt-4 p-3 bg-console-bg rounded-sm border border-console-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="console-header text-console-text-faint">SVM DECISION SCORE DELTA (B - A):</span>
            <span className={`console-mono font-bold text-sm ${scoreDelta > 0 ? 'text-console-green' : scoreDelta < 0 ? 'text-console-red' : 'text-console-text-main'}`}>
              {scoreDelta > 0 ? `+${scoreDelta.toFixed(4)}` : scoreDelta.toFixed(4)}
            </span>
          </div>
          <span className="text-[10px] text-console-text-muted uppercase">
            REMINDER: SVM DECISION SCORE IS ORTHOGONAL DISTANCE TO THE DECISION BOUNDARY, NOT A PROBABILITY.
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* SECTION 3: EXPLAIN WHY THE PREDICTIONS ARE DIFFERENT */}
      {/* ------------------------------------------------------------ */}
      <div className="console-panel p-5 bg-console-surface border-console-border space-y-4">
        <div className="border-b border-console-border-light pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-console-text-main flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
            MODEL BEHAVIOR & DECISION BOUNDARY EXPLANATION
          </h3>
          <p className="text-xs text-console-text-muted mt-0.5">
            Analytical breakdown of how feature variance drove the linear classifier margin and cohort grouping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-console-bg p-3.5 rounded-sm border border-console-border-light space-y-2">
            <p className="console-header text-console-accent font-bold">WHY SCENARIO A RECEIVED {verdictA.toUpperCase()}</p>
            <p className="text-console-text-main leading-relaxed">
              {isRetainedA ? (
                <>
                  Scenario A maintained sufficient interaction velocity ({sessionsA} sessions across {activeDaysA} active days) and completed transactions ({purchasesA} purchases) to stay on the positive side of the linear SVM hyperplane ({scoreA > 0 ? `+${scoreA.toFixed(4)}` : scoreA.toFixed(4)}).
                </>
              ) : (
                <>
                  Scenario A fell on the negative margin ({scoreA.toFixed(4)}) because its limited browsing continuity ({sessionsA} sessions over {activeDaysA} active day) and low transaction count ({purchasesA} purchases) match historical disengagement patterns.
                </>
              )}
            </p>
          </div>

          <div className="bg-console-bg p-3.5 rounded-sm border border-console-border-light space-y-2">
            <p className="console-header text-console-green font-bold">WHY SCENARIO B RECEIVED {verdictB.toUpperCase()}</p>
            <p className="text-console-text-main leading-relaxed">
              {isRetainedB ? (
                <>
                  Scenario B achieved positive classification margin ({scoreB > 0 ? `+${scoreB.toFixed(4)}` : scoreB.toFixed(4)}) propelled by high session recurrence ({sessionsB} sessions across {activeDaysB} active days) and strong checkout volume ({purchasesB} purchases).
                </>
              ) : (
                <>
                  Scenario B registered on the negative side of the boundary ({scoreB.toFixed(4)}) because despite any cart additions, its lack of repeat return sessions and zero completed checkout conversions indicate immediate churn risk.
                </>
              )}
            </p>
          </div>

          <div className="bg-console-bg p-3.5 rounded-sm border border-console-border-light space-y-2">
            <p className="console-header text-console-text-main font-bold">DECISION BOUNDARY DELTA</p>
            <p className="text-console-text-muted leading-relaxed">
              {predictionDeltaExplanation}
            </p>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* SECTION 4: KEY DIFFERENCES & FINDINGS SUMMARY */}
      {/* ------------------------------------------------------------ */}
      <div className="console-panel p-5 bg-console-surface border-console-border space-y-4">
        <div className="border-b border-console-border-light pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-console-text-main flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            KEY DIFFERENCES & FINDINGS
          </h3>
          <p className="text-xs text-console-text-muted mt-0.5">
            Core analytical takeaways synthesized from this side-by-side behavioral comparison.
          </p>
        </div>

        <div className="space-y-3">
          
          {/* Finding 1: Biggest Differences */}
          <div className="flex items-start gap-3 p-3 bg-console-bg/60 rounded-sm border border-console-border-light text-xs">
            <span className="console-mono text-[10px] font-bold bg-console-surface px-2 py-0.5 border border-console-border text-console-text-muted shrink-0">
              1. BIGGEST SHIFTS
            </span>
            <div className="text-console-text-main leading-relaxed">
              {changedFeatures.length > 0 ? (
                <>
                  The most pronounced behavioral differences are found in{' '}
                  <strong className="text-console-text-main">
                    {changedFeatures.slice(0, 3).map(f => `${f.field.label} (${f.pctDiffStr})`).join(', ')}
                  </strong>
                  . Across all features, {changedFeatures.length} of 7 behavioral metrics exhibited variance.
                </>
              ) : (
                'Both scenarios have identical input parameters. No behavioral shifts were detected.'
              )}
            </div>
          </div>

          {/* Finding 2: Higher Engagement */}
          <div className="flex items-start gap-3 p-3 bg-console-bg/60 rounded-sm border border-console-border-light text-xs">
            <span className="console-mono text-[10px] font-bold bg-console-surface px-2 py-0.5 border border-console-border text-console-text-muted shrink-0">
              2. ENGAGEMENT LEADER
            </span>
            <div className="text-console-text-main leading-relaxed">
              <strong className="text-console-accent">{engagementLeader}</strong> demonstrates superior engagement depth, accumulating {totalEventsB > totalEventsA ? `${totalEventsB} total events across ${sessionsB} sessions` : `${totalEventsA} total events across ${sessionsA} sessions`} compared to {totalEventsB > totalEventsA ? `${totalEventsA} events across ${sessionsA} sessions` : `${totalEventsB} events across ${sessionsB} sessions`}.
            </div>
          </div>

          {/* Finding 3: Purchasing Activity */}
          <div className="flex items-start gap-3 p-3 bg-console-bg/60 rounded-sm border border-console-border-light text-xs">
            <span className="console-mono text-[10px] font-bold bg-console-surface px-2 py-0.5 border border-console-border text-console-text-muted shrink-0">
              3. PURCHASE ACTIVITY
            </span>
            <div className="text-console-text-main leading-relaxed">
              <strong className="text-console-green">{purchaseLeader}</strong> leads transactional activity with {Math.max(purchasesA, purchasesB)} completed purchases versus {Math.min(purchasesA, purchasesB)} in the opposing scenario.
            </div>
          </div>

          {/* Finding 4: Behavioral Factors Explaining Prediction */}
          <div className="flex items-start gap-3 p-3 bg-console-bg/60 rounded-sm border border-console-border-light text-xs">
            <span className="console-mono text-[10px] font-bold bg-console-surface px-2 py-0.5 border border-console-border text-console-text-muted shrink-0">
              4. PREDICTION DRIVERS
            </span>
            <div className="text-console-text-main leading-relaxed">
              The Linear SVM model is sensitive to multi-session interaction frequency and active days span. The shift of {scoreDelta > 0 ? `+${scoreDelta.toFixed(4)}` : scoreDelta.toFixed(4)} in decision margin correlates directly with the {Math.abs(sessionsB - sessionsA)} session difference and {Math.abs(purchasesB - purchasesA)} purchase difference between the two user profiles.
            </div>
          </div>

          {/* Finding 5: Most Important Observation */}
          <div className="flex items-start gap-3 p-3 bg-console-bg/60 rounded-sm border border-console-border-light text-xs">
            <span className="console-mono text-[10px] font-bold bg-console-accent text-white px-2 py-0.5 rounded-sm shrink-0">
              5. KEY OBSERVATION
            </span>
            <div className="text-console-text-main leading-relaxed font-medium">
              {isRetainedA !== isRetainedB ? (
                <>
                  This comparison clearly establishes the model's tipping threshold: achieving repeated browsing across multiple distinct calendar days with confirmed checkout intent is what successfully drives users past the decision boundary into the returning cohort.
                </>
              ) : isRetainedA ? (
                <>
                  Both profiles remain classified as returning users; behavioral intensity differences primarily affect their distance margin from the boundary rather than shifting their macro-classification.
                </>
              ) : (
                <>
                  Even with localized variations in views or cart items, both profiles stay classified as disengaged because neither achieved the requisite session density (&gt;3 sessions) and active days threshold to signal habitual return behavior.
                </>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ------------------------------------------------------------
// 4. MAIN ANALYZE USER WORKSPACE COMPONENT
// ------------------------------------------------------------
export default function AnalyzeUser() {
  const [compareMode, setCompareMode] = useState(false);

  // Form states supporting true empty strings
  const [formDataA, setFormDataA] = useState<BehaviorFormState>(
    valuesToFormState(PREDEFINED_SCENARIOS[0].values)
  );
  const [formDataB, setFormDataB] = useState<BehaviorFormState>(
    valuesToFormState(PREDEFINED_SCENARIOS[1].values)
  );

  const [selectedScenarioA, setSelectedScenarioA] = useState<string>('normal');
  const [selectedScenarioB, setSelectedScenarioB] = useState<string>('engaged');

  const [highlightFieldsA, setHighlightFieldsA] = useState(false);
  const [highlightFieldsB, setHighlightFieldsB] = useState(false);

  const [validationErrorA, setValidationErrorA] = useState<string | null>(null);
  const [validationErrorB, setValidationErrorB] = useState<string | null>(null);

  const [resultA, setResultA] = useState<PredictionResponse | null>(null);
  const [resultB, setResultB] = useState<PredictionResponse | null>(null);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  // Validation function
  const validateForm = (form: BehaviorFormState): { valid: boolean; data?: PredictionRequest; error?: string } => {
    for (const field of inputFields) {
      const val = form[field.name]?.trim();
      if (val === '' || val === undefined) {
        return {
          valid: false,
          error: `Please provide a value for "${field.label}". Input fields cannot remain empty.`
        };
      }
      const num = parseFloat(val);
      if (isNaN(num)) {
        return {
          valid: false,
          error: `"${field.label}" must be a valid numeric value.`
        };
      }
      if (num < 0) {
        return {
          valid: false,
          error: `"${field.label}" cannot be negative.`
        };
      }
    }
    return {
      valid: true,
      data: {
        total_views: parseFloat(form.total_views),
        total_carts: parseFloat(form.total_carts),
        total_purchases: parseFloat(form.total_purchases),
        total_removes: parseFloat(form.total_removes),
        total_sessions: parseFloat(form.total_sessions),
        active_days: parseFloat(form.active_days),
        activity_duration_days: parseFloat(form.activity_duration_days),
      }
    };
  };

  const runPrediction = async (
    formId: 'A' | 'B',
    formState: BehaviorFormState
  ) => {
    const setError = formId === 'A' ? setErrorA : setErrorB;
    const setLoading = formId === 'A' ? setLoadingA : setLoadingB;
    const setResult = formId === 'A' ? setResultA : setResultB;
    const setValidation = formId === 'A' ? setValidationErrorA : setValidationErrorB;

    setValidation(null);
    setError(null);

    const validation = validateForm(formState);
    if (!validation.valid || !validation.data) {
      setValidation(validation.error || 'Please check your inputs.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.predictUser(validation.data);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute prediction engine.');
    } finally {
      setLoading(false);
    }
  };

  const runFullComparison = async () => {
    runPrediction('A', formDataA);
    runPrediction('B', formDataB);
  };

  const handleInputChange = (formId: 'A' | 'B', fieldName: keyof BehaviorFormState, value: string) => {
    if (formId === 'A') {
      setFormDataA((prev) => ({ ...prev, [fieldName]: value }));
      setSelectedScenarioA('custom');
      if (validationErrorA) setValidationErrorA(null);
    } else {
      setFormDataB((prev) => ({ ...prev, [fieldName]: value }));
      setSelectedScenarioB('custom');
      if (validationErrorB) setValidationErrorB(null);
    }
  };

  const adjustValue = (formId: 'A' | 'B', fieldName: keyof BehaviorFormState, delta: number) => {
    const currentForm = formId === 'A' ? formDataA : formDataB;
    const raw = currentForm[fieldName]?.trim();
    const currentVal = raw === '' ? 0 : parseFloat(raw);
    const isDecimal = fieldName === 'activity_duration_days';
    let newVal = Math.max(0, currentVal + delta);
    if (isDecimal) {
      newVal = Math.round(newVal * 10) / 10;
    } else {
      newVal = Math.round(newVal);
    }
    handleInputChange(formId, fieldName, newVal.toString());
  };

  const loadScenario = (scenarioId: string, formId: 'A' | 'B' = 'A') => {
    const scenario = PREDEFINED_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    if (scenarioId === 'custom') {
      if (formId === 'A') {
        setFormDataA(emptyFormState());
        setSelectedScenarioA('custom');
        setValidationErrorA(null);
      } else {
        setFormDataB(emptyFormState());
        setSelectedScenarioB('custom');
        setValidationErrorB(null);
      }
      return;
    }

    const newValues = valuesToFormState(scenario.values);
    if (formId === 'A') {
      setFormDataA(newValues);
      setSelectedScenarioA(scenarioId);
      setValidationErrorA(null);
      setHighlightFieldsA(true);
      setTimeout(() => setHighlightFieldsA(false), 900);
    } else {
      setFormDataB(newValues);
      setSelectedScenarioB(scenarioId);
      setValidationErrorB(null);
      setHighlightFieldsB(true);
      setTimeout(() => setHighlightFieldsB(false), 900);
    }
  };

  const getActiveScenarioObj = (id: string) => {
    return PREDEFINED_SCENARIOS.find((s) => s.id === id) || PREDEFINED_SCENARIOS[PREDEFINED_SCENARIOS.length - 1];
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-console-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-console-text-main mb-1 uppercase">
            User Analysis & Decision Workspace
          </h1>
          <p className="console-header text-console-text-muted">
            {compareMode 
              ? 'SIDE-BY-SIDE SCENARIO-TO-SCENARIO ANALYTICAL COMPARISON LAB' 
              : 'BEHAVIOR SIMULATION, CHURN PREDICTION & RETENTION STRATEGY LAB'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCompareMode(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors border ${
              !compareMode 
                ? 'bg-console-text-main text-console-surface border-console-text-main shadow-sm' 
                : 'bg-console-surface text-console-text-main border-console-border hover:bg-console-bg'
            }`}
          >
            SINGLE QUERY
          </button>
          <button 
            onClick={() => setCompareMode(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors border ${
              compareMode 
                ? 'bg-console-text-main text-console-surface border-console-text-main shadow-sm' 
                : 'bg-console-surface text-console-text-main border-console-border hover:bg-console-bg'
            }`}
          >
            COMPARE SCENARIOS
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: SINGLE QUERY (BEHAVIOR INPUT + RESULTS + RECOMMENDATIONS) */}
      {/* ============================================================ */}
      {!compareMode ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: BEHAVIOR INPUT ONLY */}
            <div className="lg:col-span-5">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  runPrediction('A', formDataA);
                }} 
                className="console-panel flex flex-col relative"
              >
                <div className="border-b border-console-border p-3 bg-console-bg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="console-header text-console-text-main font-bold">BEHAVIOR INPUT</p>
                    <span className="console-mono text-[10px] text-console-text-muted bg-console-surface px-1.5 py-0.5 rounded-sm border border-console-border-light">
                      {getActiveScenarioObj(selectedScenarioA).name}
                    </span>
                  </div>
                </div>

                {/* Compact Predefined Scenarios Toolbar */}
                <div className="p-3 bg-console-bg/50 border-b border-console-border-light">
                  <div className="flex items-center justify-between mb-2">
                    <span className="console-header text-[10px] text-console-text-faint font-semibold">
                      BENCHMARK PERSONAS:
                    </span>
                    <span className="text-[10px] console-mono text-console-text-muted">
                      {getActiveScenarioObj(selectedScenarioA).tag}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {PREDEFINED_SCENARIOS.map((scen) => {
                      const isSelected = selectedScenarioA === scen.id;
                      return (
                        <button
                          key={scen.id}
                          type="button"
                          onClick={() => loadScenario(scen.id, 'A')}
                          className={`px-2 py-1 text-center rounded-sm transition-all border text-[11px] font-medium truncate ${
                            isSelected
                              ? 'bg-console-text-main text-console-surface border-console-text-main font-bold shadow-sm'
                              : 'bg-console-surface hover:bg-console-bg text-console-text-main border-console-border hover:border-console-text-muted'
                          }`}
                          title={scen.description}
                        >
                          {scen.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Input Table (7 Fields) */}
                <div className="p-0">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-console-border-light">
                      {inputFields.map((field) => {
                        const isHighlighted = highlightFieldsA;
                        const val = formDataA[field.name];
                        return (
                          <tr 
                            key={field.name} 
                            className={`transition-colors hover:bg-console-bg ${
                              isHighlighted ? 'bg-console-accent/5' : ''
                            }`}
                          >
                            <td className="py-2 px-4 w-1/2 relative group">
                              <div className="flex items-center cursor-help w-fit">
                                <span className="font-medium text-console-text-main text-xs sm:text-sm">{field.label}</span>
                                <span className="ml-2 w-3.5 h-3.5 rounded-full border border-console-border text-console-text-muted flex items-center justify-center text-[9px] font-bold group-hover:border-console-accent group-hover:text-console-accent transition-colors">?</span>
                              </div>
                              <div className="absolute left-4 top-8 w-52 bg-console-text-main text-console-surface text-xs p-2.5 z-50 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 shadow-lg border-l-2 border-console-accent pointer-events-none rounded-sm">
                                <p className="font-semibold mb-0.5">{field.label}</p>
                                <p className="text-[11px] text-console-surface/90">{field.desc}</p>
                              </div>
                            </td>
                            <td className="py-1 px-4 w-1/2">
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  name={field.name}
                                  value={val}
                                  onChange={(e) => handleInputChange('A', field.name, e.target.value)}
                                  min="0"
                                  step={field.step}
                                  placeholder="Empty"
                                  className={`w-full bg-console-surface border px-2.5 py-1 console-mono text-sm text-console-text-main placeholder-console-text-faint focus:outline-none focus:border-console-accent focus:ring-1 focus:ring-console-accent transition-all rounded-sm ${
                                    val === '' ? 'border-dashed border-console-border' : 'border-console-border'
                                  }`}
                                />
                                <div className="flex flex-col shrink-0">
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => adjustValue('A', field.name, field.step === '0.1' ? 0.1 : 1)}
                                    className="w-5 h-4 bg-console-bg hover:bg-console-surface-hover border border-console-border rounded-t-sm flex items-center justify-center text-[9px] text-console-text-muted hover:text-console-accent"
                                    title="Increment"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => adjustValue('A', field.name, field.step === '0.1' ? -0.1 : -1)}
                                    className="w-5 h-4 bg-console-bg hover:bg-console-surface-hover border-x border-b border-console-border rounded-b-sm flex items-center justify-center text-[9px] text-console-text-muted hover:text-console-accent"
                                    title="Decrement"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {validationErrorA && (
                  <div className="mx-4 mt-3 p-2.5 bg-console-amber/10 border border-console-amber/30 text-console-amber text-xs rounded-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span>{validationErrorA}</span>
                  </div>
                )}

                <div className="p-4 border-t border-console-border bg-console-bg flex items-center gap-3">
                  <button 
                    type="submit" 
                    disabled={loadingA}
                    className="flex-1 bg-console-accent hover:bg-console-accent-hover text-white font-bold py-2.5 px-4 rounded-sm transition-colors disabled:opacity-50 text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loadingA ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Executing Query...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Run Prediction
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => loadScenario('custom', 'A')}
                    className="px-4 py-2.5 text-xs font-semibold bg-console-surface hover:bg-console-bg border border-console-border text-console-text-muted hover:text-console-text-main rounded-sm transition-colors"
                    title="Clear all fields to type from scratch"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: PREDICTION RESULTS (THE ONLY PREDICTION OUTPUT SECTION) */}
            <div className="lg:col-span-7">
              {loadingA && <PageSkeleton />}
              
              {errorA && (
                <ErrorDisplay message={errorA} onRetry={() => runPrediction('A', formDataA)} />
              )}

              {resultA && !loadingA && (
                <ConsolidatedPredictionResults 
                  result={resultA} 
                  formValues={formDataA} 
                />
              )}

              {!resultA && !loadingA && !errorA && (
                <div className="console-panel flex flex-col items-center justify-center p-12 text-center border-dashed border-2 min-h-[460px]">
                  <div className="w-12 h-12 rounded-full bg-console-bg border border-console-border flex items-center justify-center mb-4 text-console-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                  </div>
                  <p className="console-header text-console-text-main text-sm font-bold mb-1">
                    PREDICTION ENGINE READY
                  </p>
                  <p className="text-xs text-console-text-muted max-w-md leading-relaxed mb-4">
                    Select a persona on the left (e.g. <em>Normal User</em>, <em>High-Value VIP</em>, <em>At-Risk</em>) or enter custom parameters, then click <strong>Run Prediction</strong> to generate results.
                  </p>
                  <button
                    onClick={() => runPrediction('A', formDataA)}
                    className="px-4 py-2 bg-console-accent hover:bg-console-accent-hover text-white text-xs font-bold rounded-sm transition-colors uppercase tracking-wider shadow-sm"
                  >
                    Run Prediction with Selected Scenario
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* SEPARATE RECOMMENDED ACTIONS SECTION (BELOW THE 2 COLUMNS IN SINGLE MODE ONLY) */}
          <SeparateRecommendedActionsSection 
            result={resultA} 
            formValues={formDataA} 
          />
        </>
      ) : (
        /* ============================================================ */
        /* MODE 2: ACTUAL SCENARIO-TO-SCENARIO ANALYTICAL COMPARISON     */
        /* (STRICTLY NO IMPROVEMENT SUGGESTIONS - PURE DATA ANALYTICS)  */
        /* ============================================================ */
        <div className="space-y-6">
          
          {/* Top Control Bar: Compare Run CTA & Scenario Selection */}
          <div className="console-panel p-4 bg-console-surface border-console-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="console-header text-console-accent font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                SCENARIO ANALYTICAL BENCHMARK
              </p>
              <p className="text-xs text-console-text-muted mt-0.5">
                Configure both customer personas below and evaluate how behavior differences impact the ML prediction hyperplane.
              </p>
            </div>

            <button
              onClick={runFullComparison}
              disabled={loadingA || loadingB}
              className="px-5 py-2.5 bg-console-accent hover:bg-console-accent-hover text-white text-xs font-bold rounded-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              {loadingA || loadingB ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Comparing Models...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Evaluate Both Scenarios
                </>
              )}
            </button>
          </div>

          {/* Side-by-Side Input Config Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* SCENARIO A CONFIG */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                runPrediction('A', formDataA);
              }} 
              className="console-panel flex flex-col relative"
            >
              <div className="border-b border-console-border p-3 bg-console-bg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-console-accent rounded-sm inline-block"></span>
                  <p className="console-header text-console-text-main font-bold">SCENARIO A INPUT</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="console-header text-[9px] text-console-text-faint">PRESET:</span>
                  <select 
                    value={selectedScenarioA}
                    onChange={(e) => loadScenario(e.target.value, 'A')} 
                    className="text-xs bg-console-surface border border-console-border text-console-text-main cursor-pointer outline-none font-mono py-0.5 px-2 rounded-sm"
                  >
                    {PREDEFINED_SCENARIOS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-0">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-console-border-light">
                    {inputFields.map((field) => (
                      <tr key={field.name} className={`transition-colors hover:bg-console-bg ${highlightFieldsA ? 'bg-console-accent/5' : ''}`}>
                        <td className="py-2 px-3 w-1/2">
                          <span className="font-medium text-console-text-main">{field.label}</span>
                        </td>
                        <td className="py-1 px-3 w-1/2">
                          <input
                            type="number"
                            name={field.name}
                            value={formDataA[field.name]}
                            onChange={(e) => handleInputChange('A', field.name, e.target.value)}
                            min="0"
                            step={field.step}
                            placeholder="Empty"
                            className="w-full bg-console-surface border border-console-border px-2 py-1 console-mono text-xs focus:outline-none focus:border-console-accent rounded-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validationErrorA && (
                <div className="mx-3 mt-2 p-2 bg-console-amber/10 border border-console-amber/30 text-console-amber text-xs rounded-sm">
                  {validationErrorA}
                </div>
              )}

              <div className="p-3 border-t border-console-border bg-console-bg flex items-center justify-between">
                <button 
                  type="submit" 
                  disabled={loadingA}
                  className="w-full bg-console-accent hover:bg-console-accent-hover text-white font-bold py-1.5 px-3 rounded-sm transition-colors text-xs uppercase"
                >
                  {loadingA ? 'Evaluating...' : 'Run Scenario A Only'}
                </button>
              </div>
            </form>

            {/* SCENARIO B CONFIG */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                runPrediction('B', formDataB);
              }} 
              className="console-panel flex flex-col relative"
            >
              <div className="border-b border-console-border p-3 bg-console-bg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-console-green rounded-sm inline-block"></span>
                  <p className="console-header text-console-text-main font-bold">SCENARIO B INPUT</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="console-header text-[9px] text-console-text-faint">PRESET:</span>
                  <select 
                    value={selectedScenarioB}
                    onChange={(e) => loadScenario(e.target.value, 'B')} 
                    className="text-xs bg-console-surface border border-console-border text-console-text-main cursor-pointer outline-none font-mono py-0.5 px-2 rounded-sm"
                  >
                    {PREDEFINED_SCENARIOS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-0">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-console-border-light">
                    {inputFields.map((field) => (
                      <tr key={field.name} className={`transition-colors hover:bg-console-bg ${highlightFieldsB ? 'bg-console-accent/5' : ''}`}>
                        <td className="py-2 px-3 w-1/2">
                          <span className="font-medium text-console-text-main">{field.label}</span>
                        </td>
                        <td className="py-1 px-3 w-1/2">
                          <input
                            type="number"
                            name={field.name}
                            value={formDataB[field.name]}
                            onChange={(e) => handleInputChange('B', field.name, e.target.value)}
                            min="0"
                            step={field.step}
                            placeholder="Empty"
                            className="w-full bg-console-surface border border-console-border px-2 py-1 console-mono text-xs focus:outline-none focus:border-console-accent rounded-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validationErrorB && (
                <div className="mx-3 mt-2 p-2 bg-console-amber/10 border border-console-amber/30 text-console-amber text-xs rounded-sm">
                  {validationErrorB}
                </div>
              )}

              <div className="p-3 border-t border-console-border bg-console-bg flex items-center justify-between">
                <button 
                  type="submit" 
                  disabled={loadingB}
                  className="w-full bg-console-green hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-sm transition-colors text-xs uppercase"
                >
                  {loadingB ? 'Evaluating...' : 'Run Scenario B Only'}
                </button>
              </div>
            </form>

          </div>

          {/* Loading or Error States for comparison */}
          {(loadingA || loadingB) && <PageSkeleton />}
          {errorA && <ErrorDisplay message={`Scenario A: ${errorA}`} onRetry={() => runPrediction('A', formDataA)} />}
          {errorB && <ErrorDisplay message={`Scenario B: ${errorB}`} onRetry={() => runPrediction('B', formDataB)} />}

          {/* ACTUAL ANALYTICAL COMPARISON DASHBOARD */}
          <AnalyticalScenarioComparison 
            formValuesA={formDataA}
            formValuesB={formDataB}
            resultA={resultA}
            resultB={resultB}
            scenarioNameA={getActiveScenarioObj(selectedScenarioA).name}
            scenarioNameB={getActiveScenarioObj(selectedScenarioB).name}
          />

        </div>
      )}

    </div>
  );
}
