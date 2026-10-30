import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ModelMetricsResponse } from '../api/types';
import { PageSkeleton } from '../components/Skeleton';
import ErrorDisplay from '../components/ErrorDisplay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getModelMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch model metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-4 lg:p-8"><PageSkeleton /></div>;
  if (error) return <div className="p-4 lg:p-8 flex items-center justify-center min-h-[60vh]"><ErrorDisplay message={error} onRetry={fetchData} /></div>;
  if (!metrics) return null;

  const chartData = metrics.models.map(m => ({
    name: m.name.replace(' (Linear)', ''),
    f1: m.f1,
    roc_auc: m.roc_auc,
  }));

  const bestF1 = Math.max(...metrics.models.map(m => m.f1));
  const bestAuc = Math.max(...metrics.models.map(m => m.roc_auc));

  return (
    <div className="space-y-8">
      
      <div className="border-b border-console-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-console-text-main mb-1 uppercase">Model Performance</h1>
        <p className="console-header text-console-text-muted">MODEL BENCHMARK LAB</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SELECTED MODEL */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          <div className="console-panel p-6 border-l-4 border-l-console-accent bg-console-bg flex-1">
            <p className="console-header text-console-text-muted mb-2">SELECTED CLASSIFIER</p>
            <h2 className="text-2xl font-bold text-console-accent mb-6 uppercase">SVM (LINEAR)</h2>
            
            <div className="space-y-4">
              <div className="bg-console-surface border border-console-border p-4 rounded-sm">
                <p className="console-header text-console-text-muted mb-1">DECISION RATIONALE</p>
                <p className="text-sm font-medium text-console-text-main leading-relaxed">
                  Highest F1 Score and ROC-AUC among tested models. Provides robust linear separation for sparse behavioral data while preventing extreme overfitting.
                </p>
              </div>
              
              <div className="bg-console-amber/5 border border-console-amber/20 p-4 rounded-sm border-l-2 border-l-console-amber">
                <p className="console-header text-console-amber mb-1">METRIC CONTEXT</p>
                <p className="text-sm text-console-text-main leading-relaxed">
                  The dataset exhibits a <span className="font-bold">9.19%</span> positive retention rate. Because of this extreme class imbalance, <strong>Accuracy</strong> alone is a misleading metric (a dummy classifier guessing "churn" would achieve 90.81% accuracy). We prioritize <strong>F1 Score</strong> and <strong>ROC-AUC</strong> to ensure the model correctly identifies actual retained users.
                </p>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: BENCHMARK MATRIX & CHART */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* COMPARISON MATRIX */}
          <div className="console-panel overflow-hidden">
            <div className="border-b border-console-border p-3 bg-console-bg">
              <p className="console-header text-console-text-main">EVALUATION METRICS (TEST SET)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-console-border bg-console-bg/50">
                    <th className="py-3 px-4 text-left console-header">MODEL</th>
                    <th className="py-3 px-4 text-right console-header">ACCURACY</th>
                    <th className="py-3 px-4 text-right console-header">PRECISION</th>
                    <th className="py-3 px-4 text-right console-header">RECALL</th>
                    <th className="py-3 px-4 text-right console-header">F1 SCORE</th>
                    <th className="py-3 px-4 text-right console-header">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-console-border-light">
                  {metrics.models.map((model) => {
                    const isSelected = model.name === 'SVM (Linear)';
                    const isBestF1 = model.f1 === bestF1;
                    const isBestAuc = model.roc_auc === bestAuc;
                    
                    return (
                      <tr key={model.name} className={`hover:bg-console-bg transition-colors ${isSelected ? 'bg-console-accent/5' : ''}`}>
                        <td className="py-3 px-4 font-medium text-console-text-main whitespace-nowrap">
                          {model.name}
                          {isSelected && <span className="ml-2 bg-console-accent text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">Selected</span>}
                        </td>
                        <td className="py-3 px-4 text-right console-mono text-console-text-muted">{model.accuracy.toFixed(4)}</td>
                        <td className="py-3 px-4 text-right console-mono text-console-text-muted">{model.precision.toFixed(4)}</td>
                        <td className="py-3 px-4 text-right console-mono text-console-text-muted">{model.recall.toFixed(4)}</td>
                        <td className={`py-3 px-4 text-right console-mono font-bold ${isBestF1 ? 'text-console-accent' : 'text-console-text-main'}`}>
                          {model.f1.toFixed(4)}
                        </td>
                        <td className={`py-3 px-4 text-right console-mono font-bold ${isBestAuc ? 'text-console-accent' : 'text-console-text-main'}`}>
                          {model.roc_auc.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VISUAL CHART */}
          <div className="console-panel">
            <div className="border-b border-console-border p-3 bg-console-bg">
              <p className="console-header text-console-text-main">F1 SCORE & ROC-AUC COMPARISON</p>
            </div>
            <div className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-console-border-light)" />
                  <XAxis dataKey="name" stroke="var(--color-console-text-muted)" tick={{fontSize: 12, fontWeight: 500}} />
                  <YAxis stroke="var(--color-console-text-muted)" domain={[0.4, 1.0]} tick={{fontFamily: 'var(--font-mono)', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'var(--color-console-bg)'}} 
                    contentStyle={{backgroundColor: 'var(--color-console-surface)', border: '1px solid var(--color-console-border)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '11px'}} 
                  />
                  <Legend iconType="square" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Bar dataKey="f1" name="F1 Score" fill="var(--color-console-text-main)" maxBarSize={40} />
                  <Bar dataKey="roc_auc" name="ROC-AUC" fill="var(--color-console-accent)" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
