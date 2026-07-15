import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Network, User, ShieldCheck, Clock, Share2, Award, Database
} from 'lucide-react';
import { DATASET_TWEETS, generatePropagationTree } from '../data/mockData';
import { PropagationGraph } from '../components/PropagationGraph';
import { LabelBadge } from '../components/LabelBadge';
import { PropagationNode } from '../types';

export const PropagationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tweetQueryId = searchParams.get('tweet');
  
  const [selectedTweetId, setSelectedTweetId] = useState<string>(
    tweetQueryId && DATASET_TWEETS.some(t => t.id === tweetQueryId)
      ? tweetQueryId
      : DATASET_TWEETS[0].id
  );

  const [selectedNode, setSelectedNode] = useState<PropagationNode | null>(null);

  // Get selected tweet details
  const activeTweet = DATASET_TWEETS.find(t => t.id === selectedTweetId) || DATASET_TWEETS[0];
  const tree = generatePropagationTree(activeTweet);

  // Auto-select root node when active tweet changes
  useEffect(() => {
    if (tree && tree.nodes.length > 0) {
      setSelectedNode(tree.nodes[0]);
    }
  }, [selectedTweetId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      
      {/* Top Controls & Metrics Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-shrink-0">
        
        {/* Dropdown Selector */}
        <div className="lg:col-span-4 bg-background-surface border border-border-muted p-4 rounded-xl flex items-center gap-3">
          <Database className="h-5 w-5 text-accent-gold" />
          <div className="flex-1">
            <div className="text-[10px] font-mono text-text-muted uppercase">Select Claim Graph</div>
            <select
              value={selectedTweetId}
              onChange={(e) => setSelectedTweetId(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-text-primary focus:outline-none cursor-pointer mt-0.5"
            >
              {DATASET_TWEETS.map(t => (
                <option key={t.id} value={t.id} className="bg-background-surface">
                  @{t.user_screen_name}: {t.text.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic metrics */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-background-surface border border-border-muted p-3.5 rounded-xl text-center">
            <div className="text-[10px] font-mono text-text-muted uppercase">Max Depth</div>
            <div className="text-xl font-bold text-text-primary mt-1 font-mono">{activeTweet.cascade_depth} layers</div>
          </div>
          <div className="bg-background-surface border border-border-muted p-3.5 rounded-xl text-center">
            <div className="text-[10px] font-mono text-text-muted uppercase">Cascade Size</div>
            <div className="text-xl font-bold text-text-primary mt-1 font-mono">{activeTweet.cascade_size} nodes</div>
          </div>
          <div className="bg-background-surface border border-border-muted p-3.5 rounded-xl text-center">
            <div className="text-[10px] font-mono text-text-muted uppercase">Verified Sharers</div>
            <div className="text-xl font-bold text-text-primary mt-1 font-mono">{Math.round(activeTweet.verified_sharer_ratio * 100)}%</div>
          </div>
          <div className="bg-background-surface border border-border-muted p-3.5 rounded-xl text-center">
            <div className="text-[10px] font-mono text-text-muted uppercase">Network Density</div>
            <div className="text-xl font-bold text-text-primary mt-1 font-mono">{activeTweet.network_density.toFixed(3)}</div>
          </div>
        </div>

      </div>

      {/* Main Canvas & Side Panel Inspector */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Interactive Graph Canvas */}
        <div className="lg:col-span-8 bg-background-surface/20 rounded-xl relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <LabelBadge label={activeTweet.label} showDot />
          </div>
          
          <div className="flex-1 min-h-0 h-full relative">
            <PropagationGraph
              tree={tree}
              onNodeSelect={(node) => setSelectedNode(node)}
              selectedNodeId={selectedNode?.id}
              height={500}
            />
          </div>
        </div>

        {/* Side Panel Inspector */}
        <div className="lg:col-span-4 bg-background-surface border border-border-muted rounded-xl p-5 overflow-y-auto flex flex-col h-full justify-between">
          <div>
            <div className="border-b border-border-muted pb-4 mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono flex items-center gap-1.5">
                <Network className="h-4 w-4 text-accent-gold" /> Node Inspector
              </h3>
              <p className="text-xs text-text-muted mt-1">Click nodes in the cascade to view user roles and details</p>
            </div>

            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Username */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-border-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">@{selectedNode.user_screen_name}</h4>
                    <span className="text-[10px] font-mono text-text-muted capitalize">Role: {selectedNode.type}</span>
                  </div>
                </div>

                {/* Account Details list */}
                <div className="space-y-3.5 bg-background-base/50 p-4 rounded-xl border border-border-muted">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-text-muted" /> Verification Status
                    </span>
                    <span className={selectedNode.is_verified ? "text-signal-nonRumor font-bold" : "text-text-muted"}>
                      {selectedNode.is_verified ? "VERIFIED ACCOUNT" : "UNVERIFIED"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-text-muted" /> Followers Count
                    </span>
                    <span className="text-text-primary font-bold">{selectedNode.followers_count.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Clock className="h-4 w-4 text-text-muted" /> Cascade Offset
                    </span>
                    <span className="text-text-primary font-bold">+{selectedNode.created_at_offset} minutes</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Award className="h-4 w-4 text-text-muted" /> Calculated Influence
                    </span>
                    <span className="text-accent-gold font-bold">{selectedNode.influence.toFixed(1)}</span>
                  </div>
                </div>

                {/* Role Description */}
                <div className="text-xs text-text-secondary leading-relaxed bg-accent-gold/5 p-3 rounded-lg border border-accent-gold/10">
                  {selectedNode.type === 'root' && (
                    <span><strong>Source Tweet Poster:</strong> The actor who initiated the claim. Rumors often initiate from lower-follower, unverified accounts, while genuine news starts from reputable corporate networks.</span>
                  )}
                  {selectedNode.type === 'retweet' && (
                    <span><strong>Amplification Node (Retweet):</strong> This user forwarded the tweet without modification, representing pure information spread. Rapid bursts of retweets by small accounts indicate viral rumor propagation.</span>
                  )}
                  {selectedNode.type === 'reply' && (
                    <span><strong>Interactive Node (Reply):</strong> This user commented on the post. High density of replies relative to retweets often suggests intense skepticism, debate, or debunking of the source claim.</span>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="text-center py-12 text-text-muted text-xs font-mono">
                No node selected
              </div>
            )}
          </div>

          <div className="border-t border-border-muted pt-4 text-[10px] font-mono text-text-muted leading-relaxed">
            <strong>Graph-Propagation Theory:</strong> Rumor cascades spread deeper (high max depth), cluster tightly in echo chambers (high density), and rely heavily on unverified nodes. Authentic cascades branch widely but remain shallow and feature prominent verified accounts.
          </div>
        </div>

      </div>

    </div>
  );
};
