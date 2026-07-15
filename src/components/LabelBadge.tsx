import React from 'react';
import type { Label } from '../types';

interface LabelBadgeProps {
  label: Label;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const CONFIG: Record<Label, { text: string; bg: string; border: string; textCol: string; dotCol: string }> = {
  'rumor': {
    text: 'Rumor',
    bg: 'bg-signal-rumorMuted',
    border: 'border-signal-rumor/30',
    textCol: 'text-signal-rumor',
    dotCol: 'bg-signal-rumor'
  },
  'non-rumor': {
    text: 'Non-Rumor',
    bg: 'bg-signal-nonRumorMuted',
    border: 'border-signal-nonRumor/30',
    textCol: 'text-signal-nonRumor',
    dotCol: 'bg-signal-nonRumor'
  },
  'unverified': {
    text: 'Unverified',
    bg: 'bg-signal-unverifiedMuted',
    border: 'border-signal-unverified/30',
    textCol: 'text-signal-unverified',
    dotCol: 'bg-signal-unverified'
  }
};

export const LabelBadge: React.FC<LabelBadgeProps> = ({ label, size = 'md', showDot = true }) => {
  const cfg = CONFIG[label] || CONFIG['unverified'];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-mono',
    md: 'px-3 py-1 text-sm font-mono',
    lg: 'px-4 py-1.5 text-base font-mono font-medium'
  };

  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.textCol} ${sizeClasses[size]}`}>
      {showDot && (
        <span className={`rounded-full animate-pulse ${cfg.dotCol} ${dotSizeClasses[size]}`} />
      )}
      {cfg.text}
    </span>
  );
};
