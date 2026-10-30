import { useState } from 'react';
import { api } from '../api/client';
import type { PredictionRequest, PredictionResponse } from '../api/types';

interface SensitivityExplorerProps {
  baseInputs: PredictionRequest;
  baseResult: PredictionResponse;
}

export default function SensitivityExplorer({
  baseInputs,
  baseResult,
}: SensitivityExplorerProps) {
  // Modified state initialized to baseInputs
  const [modifiedInputs, setModifiedInputs] = useState<PredictionRequest>({ ...baseInputs });
  const [simResult, setSimResult] = useState<PredictionResponse>(baseResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compare original vs modified
  const baseScore = baseResult.prediction.decision_score;
  const simScore = simResult.prediction.decision_score;
  const scoreShift = simScore - baseScore;

  const baseRetained = baseResult.prediction.retained === 1;
  const simRetained = simResult.prediction.retained === 1;
  const hasVerdictFlipped = baseRetained !== simRetained;

  // Run real inference for the modified features
  const applySimulation = async (updated: PredictionRequest) => {
    setModifiedInputs(updated);
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictUser(updated);
      setSimResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation query failed');
    } finally {
      setLoading(false);
    }
  };

  // Preset delta simulations
  const quickDelta = (deltas: Partial<PredictionRequest>) => {
    const updated: PredictionRequest = {
      total_views: Math.max(0, (modifiedInputs.total_views ?? 0) + (deltas.total_views ?? 0)),
      total_carts: Math.max(0, (modifiedInputs.total_carts ?? 0) + (deltas.total_carts ?? 0)),
      total_purchases: Math.max(0, (modifiedInputs.total_purchases ?? 0) + (deltas.total_purchases ?? 0)),
      total_removes: Math.max(0, (modifiedInputs.total_removes ?? 0) + (deltas.total_removes ?? 0)),
      total_sessions: Math.max(0, (modifiedInputs.total_sessions ?? 0) + (deltas.total_sessions ?? 0)),
      active_days: Math.max(0, (modifiedInputs.active_days ?? 0) + (deltas.active_days ?? 0)),
      activity_duration_days: Math.max(0, Math.round(((modifiedInputs.activity_duration_days ?? 0) + (deltas.activity_duration_days ?? 0)) * 10) / 10),
    };
    applySimulation(updated);
  };

  const resetSimulation = () => {
    setModifiedInputs({ ...baseInputs });
    setSimResult(baseResult);
    setError(null);
  };

  // Feature diffs
  const diffs = [
    { label: 'Sessions', key: 'total_sessions' as const, base: baseInputs.total_sessions, mod: modifiedInputs.total_sessions },
    { label: 'Purchases', key: 'total_purchases' as const, base: baseInputs.total_purchases, mod: modifiedInputs.total_purchases },
    { label: 'Views', key: 'total_views' as const, base: baseInputs.total_views, mod: modifiedInputs.total_views },
    { label: 'Carts', key: 'total_carts' as const, base: baseInputs.total_carts, mod: modifiedInputs.total_carts },
    { label: 'Active Days', key: 'active_days' as const, base: baseInputs.active_days, mod: modifiedInputs.active_days },
    { label: 'Removes', key: 'total_removes' as const, base: baseInputs.total_removes, mod: modifiedInputs.total_removes },
  ].filter(d => d.base !== d.mod);

  // Position on a visual scale between -2.0 and +2.0
  const clampPercent = (score: number) => {
    const min = -2.0;
    const max = 2.0;
    const clamped = Math.max(min, Math.min(max, score));
    return ((clamped - min) / (max - min)) * 100;
  };

  const basePercent = clampPercent(baseScore);
  const simPercent = clampPercent(simScore);

  return (
    <div className="p-4 bg-console-bg/50 border border-console-border rounded-sm space-y-4">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-console-border-light gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="console-mono text-[9px] font-bold bg-console-accent text-white px-1.5 py-0.5 rounded-sm">
              SVM MARGIN
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wide text-console-text-main flex items-center gap-1.5">
              SENSITIVITY ANALYSIS & TIPPING-POINT EXPLORER
            </h4>
          </div>
          <p className="text-[11px] text-console-text-muted mt-0.5">
            Interactively simulate behavioral changes to discover the tipping threshold required to cross the linear SVM decision boundary.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="text-[10px] font-mono px-2 py-1 rounded-sm border border-console-border bg-console-surface hover:bg-console-bg text-console-text-muted hover:text-console-text-main transition-colors self-start sm:self-auto"
        >
          Reset Simulation
        </button>
      </div>

      {/* Quick Action Simulation Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="console-header text-[9px] text-console-text-faint">SIMULATE BEHAVIOR:</span>
        
        <button
          onClick={() => quickDelta({ total_sessions: 1, active_days: 1 })}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono font-medium border border-console-border bg-console-surface hover:border-console-accent text-console-text-main hover:text-console-accent rounded-sm transition-colors flex items-center gap-1"
        >
          <span>+1 Session & Day</span>
        </button>

        <button
          onClick={() => quickDelta({ total_purchases: 1, total_carts: 1 })}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono font-medium border border-console-border bg-console-surface hover:border-console-green text-console-text-main hover:text-console-green rounded-sm transition-colors flex items-center gap-1"
        >
          <span>+1 Purchase</span>
        </button>

        <button
          onClick={() => quickDelta({ total_views: 5, total_carts: 2 })}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono font-medium border border-console-border bg-console-surface hover:border-console-accent text-console-text-main hover:text-console-accent rounded-sm transition-colors flex items-center gap-1"
        >
          <span>+5 Views & 2 Carts</span>
        </button>

        <button
          onClick={() => quickDelta({ total_removes: 2 })}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono font-medium border border-console-border bg-console-surface hover:border-console-red text-console-text-main hover:text-console-red rounded-sm transition-colors flex items-center gap-1"
        >
          <span>+2 Cart Removes</span>
        </button>
      </div>

      {/* Visual SVM Decision Boundary Gauge */}
      <div className="p-3 bg-console-surface border border-console-border-light rounded-sm space-y-2">
        <div className="flex justify-between items-center text-[10px] console-header">
          <span className="text-console-red font-bold">AT-RISK / DISENGAGE (&lt; 0.0)</span>
          <span className="text-console-text-main font-mono bg-console-bg px-2 py-0.5 border border-console-border rounded-sm">
            DECISION BOUNDARY: 0.0000
          </span>
          <span className="text-console-green font-bold">PREDICTED TO RETURN (&gt; 0.0)</span>
        </div>

        {/* Boundary Scale */}
        <div className="relative w-full h-5 bg-console-bg rounded-sm border border-console-border overflow-hidden">
          {/* Negative & Positive Zones */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-console-red/10 border-r border-console-border border-dashed"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-console-green/10"></div>
          
          {/* 0.0 Center Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-console-text-main z-10" title="SVM Decision Threshold (0.0)"></div>

          {/* Original Base Marker */}
          <div
            className="absolute top-1 bottom-1 w-2.5 bg-console-text-faint border border-console-text-main rounded-xs z-20 transition-all duration-300"
            style={{ left: `calc(${basePercent}% - 5px)` }}
            title={`Original Decision Score: ${baseScore.toFixed(4)}`}
          ></div>

          {/* Simulated Active Marker */}
          <div
            className={`absolute top-0.5 bottom-0.5 w-3.5 border-2 rounded-xs z-30 transition-all duration-300 ${
              simRetained ? 'bg-console-green border-white' : 'bg-console-red border-white'
            }`}
            style={{ left: `calc(${simPercent}% - 7px)` }}
            title={`Simulated Decision Score: ${simScore.toFixed(4)}`}
          ></div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] console-mono text-console-text-muted">
          <span>-2.0</span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-console-text-faint rounded-xs"></span>
              Base: {baseScore > 0 ? `+${baseScore.toFixed(4)}` : baseScore.toFixed(4)}
            </span>
            <span className="flex items-center gap-1 font-bold">
              <span className={`w-2 h-2 rounded-xs ${simRetained ? 'bg-console-green' : 'bg-console-red'}`}></span>
              Simulated: {simScore > 0 ? `+${simScore.toFixed(4)}` : simScore.toFixed(4)}
            </span>
          </div>
          <span>+2.0</span>
        </div>
      </div>

      {/* Side-by-Side Decision Score Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Original */}
        <div className="p-3 bg-console-surface border border-console-border-light rounded-sm">
          <span className="console-header block text-[9px] text-console-text-faint">ORIGINAL SCORE</span>
          <span className="console-mono text-base font-bold text-console-text-main">
            {baseScore > 0 ? `+${baseScore.toFixed(4)}` : baseScore.toFixed(4)}
          </span>
          <span className={`block text-[10px] font-bold uppercase mt-0.5 ${baseRetained ? 'text-console-green' : 'text-console-red'}`}>
            {baseResult.prediction.verdict}
          </span>
        </div>

        {/* Simulated Result */}
        <div className="p-3 bg-console-surface border border-console-border-light rounded-sm">
          <span className="console-header block text-[9px] text-console-accent font-bold">SIMULATED SCORE</span>
          <span className="console-mono text-base font-bold text-console-text-main">
            {simScore > 0 ? `+${simScore.toFixed(4)}` : simScore.toFixed(4)}
          </span>
          <span className={`block text-[10px] font-bold uppercase mt-0.5 ${simRetained ? 'text-console-green' : 'text-console-red'}`}>
            {simResult.prediction.verdict}
          </span>
        </div>

        {/* Hyperplane Margin Shift */}
        <div className="p-3 bg-console-surface border border-console-border-light rounded-sm">
          <span className="console-header block text-[9px] text-console-text-faint">MARGIN SHIFT (Δ)</span>
          <span className={`console-mono text-base font-bold ${scoreShift > 0 ? 'text-console-green' : scoreShift < 0 ? 'text-console-red' : 'text-console-text-main'}`}>
            {scoreShift > 0 ? `+${scoreShift.toFixed(4)}` : scoreShift.toFixed(4)}
          </span>
          <span className="block text-[10px] text-console-text-muted mt-0.5 font-mono">
            {hasVerdictFlipped ? '★ THRESHOLD CROSSED' : 'SAME CLASSIFICATION'}
          </span>
        </div>

      </div>

      {/* Analytical Findings Banner */}
      <div className={`p-3 rounded-sm border text-xs leading-relaxed ${
        hasVerdictFlipped
          ? 'bg-console-green/10 border-console-green/30 text-console-text-main'
          : 'bg-console-bg border-console-border text-console-text-muted'
      }`}>
        {loading ? (
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 border-2 border-console-accent border-t-transparent rounded-full animate-spin"></span>
            <span>Running inference through Linear SVM endpoint...</span>
          </div>
        ) : hasVerdictFlipped ? (
          <div>
            <strong className="text-console-green font-bold">Tipping Point Achieved! </strong>
            The simulated behavioral adjustments shifted the SVM decision score across the 0.0 boundary (from {baseScore.toFixed(4)} to {simScore.toFixed(4)}). 
            The customer transitioned from <span className="font-semibold underline">{baseResult.prediction.verdict}</span> to <span className="font-semibold underline text-console-green">{simResult.prediction.verdict}</span>.
          </div>
        ) : (
          <div>
            <strong className="text-console-text-main font-semibold">Classification Unchanged: </strong>
            {diffs.length > 0 ? (
              <>
                The simulated changes ({diffs.map(d => `${d.label}: ${d.base} → ${d.mod}`).join(', ')}) produced a score delta of {scoreShift > 0 ? `+${scoreShift.toFixed(4)}` : scoreShift.toFixed(4)}, but this was <span className="font-semibold text-console-amber">insufficient to cross the 0.0 decision threshold</span>. The customer remains {simResult.prediction.verdict}.
              </>
            ) : (
              <>
                Simulate actions using the buttons above to test feature sensitivity against the Linear SVM separating hyperplane.
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 bg-console-red/10 border border-console-red/30 text-console-red text-xs rounded-sm">
          {error}
        </div>
      )}
    </div>
  );
}
