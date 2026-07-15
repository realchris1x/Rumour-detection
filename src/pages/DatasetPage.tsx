import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Search, Filter, Share2, MessageCircle, GitBranch, ArrowUpRight
} from 'lucide-react';
import { DATASET_TWEETS } from '../data/mockData';
import { LabelBadge } from '../components/LabelBadge';

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export const DatasetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<string>('ALL');
  const [selectedLabel, setSelectedLabel] = useState<string>('ALL');

  // Filter tweets
  const filteredTweets = DATASET_TWEETS.filter(tweet => {
    const matchesSearch = tweet.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tweet.user_screen_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDataset = selectedDataset === 'ALL' || tweet.dataset === selectedDataset;
    const matchesLabel = selectedLabel === 'ALL' || tweet.label === selectedLabel;
    
    return matchesSearch && matchesDataset && matchesLabel;
  });

  // Calculate stats for charts
  const totalTweetsCount = DATASET_TWEETS.length;
  
  const classDistribution = [
    { name: 'Rumors', value: DATASET_TWEETS.filter(t => t.label === 'rumor').length, color: '#E5484D' },
    { name: 'Non-Rumors', value: DATASET_TWEETS.filter(t => t.label === 'non-rumor').length, color: '#3DD68C' },
    { name: 'Unverified', value: DATASET_TWEETS.filter(t => t.label === 'unverified').length, color: '#E8B23D' },
  ];

  const datasetDistribution = [
    { name: 'PHEME', count: DATASET_TWEETS.filter(t => t.dataset === 'PHEME').length },
    { name: 'Twitter15', count: DATASET_TWEETS.filter(t => t.dataset === 'Twitter15').length },
    { name: 'Twitter16', count: DATASET_TWEETS.filter(t => t.dataset === 'Twitter16').length },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* ─── Dataset Stats Headers ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stats Text */}
        <div className="lg:col-span-4 bg-background-surface border border-border-muted p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-accent-gold mb-3">
              <Database className="h-5 w-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">Dataset Overview</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              RumorLens compiles preprocessed claims from three major academic benchmarks: <strong>PHEME</strong>, <strong>Twitter15</strong>, and <strong>Twitter16</strong>. These datasets capture complete temporal propagation cascades and linguistic records for classification training.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border-muted pt-4">
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase">Total Loaded</span>
              <div className="text-2xl font-bold text-text-primary mt-1 font-mono">{totalTweetsCount} Cascades</div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase">Engagements</span>
              <div className="text-2xl font-bold text-text-primary mt-1 font-mono">9,800+ nodes</div>
            </div>
          </div>
        </div>

        {/* Middle Chart: Class Distribution */}
        <div className="lg:col-span-4 bg-background-surface border border-border-muted p-5 rounded-2xl flex flex-col items-center justify-between">
          <div className="w-full text-left text-xs font-mono text-text-secondary mb-2 uppercase border-b border-border-muted pb-2">
            Class balance (Claims)
          </div>
          
          <div className="w-full h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {classDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col gap-1 text-[10px] font-mono text-text-secondary pl-4">
              {classDistribution.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                  <span>{c.name} ({c.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chart: Source Balance */}
        <div className="lg:col-span-4 bg-background-surface border border-border-muted p-5 rounded-2xl flex flex-col justify-between">
          <div className="w-full text-left text-xs font-mono text-text-secondary mb-2 uppercase border-b border-border-muted pb-2">
            Dataset Source Balance
          </div>
          
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datasetDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22252B" />
                <XAxis dataKey="name" stroke="#5A5E67" fontSize={9} tickLine={false} />
                <YAxis stroke="#5A5E67" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#131519', border: '1px solid #22252B' }} />
                <Bar dataKey="count" fill="#E8B23D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── Search & Filters ───────────────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-border-muted/50 pb-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by keyword or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-base border border-border-muted rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/40"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
            
            {/* Filter by Dataset */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-muted" />
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Datasets</option>
                <option value="PHEME">PHEME only</option>
                <option value="Twitter15">Twitter15 only</option>
                <option value="Twitter16">Twitter16 only</option>
              </select>
            </div>

            {/* Filter by Label */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="bg-background-base border border-border-muted rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Labels</option>
                <option value="rumor">Rumors</option>
                <option value="non-rumor">Non-Rumors</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

          </div>
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-text-muted border-b border-border-muted/50 pb-2">
                <th className="pb-3 font-semibold font-mono text-xs">Dataset</th>
                <th className="pb-3 font-semibold font-mono text-xs">Claim / Tweet Text</th>
                <th className="pb-3 font-semibold font-mono text-xs">Original Author</th>
                <th className="pb-3 font-semibold font-mono text-xs">Label</th>
                <th className="pb-3 font-semibold font-mono text-xs">Engagements</th>
                <th className="pb-3 font-semibold font-mono text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted/30">
              {filteredTweets.map((tweet) => (
                <tr
                  key={tweet.id}
                  onClick={() => navigate(`/?tweet=${tweet.id}`)}
                  className="hover:bg-border-muted/10 cursor-pointer transition-colors group"
                >
                  <td className="py-4 font-mono text-xs text-accent-gold font-bold">
                    {tweet.dataset}
                  </td>
                  <td className="py-4 pr-6 max-w-sm sm:max-w-md lg:max-w-lg">
                    <div className="text-text-primary line-clamp-2 leading-relaxed">
                      {tweet.text}
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs text-text-secondary">
                    @{tweet.user_screen_name}
                  </td>
                  <td className="py-4">
                    <LabelBadge label={tweet.label} size="sm" showDot={false} />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" /> {tweet.retweet_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {tweet.reply_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-text-muted" /> {tweet.cascade_depth}d
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      Analyze <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTweets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-mono text-text-muted">
                    No claims match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
