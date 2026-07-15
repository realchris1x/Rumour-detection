import React, { useState, useRef } from 'react';
import {
  Upload, Download, FileText, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { runInference } from '../data/mockData';
import { LabelBadge } from '../components/LabelBadge';
import { PredictionResult } from '../types';

interface BatchRow {
  text: string;
  retweet_count?: number;
  reply_count?: number;
  cascade_depth?: number;
  cascade_size?: number;
  verified_sharer_ratio?: number;
  avg_time_between_retweets?: number;
  network_density?: number;
  prediction?: PredictionResult;
}

export const BatchPage: React.FC = () => {
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template CSV Content
  const templateCsv = `text,retweet_count,reply_count,cascade_depth,cascade_size,verified_sharer_ratio,avg_time_between_retweets,network_density
"BREAKING: Chemical explosion at plant in Leeds. Residents told to seal windows.",420,85,6,65,0.05,1.2,0.14
"Official statement from Leeds fire station: chemical drill underway, no danger to public.",1200,92,2,80,0.68,3.4,0.02
"Heard a loud boom in North Leeds, is the chemical factory rumor true?",45,28,4,15,0.12,2.8,0.07
"Huge jackpot lottery winner announced in Leeds, reportedly a local teacher.",95,12,3,25,0.15,4.2,0.03`;

  // Download template handler
  const handleDownloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'rumorlens_batch_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run batch inference
  const processBatch = (parsedRows: BatchRow[]) => {
    setLoading(true);
    setError(null);
    
    // Simulate batch network processing time
    setTimeout(() => {
      const results = parsedRows.map(row => {
        const prediction = runInference(row.text, {
          retweet_count: row.retweet_count,
          reply_count: row.reply_count,
          cascade_depth: row.cascade_depth,
          cascade_size: row.cascade_size,
          verified_sharer_ratio: row.verified_sharer_ratio,
          avg_time_between_retweets: row.avg_time_between_retweets,
          network_density: row.network_density,
        });

        // Proactively add to global localStorage history
        const newHistoryItem = {
          id: 'run-batch-' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          text: row.text,
          label: prediction.label,
          confidence: prediction.confidence,
          estimated: prediction.estimated,
          source: 'batch' as const
        };
        const currentHistory = JSON.parse(localStorage.getItem('rumorlens_history') || '[]');
        localStorage.setItem('rumorlens_history', JSON.stringify([newHistoryItem, ...currentHistory]));

        return { ...row, prediction };
      });
      
      setRows(results);
      setLoading(false);
    }, 1800);
  };

  // Parse CSV helper
  const parseCsvText = (text: string) => {
    try {
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsed: BatchRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom regex to handle CSV quotes properly
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const values = matches.map(v => v.replace(/^"|"$/g, '').trim());

        const rowData: Record<string, any> = {};
        headers.forEach((header, index) => {
          const val = values[index];
          if (header === 'text') {
            rowData.text = val;
          } else if (val !== undefined && val !== '') {
            rowData[header] = parseFloat(val);
          }
        });

        if (rowData.text) {
          parsed.push({
            text: rowData.text,
            retweet_count: rowData.retweet_count,
            reply_count: rowData.reply_count,
            cascade_depth: rowData.cascade_depth,
            cascade_size: rowData.cascade_size,
            verified_sharer_ratio: rowData.verified_sharer_ratio,
            avg_time_between_retweets: rowData.avg_time_between_retweets,
            network_density: rowData.network_density,
          });
        }
      }
      
      if (parsed.length === 0) {
        throw new Error('CSV is empty or missing required headers');
      }

      processBatch(parsed);
    } catch (e: any) {
      setError(e.message || 'Failed to parse CSV. Make sure formatting aligns with template.');
    }
  };

  // Upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleLoadDemoBatch = () => {
    parseCsvText(templateCsv);
  };

  // Export processed batch to CSV
  const handleExportResults = () => {
    if (rows.length === 0) return;

    let csvContent = "text,predicted_label,confidence,text_influence_pct,graph_influence_pct,why_predicted\n";
    rows.forEach(r => {
      if (r.prediction) {
        // escape double quotes in text
        const safeText = r.text.replace(/"/g, '""');
        const safeReason = r.prediction.explanation.replace(/"/g, '""');
        csvContent += `"${safeText}",${r.prediction.label},${r.prediction.confidence},${r.prediction.text_contribution},${r.prediction.graph_contribution},"${safeReason}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rumorlens_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* CSV Dropzone / Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload card */}
        <div className="lg:col-span-5 bg-background-surface border border-border-muted p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-accent-gold mb-3">
              <Upload className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">CSV Batch Console</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload a bulk CSV containing social media claims. RumorLens runs our neural fusion prediction asynchronously for every row, returning confidence factors and classification signals in seconds.
            </p>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          {/* Visual Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-muted hover:border-accent-gold/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-border-muted/10 group"
          >
            <FileText className="h-8 w-8 text-text-muted group-hover:text-accent-gold transition-colors mb-3" />
            <span className="text-xs font-semibold text-text-primary">Click to select CSV file</span>
            <span className="text-[10px] text-text-muted mt-1 font-mono">Max size 2MB (.csv)</span>
          </div>

          {/* Quick templates and demo actions */}
          <div className="flex justify-between items-center gap-4 border-t border-border-muted pt-4">
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-mono text-text-secondary hover:text-text-primary flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Get CSV Template
            </button>
            <button
              onClick={handleLoadDemoBatch}
              className="text-xs font-mono text-accent-gold hover:underline flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Load Demo Batch
            </button>
          </div>
        </div>

        {/* Status display */}
        <div className="lg:col-span-7 bg-background-surface border border-border-muted p-6 rounded-2xl flex flex-col justify-between min-h-[250px]">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono border-b border-border-muted pb-3 mb-4">
              Processing Status
            </h4>

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="w-10 h-10 border-2 border-t-accent-gold border-border-muted rounded-full animate-spin" />
                <span className="text-xs font-mono text-text-secondary">Running dual-branch evaluations across batch...</span>
              </div>
            )}

            {!loading && rows.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[#3DD68C]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs font-mono font-bold">Processed {rows.length} rows successfully</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Bulk results are loaded in the viewer grid below. You can inspect classification confidence, explanation signals, or export the resulting classifications back to CSV.
                </p>
                <button
                  onClick={handleExportResults}
                  className="py-2 px-4 bg-accent-gold text-background-base font-semibold rounded-lg text-xs flex items-center gap-2 hover:bg-[#DCA42C] transition-colors"
                >
                  <Download className="h-4 w-4" /> Export Processed CSV
                </button>
              </div>
            )}

            {!loading && rows.length === 0 && !error && (
              <div className="text-center py-12 text-text-muted text-xs font-mono">
                No active batch running. Use the console on the left to upload data.
              </div>
            )}

            {error && (
              <div className="flex gap-2.5 p-3 rounded-lg bg-signal-rumorMuted border border-signal-rumor/30 text-signal-rumor text-xs font-mono">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border-muted pt-4 text-[10px] font-mono text-text-muted">
            Note: All batch evaluations are recorded locally in your Browser Inference History.
          </div>
        </div>

      </div>

      {/* ─── Batch Results Table ────────────────────────────────────── */}
      {rows.length > 0 && !loading && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-semibold text-text-primary">Batch Output Viewer</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-text-muted border-b border-border-muted/50 pb-2">
                  <th className="pb-3 font-semibold font-mono">Row</th>
                  <th className="pb-3 font-semibold font-mono">Raw Text</th>
                  <th className="pb-3 font-semibold font-mono">Prediction</th>
                  <th className="pb-3 font-semibold font-mono">Confidence</th>
                  <th className="pb-3 font-semibold font-mono">Decision Signals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted/30">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-border-muted/10 transition-colors">
                    <td className="py-4 font-mono text-text-secondary">{idx + 1}</td>
                    <td className="py-4 pr-6 max-w-sm sm:max-w-md">
                      <div className="text-text-primary line-clamp-2 leading-relaxed">{row.text}</div>
                    </td>
                    <td className="py-4">
                      {row.prediction && (
                        <LabelBadge label={row.prediction.label} size="sm" showDot={false} />
                      )}
                    </td>
                    <td className="py-4 font-mono font-bold text-text-primary">
                      {row.prediction ? `${Math.round(row.prediction.confidence * 100)}%` : '-'}
                    </td>
                    <td className="py-4 text-text-secondary leading-relaxed font-sans max-w-xs">
                      <div className="line-clamp-2">{row.prediction?.explanation}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
