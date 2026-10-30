import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { StatsResponse, PcaSampleResponse } from '../api/types';
import { PageSkeleton } from '../components/Skeleton';
import ErrorDisplay from '../components/ErrorDisplay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
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
      setError(err.message || 'Failed to fetch dashboard stats.');
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

  const { dataset, segments } = stats;
  const casual = segments.find(s => s.key === 'casual');
  const engaged = segments.find(s => s.key === 'engaged');
  const nonReturned = dataset.users_analyzed - dataset.retained_users;

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
      
      {/* COMPACT KPI STRIP */}
      <div className="flex flex-wrap items-center justify-between border-b border-console-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-console-text-main mb-1 uppercase">Overview</h1>
          <p className="console-header text-console-text-muted">SYSTEM STATUS & KEY METRICS</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className="console-header text-console-text-faint">USERS OBSERVED</span>
            <span className="console-mono text-lg font-semibold">{dataset.users_analyzed.toLocaleString()}</span>
          </div>
          <div className="w-px h-8 bg-console-border hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="console-header text-console-text-faint">RETURNED</span>
            <span className="console-mono text-lg font-semibold">{dataset.retained_users.toLocaleString()}</span>
          </div>
          <div className="w-px h-8 bg-console-border hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="console-header text-console-text-faint">RETENTION</span>
            <span className="console-mono text-lg font-bold text-console-accent">{(dataset.retention_rate * 100).toFixed(2)}%</span>
          </div>
          <div className="w-px h-8 bg-console-border hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="console-header text-console-text-faint">HIGHLY ENGAGED</span>
            <span className="console-mono text-lg font-semibold">{engaged?.size.toLocaleString()}</span>
          </div>
          <div className="w-px h-8 bg-console-border hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="console-header text-console-text-faint">CASUAL</span>
            <span className="console-mono text-lg font-semibold">{casual?.size.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MAIN ANALYTICS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* RETENTION SNAPSHOT */}
          <div className="console-panel">
            <div className="border-b border-console-border p-3 bg-console-bg">
              <p className="console-header text-console-text-main">RETENTION SNAPSHOT</p>
            </div>
            <div className="p-6 md:p-10 flex flex-col sm:flex-row items-center justify-between console-grid relative">
              <div className="text-center z-10 bg-console-surface p-4 border border-console-border w-full sm:w-40 shadow-sm">
                <p className="console-mono text-xl font-bold">{dataset.users_analyzed.toLocaleString()}</p>
                <p className="console-header mt-1 text-console-text-muted">OBSERVED</p>
              </div>

              <div className="flex-1 flex items-center justify-center relative w-full h-12 sm:h-auto my-4 sm:my-0">
                <div className="absolute w-full h-px bg-console-border-light hidden sm:block"></div>
                <div className="z-10 bg-console-bg border border-console-border px-3 py-1 text-[10px] font-mono text-console-text-muted rounded-sm">
                  BEHAVIORAL WINDOW
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full sm:w-40 z-10">
                <div className="text-center bg-console-surface p-3 border-l-2 border-console-accent border-y border-r border-y-console-border border-r-console-border shadow-sm">
                  <p className="console-mono text-lg font-bold text-console-accent">{dataset.retained_users.toLocaleString()}</p>
                  <p className="console-header mt-1 text-console-accent">RETURNED</p>
                </div>
                <div className="text-center bg-console-surface p-3 border border-console-border opacity-70">
                  <p className="console-mono text-base">{nonReturned.toLocaleString()}</p>
                  <p className="console-header mt-1">LOST</p>
                </div>
              </div>
            </div>
          </div>

          {/* BEHAVIORAL SEGMENTATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {casual && (
              <div className="console-panel p-5 border-t-2 border-t-console-border">
                <p className="console-header mb-1 text-console-text-muted">SEGMENT 0</p>
                <h3 className="text-lg font-bold text-console-text-main mb-4 uppercase">{casual.label}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-console-border-light">
                    <span className="text-sm text-console-text-muted">Population</span>
                    <span className="console-mono text-sm">{casual.size.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-console-border-light">
                    <span className="text-sm text-console-text-muted">Share</span>
                    <span className="console-mono text-sm">{casual.pct}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-console-border-light">
                    <span className="text-sm text-console-text-muted">Retention</span>
                    <span className="console-mono text-sm text-console-amber font-semibold">{(casual.retention_rate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-console-text-muted">Avg Views</span>
                    <span className="console-mono text-sm">2.86</span>
                  </div>
                </div>
              </div>
            )}
            
            {engaged && (
              <div className="console-panel p-5 border-t-2 border-t-console-accent">
                <p className="console-header mb-1 text-console-accent">SEGMENT 1</p>
                <h3 className="text-lg font-bold text-console-text-main mb-4 uppercase">{engaged.label}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-console-border-light">
                    <span className="text-sm text-console-text-muted">Population</span>
                    <span className="console-mono text-sm font-semibold">{engaged.size.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-console-border-light">
                    <span className="text-sm text-console-text-muted">Share</span>
                    <span className="console-mono text-sm font-semibold">{engaged.pct}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-console-border-light">
                    <span className="text-sm text-console-text-muted">Retention</span>
                    <span className="console-mono text-sm text-console-accent font-bold">{(engaged.retention_rate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-console-text-muted">Avg Views</span>
                    <span className="console-mono text-sm font-semibold">36.02</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WHAT DIFFERENTIATES RETAINED BEHAVIOR? */}
          <div className="console-panel">
            <div className="border-b border-console-border p-3 bg-console-bg">
              <p className="console-header text-console-text-main">WHAT DIFFERENTIATES RETAINED BEHAVIOR?</p>
            </div>
            <div className="p-4 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="var(--color-console-border-light)" />
                  <XAxis type="number" stroke="var(--color-console-text-muted)" tick={{fontFamily: 'var(--font-mono)', fontSize: 10}} />
                  <YAxis dataKey="metric" type="category" stroke="var(--color-console-text-main)" tick={{fontSize: 12, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'var(--color-console-bg)'}} 
                    contentStyle={{backgroundColor: 'var(--color-console-surface)', border: '1px solid var(--color-console-border)', borderRadius: '2px', fontSize: '12px'}} 
                  />
                  <Legend iconType="square" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Bar dataKey="casual" name="Casual Explorer" fill="var(--color-console-text-faint)" maxBarSize={24} />
                  <Bar dataKey="engaged" name="Highly Engaged User" fill="var(--color-console-accent)" maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: DECISION CENTER & DATA QUALITY */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DECISION CENTER */}
          <div className="console-panel flex flex-col border-l-2 border-l-console-text-main">
            <div className="border-b border-console-border p-3 bg-console-text-main text-console-surface flex items-center justify-between">
              <p className="console-header text-console-surface font-bold">DECISION CENTER</p>
              <div className="w-2 h-2 bg-console-surface rounded-full"></div>
            </div>
            
            <div className="p-5 space-y-6 flex-1 bg-console-surface">
              
              <div>
                <p className="console-header text-console-text-faint mb-1">1. WHAT IS HAPPENING?</p>
                <p className="text-sm font-medium text-console-text-main leading-relaxed">
                  Overall retention is at <span className="font-bold text-console-red">9.19%</span>. A massive drop-off occurs after the first session.
                </p>
              </div>

              <div>
                <p className="console-header text-console-text-faint mb-1">2. WHO IS AFFECTED?</p>
                <p className="text-sm font-medium text-console-text-main leading-relaxed">
                  <span className="font-mono bg-console-bg px-1 border border-console-border rounded-sm">94.41%</span> of the user base falls into the "Casual Explorer" segment, which churns at a 92.6% rate.
                </p>
              </div>

              <div>
                <p className="console-header text-console-text-faint mb-1">3. WHAT SIGNAL MATTERS?</p>
                <p className="text-sm font-medium text-console-text-main leading-relaxed">
                  Highly engaged users average <span className="font-bold text-console-accent">36.02 views</span> and <span className="font-bold text-console-accent">11.53 sessions</span>, strongly associated with their 39.36% retention rate.
                </p>
              </div>

              <div className="pt-4 border-t border-console-border">
                <p className="console-header text-console-accent mb-2">4. WHAT SHOULD THE TEAM DO?</p>
                <p className="text-sm font-bold text-console-text-main leading-relaxed border-l-2 border-console-accent pl-3">
                  Prioritize product interventions that encourage repeat sessions (Day 2/Day 3 return incentives) and deeper interaction during the first session.
                </p>
              </div>
              
            </div>
          </div>

          {/* KEY TAKEAWAYS */}
          <div className="console-panel">
            <div className="border-b border-console-border p-3 bg-console-bg">
              <p className="console-header text-console-text-main">KEY TAKEAWAYS</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent mt-0.5 mr-2 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-sm text-console-text-main">Highly engaged users average <strong className="font-mono">36.02</strong> views vs <strong className="font-mono">2.86</strong>.</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent mt-0.5 mr-2 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-sm text-console-text-main">Highly engaged users average <strong className="font-mono">11.53</strong> sessions vs <strong className="font-mono">1.69</strong>.</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent mt-0.5 mr-2 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-sm text-console-text-main">Highly engaged users average <strong className="font-mono">7.85</strong> purchases vs <strong className="font-mono">0.17</strong>.</p>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-accent mt-0.5 mr-2 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-sm text-console-text-main">Highly engaged users have a <strong className="font-mono text-console-green">{(engaged ? engaged.retention_rate * 100 : 39.36).toFixed(2)}%</strong> retention rate vs <strong className="font-mono text-console-red">{(casual ? casual.retention_rate * 100 : 7.40).toFixed(2)}%</strong>.</p>
              </div>
            </div>
          </div>

          {/* DATA QUALITY & CONTEXT */}
          <div className="console-panel bg-console-bg opacity-80 hover:opacity-100 transition-opacity">
            <div className="border-b border-console-border p-3 flex items-center justify-between">
              <p className="console-header text-console-text-main">DATA QUALITY & CONTEXT</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-console-text-muted"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="console-header text-[10px]">DATASET</span>
                <span className="text-xs font-medium text-right max-w-[150px] truncate" title={dataset.source}>{dataset.source}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="console-header text-[10px]">OBSERVATION</span>
                <span className="text-xs font-mono">{dataset.observation_window}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="console-header text-[10px]">PREDICTION</span>
                <span className="text-xs font-mono">{dataset.prediction_window}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="console-header text-[10px]">FEATURES</span>
                <span className="text-xs font-mono">11 Engineered</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-console-border-light">
                <p className="text-[10px] text-console-amber leading-relaxed font-medium">
                  <span className="font-bold">LIMITATION:</span> The current prototype is trained and evaluated using December 2019 data only. Future production validation requires rolling monthly evaluation.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
