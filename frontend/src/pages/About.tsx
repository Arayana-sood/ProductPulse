export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div className="border-b border-console-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-console-text-main mb-1 uppercase">ProductPulse</h1>
        <p className="console-header text-console-text-muted">PREDICTIVE PRODUCT & USER ANALYTICS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="console-panel p-6 space-y-4">
          <p className="console-header text-console-text-muted border-b border-console-border-light pb-2">WHAT IT DOES</p>
          <p className="text-sm font-medium leading-relaxed text-console-text-main">
            ProductPulse is an enterprise intelligence console designed to bridge the gap between raw behavioral data and actionable product decisions. It identifies high-intent users, predicts churn, segments behavioral patterns, and explains <em>why</em> a user is likely to return.
          </p>
        </div>
        
        <div className="console-panel p-6 space-y-4">
          <p className="console-header text-console-text-muted border-b border-console-border-light pb-2">BUSINESS VALUE</p>
          <p className="text-sm font-medium leading-relaxed text-console-text-main">
            By shifting from reactive metrics (e.g., MAU) to predictive intelligence (e.g., retention probability based on Day 1 behavior), growth and product teams can intervene before a user churns.
          </p>
        </div>
      </div>

      <div className="console-panel p-6">
        <p className="console-header text-console-text-muted border-b border-console-border-light pb-2 mb-6">PREDICTION PIPELINE</p>
        
        <div className="flex flex-col space-y-2 relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-console-border"></div>
          
          {[
            { step: 'RAW EVENTS', desc: 'Ingestion of raw user interaction events (views, carts, purchases).' },
            { step: 'FEATURE ENGINEERING', desc: 'Aggregation into 11 behavioral features per user (sessions, active days).' },
            { step: 'RETENTION PREDICTION', desc: 'Linear SVM classifies the user as Retained or Lost based on behavior.' },
            { step: 'BEHAVIORAL SEGMENTATION', desc: 'K-Means clustering assigns the user to a macro-behavioral cohort.' },
            { step: 'PCA VISUALIZATION', desc: 'High-dimensional behavior is reduced to 2D space for visual analysis.' },
            { step: 'INSIGHT GENERATION', desc: 'Rule-based engine extracts meaning from the ML model outputs.' },
            { step: 'BUSINESS RECOMMENDATION', desc: 'Actionable strategies are recommended to the product team.' }
          ].map((item, i) => (
            <div key={i} className="flex items-start z-10">
              <div className="w-8 h-8 rounded-full bg-console-surface border-2 border-console-border flex items-center justify-center mr-4 shrink-0 mt-0.5 text-[10px] font-bold text-console-text-muted">
                {i + 1}
              </div>
              <div className="bg-console-bg border border-console-border-light p-3 rounded-sm flex-1 mb-2 hover:border-console-text-faint transition-colors">
                <p className="console-mono text-xs font-bold text-console-text-main">{item.step}</p>
                <p className="text-xs text-console-text-muted mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="console-panel p-6 space-y-4">
          <p className="console-header text-console-text-muted border-b border-console-border-light pb-2">DATASET</p>
          <ul className="text-sm font-medium space-y-2 text-console-text-main">
            <li>E-commerce Events History</li>
            <li className="text-console-text-muted">Cosmetics Shop</li>
            <li className="text-console-text-muted">December 1–31, 2019</li>
            <li className="font-mono text-xs bg-console-bg p-1 rounded-sm mt-2">273,366 Users</li>
          </ul>
        </div>
        
        <div className="console-panel p-6 space-y-4">
          <p className="console-header text-console-text-muted border-b border-console-border-light pb-2">MACHINE LEARNING</p>
          <ul className="text-sm font-medium space-y-2 text-console-text-main">
            <li>Linear SVM <span className="text-[10px] bg-console-accent text-white px-1 ml-1 rounded-sm">PRIMARY</span></li>
            <li className="text-console-text-muted">Logistic Regression</li>
            <li className="text-console-text-muted">Decision Tree</li>
            <li className="text-console-text-muted">Random Forest</li>
            <li className="text-console-text-muted">K-Means Clustering</li>
            <li className="text-console-text-muted">PCA</li>
          </ul>
        </div>
        
        <div className="console-panel p-6 space-y-4">
          <p className="console-header text-console-text-muted border-b border-console-border-light pb-2">TECH STACK</p>
          <ul className="text-sm font-medium space-y-2 text-console-text-main">
            <li>React + TypeScript + Vite</li>
            <li className="text-console-text-muted">FastAPI + Python</li>
            <li className="text-console-text-muted">Pandas + Scikit-learn</li>
            <li className="text-console-text-muted">Recharts + Tailwind CSS</li>
            <li className="text-console-text-muted">Joblib</li>
          </ul>
        </div>
      </div>

      <div className="console-panel p-6 bg-console-amber/5 border-console-amber/30">
        <p className="console-header text-console-amber border-b border-console-amber/20 pb-2 mb-4">LIMITATIONS</p>
        <p className="text-sm text-console-text-main leading-relaxed font-medium">
          The current prototype is trained and evaluated using a single month of historical data (December 2019). The prediction window is limited to a strict 10-day period following the observation window. Before deploying to production, the models must be validated using a rolling-window approach across multiple months to account for seasonality and behavioral drift.
        </p>
      </div>
      
    </div>
  );
}
