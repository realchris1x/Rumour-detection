import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan, Database, Info, Zap
} from 'lucide-react';
import { DATASET_TWEETS, runInference, generatePropagationTree } from '../data/mockData';
import { LabelBadge } from '../components/LabelBadge';
import { PropagationGraph } from '../components/PropagationGraph';
import { PredictionResult } from '../types';

export const AnalyzerPage: React.FC = () => {
  const [mode, setMode] = useState<'paste' | 'dataset'>('paste');
  const [selectedDatasetTweetId, setSelectedDatasetTweetId] = useState<string>(DATASET_TWEETS[0].id);
  
  // Paste inputs
  const [tweetText, setTweetText] = useState('');
  const [screenName, setScreenName] = useState('AnonymousUser');
  const [isVerified, setIsVerified] = useState(false);
  const [followersCount, setFollowersCount] = useState(150);
  
  // Custom propagation features
  const [retweetCount, setRetweetCount] = useState<string>('');
  const [replyCount, setReplyCount] = useState<string>('');
  const [cascadeDepth, setCascadeDepth] = useState<string>('');
  const [cascadeSize, setCascadeSize] = useState<string>('');
  const [verifiedRatio, setVerifiedRatio] = useState<number>(0.1);
  const [avgTime, setAvgTime] = useState<string>('');
  const [networkDensity, setNetworkDensity] = useState<number>(0.05);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Sync dataset selection to inputs
  useEffect(() => {
    if (mode === 'dataset') {
      const tweet = DATASET_TWEETS.find(t => t.id === selectedDatasetTweetId);
      if (tweet) {
        setTweetText(tweet.text);
        setScreenName(tweet.user_screen_name);
        setIsVerified(tweet.user_verified);
        setFollowersCount(tweet.user_followers_count);
        setRetweetCount(tweet.retweet_count.toString());
        setReplyCount(tweet.reply_count.toString());
        setCascadeDepth(tweet.cascade_depth.toString());
        setCascadeSize(tweet.cascade_size.toString());
        setVerifiedRatio(tweet.verified_sharer_ratio);
        setAvgTime(tweet.avg_time_between_retweets.toString());
        setNetworkDensity(tweet.network_density);
      }
    }
  }, [selectedDatasetTweetId, mode]);

  const handleAnalyze = () => {
    if (!tweetText.trim()) return;

    setLoading(true);
    setResult(null);

    // Simulate 1.2s inference delay (matching PRD <1.5s requirement)
    setTimeout(() => {
      // Build custom features object
      const features = {
        retweet_count: retweetCount !== '' ? parseInt(retweetCount) : undefined,
        reply_count: replyCount !== '' ? parseInt(replyCount) : undefined,
        cascade_depth: cascadeDepth !== '' ? parseInt(cascadeDepth) : undefined,
        cascade_size: cascadeSize !== '' ? parseInt(cascadeSize) : undefined,
        verified_sharer_ratio: retweetCount !== '' ? verifiedRatio : undefined,
        avg_time_between_retweets: avgTime !== '' ? parseFloat(avgTime) : undefined,
        network_density: retweetCount !== '' ? networkDensity : undefined,
      };

      const prediction = runInference(tweetText, features);
      setResult(prediction);
      setLoading(false);

      // Save to History (LocalStorage)
      const newHistoryItem = {
        id: 'run-' + Date.now(),
        timestamp: new Date().toISOString(),
        text: tweetText,
        label: prediction.label,
        confidence: prediction.confidence,
        estimated: prediction.estimated,
        source: mode
      };

      const existingHistory = JSON.parse(localStorage.getItem('rumorlens_history') || '[]');
      localStorage.setItem('rumorlens_history', JSON.stringify([newHistoryItem, ...existingHistory]));
    }, 1200);
  };


  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* ─── Mode Selector and Main inputs ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            
            {/* Nav Headers */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-accent-gold" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">Analysis Console</h3>
              </div>
              
              <div className="bg-background-base p-1 rounded-lg border border-border-muted flex gap-1">
                <button
                  onClick={() => setMode('paste')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'paste' ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/20' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Paste Tweet
                </button>
                <button
                  onClick={() => setMode('dataset')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'dataset' ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/20' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Dataset Samples
                </button>
              </div>
            </div>

            {/* Form Fields */}
            {mode === 'dataset' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary">Select Dataset Source</label>
                <select
                  value={selectedDatasetTweetId}
                  onChange={(e) => setSelectedDatasetTweetId(e.target.value)}
                  className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold/50"
                >
                  {DATASET_TWEETS.map(tweet => (
                    <option key={tweet.id} value={tweet.id}>
                      [{tweet.dataset}] @{tweet.user_screen_name}: {tweet.text.substring(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-secondary">Tweet Text</label>
              <textarea
                value={tweetText}
                onChange={(e) => mode === 'paste' && setTweetText(e.target.value)}
                readOnly={mode === 'dataset'}
                placeholder="Paste the raw text of the social media post here..."
                rows={4}
                className="w-full bg-background-base border border-border-muted rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 resize-none leading-relaxed"
              />
            </div>

            {/* Author details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary">User Screen Name</label>
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => mode === 'paste' && setScreenName(e.target.value)}
                  readOnly={mode === 'dataset'}
                  className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-secondary">Followers Count</label>
                <input
                  type="number"
                  value={followersCount}
                  onChange={(e) => mode === 'paste' && setFollowersCount(parseInt(e.target.value) || 0)}
                  readOnly={mode === 'dataset'}
                  className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={isVerified}
                onChange={(e) => mode === 'paste' && setIsVerified(e.target.checked)}
                disabled={mode === 'dataset'}
                className="accent-accent-gold h-4 w-4 bg-background-base border-border-muted rounded"
              />
              <label htmlFor="isVerified" className="text-xs font-mono text-text-primary select-none cursor-pointer">
                Author holds verified badge
              </label>
            </div>

            {/* Custom Cascade Features (Collapsible or Optional label) */}
            <div className="border-t border-border-muted pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Cascade Propagation Metadata
                </h4>
                {retweetCount === '' && (
                  <span className="text-[10px] font-mono text-accent-gold bg-accent-gold/15 px-2 py-0.5 rounded">
                    Estimation Mode Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary">Retweet Count</label>
                  <input
                    type="number"
                    value={retweetCount}
                    onChange={(e) => mode === 'paste' && setRetweetCount(e.target.value)}
                    disabled={mode === 'dataset'}
                    placeholder="e.g. 150"
                    className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary">Reply Count</label>
                  <input
                    type="number"
                    value={replyCount}
                    onChange={(e) => mode === 'paste' && setReplyCount(e.target.value)}
                    disabled={mode === 'dataset'}
                    placeholder="e.g. 45"
                    className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary">Cascade Depth</label>
                  <input
                    type="number"
                    value={cascadeDepth}
                    onChange={(e) => mode === 'paste' && setCascadeDepth(e.target.value)}
                    disabled={mode === 'dataset'}
                    placeholder="Max branches"
                    className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary">Cascade Size (Nodes)</label>
                  <input
                    type="number"
                    value={cascadeSize}
                    onChange={(e) => mode === 'paste' && setCascadeSize(e.target.value)}
                    disabled={mode === 'dataset'}
                    placeholder="Total cascade users"
                    className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-text-secondary">
                  <span>Verified Sharers:</span>
                  <span className="text-text-primary font-bold">{Math.round(verifiedRatio * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={verifiedRatio}
                  onChange={(e) => mode === 'paste' && setVerifiedRatio(parseFloat(e.target.value))}
                  disabled={mode === 'dataset'}
                  className="w-full accent-accent-gold bg-background-base h-1 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary">Avg Retweet Interval (min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgTime}
                    onChange={(e) => mode === 'paste' && setAvgTime(e.target.value)}
                    disabled={mode === 'dataset'}
                    placeholder="Interval time"
                    className="w-full bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold/50 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-text-secondary">
                    <span>Network Density:</span>
                    <span className="text-text-primary font-bold">{networkDensity.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={networkDensity}
                    onChange={(e) => mode === 'paste' && setNetworkDensity(parseFloat(e.target.value))}
                    disabled={mode === 'dataset'}
                    className="w-full accent-accent-gold bg-background-base h-1 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !tweetText.trim()}
              className="w-full py-3 bg-accent-gold hover:bg-[#DCA42C] disabled:bg-border-muted disabled:text-text-muted text-background-base font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg active:scale-[0.98]"
            >
              {loading ? 'Evaluating Cascades...' : 'Analyze Signals'}
            </button>
            
          </div>
        </div>

        {/* ─── Result Panel / Dashboard Outputs ────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Skeletal Loader */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-2xl p-8 space-y-6 min-h-[500px] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-border-muted/50 rounded w-1/4 animate-pulse" />
                  <div className="flex items-center gap-4 border-b border-border-muted pb-4">
                    <div className="h-10 bg-border-muted/50 rounded-full w-32 animate-pulse" />
                    <div className="h-6 bg-border-muted/50 rounded w-16 animate-pulse" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-border-muted/50 rounded animate-pulse" />
                    <div className="h-16 bg-border-muted/50 rounded animate-pulse" />
                  </div>
                </div>
                
                {/* D3 Graph placeholder spinner */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12">
                  <div className="w-12 h-12 border-2 border-t-accent-gold border-border-muted rounded-full animate-spin" />
                  <span className="text-xs font-mono text-text-secondary">Generating propagation graph representation...</span>
                </div>

                <div className="h-20 bg-border-muted/30 rounded animate-pulse w-full" />
              </motion.div>
            )}

            {/* Result Panel */}
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                
                {/* Confidence & Core Label Header */}
                <div className="glass-panel rounded-2xl p-6">
                  <div className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">Classification Result</div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4">
                      <LabelBadge label={result.label} size="lg" />
                      <div className="font-mono text-2xl font-bold">
                        {Math.round(result.confidence * 100)}% <span className="text-xs font-normal text-text-secondary">confidence</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-base border border-border-muted text-xs font-mono">
                      <span>Source Mode:</span>
                      <strong className="text-text-primary capitalize">{result.estimated ? 'Text Only (Estimation)' : 'Dual Branch (Text+Graph)'}</strong>
                    </div>

                  </div>

                  {/* Dual Signal Contribution Bars */}
                  <div className="mt-6 border-t border-border-muted pt-6 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-text-secondary flex items-center gap-1"><Zap className="h-3 w-3 text-accent-gold" /> Decision-driving Weights</span>
                    </div>

                    <div className="flex h-3 rounded-full overflow-hidden bg-border-muted">
                      <div 
                        style={{ width: `${result.text_contribution}%` }}
                        className="bg-accent-gold transition-all"
                        title={`Text Features: ${result.text_contribution}%`}
                      />
                      <div 
                        style={{ width: `${result.graph_contribution}%` }}
                        className="bg-[#8F48E5] transition-all"
                        title={`Graph Features: ${result.graph_contribution}%`}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-accent-gold inline-block" />
                        <span>BiLSTM Text Signals ({result.text_contribution}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#8F48E5] inline-block" />
                        <span>Graph Propagation Signatures ({result.graph_contribution}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="glass-panel rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-accent-gold" /> Why this prediction?
                  </h4>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                {/* Propagation Cascade Visualization */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border-muted pb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Propagation Graph</h4>
                      <p className="text-xs text-text-muted">Simulated retweet/reply tree based on features</p>
                    </div>
                    
                    <a
                      href={`/propagation?tweet=${result.tweet_id || 'custom'}`}
                      className="text-xs font-mono text-accent-gold hover:underline"
                    >
                      Expand View &rarr;
                    </a>
                  </div>
                  
                  <div className="h-[300px]">
                    <PropagationGraph
                      tree={generatePropagationTree({
                        id: result.tweet_id || 'root-node',
                        user_screen_name: screenName,
                        user_verified: isVerified,
                        user_followers_count: followersCount,
                        retweet_count: result.features.retweet_count,
                        reply_count: result.features.reply_count,
                        label: result.label,
                        cascade_depth: result.features.cascade_depth,
                        cascade_size: result.features.cascade_size,
                        verified_sharer_ratio: result.features.verified_sharer_ratio,
                        avg_time_between_retweets: result.features.avg_time_between_retweets,
                        network_density: result.features.network_density
                      })}
                      height={300}
                    />
                  </div>
                </div>

                {/* Feature stats comparison table */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
                    Feature Comparison
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono text-left">
                      <thead>
                        <tr className="text-text-muted border-b border-border-muted pb-2">
                          <th className="py-2">Attribute</th>
                          <th className="py-2">Input Value</th>
                          <th className="py-2">Dataset Average (Claims)</th>
                          <th className="py-2">Evaluation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-muted/30 text-text-secondary">
                        <tr>
                          <td className="py-3 font-semibold text-text-primary">Cascade Depth</td>
                          <td className="py-3">{result.features.cascade_depth}</td>
                          <td className="py-3">5.2</td>
                          <td className="py-3">
                            <span className={result.features.cascade_depth > 5 ? "text-signal-rumor" : "text-signal-nonRumor"}>
                              {result.features.cascade_depth > 5 ? "Anomaly (Deep)" : "Nominal"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-text-primary">Verified Sharers</td>
                          <td className="py-3">{Math.round(result.features.verified_sharer_ratio * 100)}%</td>
                          <td className="py-3">12%</td>
                          <td className="py-3">
                            <span className={result.features.verified_sharer_ratio < 0.1 ? "text-signal-rumor" : "text-signal-nonRumor"}>
                              {result.features.verified_sharer_ratio < 0.1 ? "Very Low" : "High (Stable)"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-text-primary">Retweet Speed</td>
                          <td className="py-3">{result.features.avg_time_between_retweets}m</td>
                          <td className="py-3">2.4m</td>
                          <td className="py-3">
                            <span className={result.features.avg_time_between_retweets < 1.5 ? "text-signal-rumor" : "text-signal-nonRumor"}>
                              {result.features.avg_time_between_retweets < 1.5 ? "Rapid Cascade" : "Normal"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-text-primary">Network Density</td>
                          <td className="py-3">{result.features.network_density.toFixed(3)}</td>
                          <td className="py-3">0.082</td>
                          <td className="py-3">
                            <span className={result.features.network_density > 0.1 ? "text-signal-rumor" : "text-signal-nonRumor"}>
                              {result.features.network_density > 0.1 ? "Echo Chamber" : "Sparse (Organic)"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Zero State / Empty State */}
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel rounded-2xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="p-4 rounded-full bg-border-muted/50 border border-border-muted mb-2">
                  <Scan className="h-10 w-10 text-text-muted" />
                </div>
                
                <h3 className="text-base font-semibold text-text-primary">Console Awaiting Signal Input</h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Enter tweet content and propagation features on the left, then click <strong>Analyze Signals</strong> to evaluate.
                </p>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => {
                      setMode('dataset');
                      setSelectedDatasetTweetId(DATASET_TWEETS[0].id);
                    }}
                    className="text-xs font-mono text-accent-gold hover:underline flex items-center gap-1.5"
                  >
                    <Database className="h-3.5 w-3.5" />
                    Load PHEME Example
                  </button>
                  <span className="text-text-muted">•</span>
                  <button 
                    onClick={() => {
                      setMode('paste');
                      setTweetText("BREAKING: Reports of emergency landing at London Heathrow airport due to engine fire. Flight BA242.");
                      setRetweetCount("120");
                      setReplyCount("30");
                      setCascadeDepth("5");
                      setCascadeSize("40");
                      setVerifiedRatio(0.04);
                      setAvgTime("0.8");
                      setNetworkDensity(0.12);
                    }}
                    className="text-xs font-mono text-accent-gold hover:underline flex items-center gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Load Paste Demo
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
