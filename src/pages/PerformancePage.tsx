import React, { useState } from 'react';
import {
  BarChart3, ShieldAlert, Award, Activity
} from 'lucide-react';
import { MODEL_METRICS_COMPARISON, CONFUSION_MATRIX, TRAINING_CURVES } from '../data/mockData';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';

export const PerformancePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('Dual-Branch BiLSTM + Graph (Ours)');

  // Selected metrics card
  const activeMetrics = MODEL_METRICS_COMPARISON.find(m => m.modelName === selectedModel) || MODEL_METRICS_COMPARISON[4];

  // Helper to format percentage
  const pct = (val: number) => `${Math.round(val * 100)}%`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* ─── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Accuracy */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase">Global Accuracy</span>
            <div className="text-3xl font-bold font-mono text-text-primary mt-1">{pct(activeMetrics.accuracy)}</div>
            <p className="text-[10px] text-text-secondary mt-1">Ratio of true classifications</p>
          </div>
          <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-xl text-accent-gold">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Precision */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase">Precision Rate</span>
            <div className="text-3xl font-bold font-mono text-text-primary mt-1">{pct(activeMetrics.precision)}</div>
            <p className="text-[10px] text-text-secondary mt-1">Low false rumor alerts</p>
          </div>
          <div className="p-3 bg-[#3DD68C]/10 border border-[#3DD68C]/20 rounded-xl text-[#3DD68C]">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        {/* Recall */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase">Recall Rate</span>
            <div className="text-3xl font-bold font-mono text-text-primary mt-1">{pct(activeMetrics.recall)}</div>
            <p className="text-[10px] text-text-secondary mt-1">Detects most active rumors</p>
          </div>
          <div className="p-3 bg-[#8F48E5]/10 border border-[#8F48E5]/20 rounded-xl text-[#8F48E5]">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* F1 Score */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase">F1 Macro Score</span>
            <div className="text-3xl font-bold font-mono text-text-primary mt-1">{pct(activeMetrics.f1)}</div>
            <p className="text-[10px] text-text-secondary mt-1">Balanced harmonic index</p>
          </div>
          <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-xl text-accent-gold">
            <BarChart3 className="h-6 w-6 animate-pulse" />
          </div>
        </div>

      </div>

      {/* ─── Model Selector ─── */}
      <div className="flex items-center gap-3 bg-background-surface border border-border-muted p-4 rounded-xl">
        <span className="text-xs font-mono text-text-secondary uppercase">Active Model View:</span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-background-base border border-border-muted rounded px-3 py-1 text-xs text-text-primary focus:outline-none cursor-pointer font-bold"
        >
          {MODEL_METRICS_COMPARISON.map(m => (
            <option key={m.modelName} value={m.modelName}>{m.modelName}</option>
          ))}
        </select>
      </div>

      {/* ─── Architecture Comparison & Training Curves ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Model Accuracy Comparison Bar Chart */}
        <div className="lg:col-span-7 bg-background-surface border border-border-muted p-6 rounded-2xl space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Architecture Performance Comparison</h4>
            <p className="text-xs text-text-secondary mt-1">Accuracy scores comparison across multiple NLP and graph configurations</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MODEL_METRICS_COMPARISON}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#22252B" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} stroke="#5A5E67" fontSize={9} />
                <YAxis dataKey="modelName" type="category" stroke="#5A5E67" fontSize={9} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Accuracy']}
                  contentStyle={{ backgroundColor: '#131519', border: '1px solid #22252B' }}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {MODEL_METRICS_COMPARISON.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCustom ? '#E8B23D' : 'rgba(142, 147, 158, 0.4)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-accent-gold/5 rounded-xl border border-accent-gold/10 text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Key Takeaway:</strong> Fusing temporal propagation structure (NetworkX features) with text embeddings (BiLSTM branch) achieves a <strong className="text-accent-gold">+9% accuracy lift</strong> over textual BiLSTM classifiers, and a <strong className="text-text-primary">+20% lift</strong> over conventional SVM baselines.
          </div>
        </div>

        {/* Training Curves (Loss/Accuracy) */}
        <div className="lg:col-span-5 bg-background-surface border border-border-muted p-6 rounded-2xl space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Model Training Curves (Dual Branch)</h4>
            <p className="text-xs text-text-secondary mt-1">Loss and Validation curves tracked over 30 epochs</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAINING_CURVES} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22252B" />
                <XAxis dataKey="epoch" stroke="#5A5E67" fontSize={9} />
                <YAxis stroke="#5A5E67" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#131519', border: '1px solid #22252B' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="loss" name="Train Loss" stroke="#ECEDEE" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="val_loss" name="Val Loss" stroke="#E8B23D" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="val_accuracy" name="Val Acc" stroke="#3DD68C" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-[10px] font-mono text-text-muted text-center">
            Epoch 25 converges to optimal weights. Early stopping triggers at Epoch 30.
          </div>
        </div>

      </div>

      {/* ─── Interactive Confusion Matrix Heatmap ──────────────────── */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Interactive Confusion Matrix</h4>
          <p className="text-xs text-text-secondary mt-1">3x3 class correlation heatmap. Higher opacity correlates with true positives.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Heatmap Grid */}
          <div className="max-w-sm mx-auto w-full aspect-square flex flex-col font-mono text-xs">
            
            {/* Headers */}
            <div className="grid grid-cols-4 text-center text-[10px] text-text-muted uppercase mb-2">
              <div></div>
              <div>Predicted Rumor</div>
              <div>Predicted Non-Rumor</div>
              <div>Predicted Unverified</div>
            </div>

            {/* Matrix rows */}
            {CONFUSION_MATRIX.matrix.map((row, rIdx) => {
              const labelName = CONFUSION_MATRIX.labels[rIdx];
              return (
                <div key={rIdx} className="grid grid-cols-4 items-center h-1/3 text-center">
                  {/* Left row labels */}
                  <div className="text-[10px] text-text-muted uppercase text-left pr-2 font-bold leading-tight">
                    True {labelName}
                  </div>
                  
                  {/* Matrix cells */}
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    // Color intensity mapping
                    let bgStyle = 'bg-border-muted/20 text-text-secondary';
                    if (isDiagonal) {
                      if (rIdx === 0) bgStyle = 'bg-signal-rumor text-background-base font-bold shadow-lg';
                      if (rIdx === 1) bgStyle = 'bg-signal-nonRumor text-background-base font-bold shadow-lg';
                      if (rIdx === 2) bgStyle = 'bg-signal-unverified text-background-base font-bold shadow-lg';
                    } else if (val > 0) {
                      bgStyle = 'bg-border-muted/50 text-text-primary';
                    }

                    return (
                      <div
                        key={cIdx}
                        className={`m-1.5 flex flex-col items-center justify-center rounded-xl border border-border-muted/20 h-[70px] ${bgStyle}`}
                      >
                        <span className="text-base font-bold">{val}%</span>
                        <span className="text-[8px] opacity-75 mt-0.5">{val} runs</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Explanation Text */}
          <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
            <h5 className="font-semibold text-text-primary uppercase tracking-wider font-mono">Heatmap Insights</h5>
            <p>
              The diagonal represents correct classifications (True Positives). Our Dual-Branch model registers exceptionally clean separation:
            </p>
            <ul className="list-disc pl-4 space-y-2 font-mono text-[11px]">
              <li><strong className="text-signal-rumor">Rumors (92% Recall):</strong> Only 8% of malicious rumors leak undetected as genuine news or remain unverified.</li>
              <li><strong className="text-signal-nonRumor">Non-Rumors (96% Specificity):</strong> Near-zero false alarms on official, verified reporting.</li>
              <li><strong className="text-signal-unverified">Unverified Claims (90% Precision):</strong> Confidently flags clickbait or viral claims undergoing active debate.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
