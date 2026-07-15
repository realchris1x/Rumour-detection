import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Trash2, Search, Filter, ExternalLink
} from 'lucide-react';
import { LabelBadge } from '../components/LabelBadge';
import { HistoryRun } from '../types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRun[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  // Load history from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem('rumorlens_history');
    if (data) {
      setHistory(JSON.parse(data));
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all analysis history?")) {
      localStorage.removeItem('rumorlens_history');
      setHistory([]);
    }
  };

  // Filter history items
  const filteredHistory = history.filter(run => {
    const matchesSearch = run.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'ALL' || run.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-muted pb-4">
        <div>
          <p className="text-xs text-text-secondary mt-1">Audit log of all manual and batch neural classification requests</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-signal-rumorMuted border border-signal-rumor/30 text-signal-rumor hover:bg-signal-rumor hover:text-background-base text-xs font-semibold rounded-lg transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Log
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-background-surface border border-border-muted p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search logs by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background-base border border-border-muted rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value="paste">Manual Paste</option>
            <option value="dataset">Dataset Loader</option>
            <option value="batch">Batch Uploads</option>
          </select>
        </div>

      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((run) => (
          <div
            key={run.id}
            onClick={() => navigate(`/?tweet=${run.text}`)} // Can route back with URL params
            className="glass-panel hover:border-accent-gold/40 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center cursor-pointer transition-all duration-200 group"
          >
            
            {/* Left: Text & Time */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(run.timestamp)}
                </span>
                <span className="text-[10px] text-text-muted">•</span>
                <span className="text-[10px] font-mono text-accent-gold uppercase tracking-wider bg-accent-gold/15 px-2 py-0.5 rounded">
                  Source: {run.source}
                </span>
              </div>
              
              <p className="text-sm text-text-primary font-medium line-clamp-1 pr-6 leading-relaxed">
                {run.text}
              </p>
            </div>

            {/* Right: Badge, score & action link */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-border-muted/50 pt-2.5 md:pt-0">
              
              <div className="flex items-center gap-3">
                <LabelBadge label={run.label} size="sm" showDot={false} />
                <span className="font-mono text-sm font-bold text-text-primary">
                  {Math.round(run.confidence * 100)}%
                </span>
              </div>

              <span className="text-xs font-mono text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Reopen <ExternalLink className="h-3 w-3" />
              </span>

            </div>

          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="glass-panel p-12 rounded-xl text-center space-y-3">
            <Clock className="h-8 w-8 text-text-muted mx-auto" />
            <h4 className="text-sm font-semibold text-text-primary">No Local Log Entries Found</h4>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Analyses run via the Analyzer console or Batch CSV uploader are automatically cached here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
