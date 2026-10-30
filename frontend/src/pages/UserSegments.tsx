import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { StatsResponse, PcaSampleResponse } from '../api/types';
import { PageSkeleton } from '../components/Skeleton';
import ErrorDisplay from '../components/ErrorDisplay';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const PcaTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isEngaged = data.segment === 'engaged';
    return (
      <div className="bg-console-surface border border-console-border p-3 shadow-lg max-w-[220px] z-50">
        <p className={`console-header mb-1 ${isEngaged ? 'text-console-accent' : 'text-console-text-faint'}`}>
          {isEngaged ? 'HIGHLY ENGAGED' : 'CASUAL EXPLORER'}
        </p>
        <p className="text-xs text-console-text-main mb-2 leading-relaxed">
          {isEngaged 
            ? 'Deep interaction pattern. High intent to return and purchase.' 
            : 'Shallow interaction pattern. Likely to churn after a single session.'}
        </p>
        <div className="console-mono text-[10px] text-console-text-muted border-t border-console-border-light pt-2 flex justify-between">
          <span>PC1: {data.x.toFixed(2)}</span>
          <span>PC2: {data.y.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function UserSegments() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [pcaData, setPcaData] = useState<PcaSampleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, pcaResponse] = await Promise.all([
        api.getStats(),
        api.getPcaSample()
      ]);
      setStats(statsData);
      setPcaData(pcaResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch segment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-4 lg:p-8"><PageSkeleton /></div>;
  if (error) return <div className="p-4 lg:p-8 flex items-center justify-center min-h-[60vh]"><ErrorDisplay message={error} onRetry={fetchData} /></div>;
  if (!stats || !pcaData) return null;

  const casual = stats.segments.find(s => s.key === 'casual');
  const engaged = stats.segments.find(s => s.key === 'engaged');
  
  // Filter out extreme outliers for a readable visualization scale
  const safeData = pcaData.points.filter(d => Math.abs(d.x) <= 8 && Math.abs(d.y) <= 8);
  const cluster0Data = safeData.filter(d => d.segment === 'casual');
  const cluster1Data = safeData.filter(d => d.segment === 'engaged');

  const comparisonData = [
    { metric: 'Views', casual: 2.86, engaged: 36.02 },
    { metric: 'Sessions', casual: 1.69, engaged: 11.53 },
    { metric: 'Active Days', casual: 1.21, engaged: 4.39 },
    { metric: 'Carts', casual: 1.04, engaged: 28.64 },
    { metric: 'Purchases', casual: 0.17, engaged: 7.85 },
    { metric: 'Removes', casual: 0.49, engaged: 25.38 },
  ];

  return (
    <div className="space-y-8">
      
      <div className="border-b border-console-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-console-text-main mb-1 uppercase">Segmentation</h1>
        <p className="console-header text-console-text-muted">K-MEANS BEHAVIORAL CLUSTERING</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {casual && (
          <div className="console-panel p-6 border-l-4 border-l-console-text-muted transition-colors hover:bg-console-bg/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="console-header text-console-text-main mb-1">SEGMENT 0</p>
                <h2 className="text-xl font-bold uppercase">{casual.label}</h2>
              </div>
              <span className="bg-console-bg border border-console-border px-2 py-1 text-xs font-mono rounded-sm">{casual.pct}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-console-border-light pt-4">
              <div>
                <span className="console-header block text-console-text-faint mb-1">POPULATION</span>
                <span className="console-mono font-bold text-lg">{casual.size.toLocaleString()}</span>
              </div>
              <div>
                <span className="console-header block text-console-text-faint mb-1">RETENTION</span>
                <span className="console-mono font-bold text-lg text-console-amber">{(casual.retention_rate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {engaged && (
          <div className="console-panel p-6 border-l-4 border-l-console-accent bg-console-text-main text-console-surface transition-colors hover:bg-console-text-main/95">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="console-header text-console-text-faint mb-1">SEGMENT 1</p>
                <h2 className="text-xl font-bold uppercase text-console-accent">{engaged.label}</h2>
              </div>
              <span className="bg-console-surface text-console-text-main px-2 py-1 text-xs font-mono rounded-sm">{engaged.pct}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-console-text-muted pt-4">
              <div>
                <span className="console-header block text-console-text-faint mb-1">POPULATION</span>
                <span className="console-mono font-bold text-lg">{engaged.size.toLocaleString()}</span>
              </div>
              <div>
                <span className="console-header block text-console-text-faint mb-1">RETENTION</span>
                <span className="console-mono font-bold text-lg text-console-green">{(engaged.retention_rate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PCA MAP */}
        <div className="lg:col-span-8">
          <div className="console-panel flex flex-col h-full group relative cursor-help">
            <div className="border-b border-console-border p-3 bg-console-bg flex flex-wrap gap-2 justify-between items-center">
              <p className="console-header flex items-center text-console-text-main">
                BEHAVIORAL SPACE MAP (PCA)
                <span className="ml-2 w-4 h-4 rounded-full border border-console-border text-console-text-muted flex items-center justify-center text-[10px] font-bold">?</span>
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-[10px] bg-console-accent text-white px-1.5 py-0.5 rounded-sm font-semibold animate-pulse mr-4">HOVER DOTS FOR INFO</span>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-console-text-faint rounded-sm mr-1.5 opacity-80 inline-block"></span> CASUAL
                </div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-console-accent rounded-sm mr-1.5 inline-block"></span> ENGAGED
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 min-h-[450px] bg-console-surface relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-console-border-light)" vertical={false} />
                  <XAxis type="number" dataKey="x" hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <YAxis type="number" dataKey="y" hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<PcaTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-console-border)' }} />
                  <Scatter name="Casual Explorer" data={cluster0Data} fill="var(--color-console-text-faint)" opacity={0.5} />
                  <Scatter name="Highly Engaged User" data={cluster1Data} fill="var(--color-console-accent)" opacity={0.9} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-console-border p-3 bg-console-bg flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2">
              <p className="text-xs text-console-text-muted max-w-md">
                PCA is used here for 2D visualization of the behavioral feature space. The first two components explain <span className="font-mono font-bold">{pcaData.explained_variance.total.toFixed(2)}%</span> of total variance.
              </p>
              <div className="console-mono text-[10px] text-console-text-main bg-console-surface border border-console-border-light px-2 py-1 rounded-sm whitespace-nowrap">
                PC1: {pcaData.explained_variance.pc1.toFixed(2)}% | PC2: {pcaData.explained_variance.pc2.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* BEHAVIORAL DIFFERENCE TABLE */}
        <div className="lg:col-span-4">
          <div className="console-panel h-full flex flex-col">
            <div className="border-b border-console-border p-3 bg-console-bg">
              <p className="console-header text-console-text-main">BEHAVIORAL DIFFERENCE</p>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-console-border bg-console-bg">
                    <th className="py-2.5 px-4 text-left console-header">METRIC</th>
                    <th className="py-2.5 px-4 text-right console-header">CASUAL</th>
                    <th className="py-2.5 px-4 text-right console-header text-console-accent">ENGAGED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-console-border-light">
                  {comparisonData.map((stat, i) => (
                    <tr key={i} className="hover:bg-console-bg transition-colors">
                      <td className="py-3 px-4 font-medium text-console-text-main">{stat.metric}</td>
                      <td className="py-3 px-4 text-right console-mono text-console-text-muted">{stat.casual.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right console-mono font-bold text-console-accent">{stat.engaged.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-console-bg/50">
                    <td className="py-3 px-4 font-bold text-console-text-main text-xs uppercase">Retention</td>
                    <td className="py-3 px-4 text-right console-mono font-bold text-console-text-main">7.40%</td>
                    <td className="py-3 px-4 text-right console-mono font-bold text-console-green">39.36%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
