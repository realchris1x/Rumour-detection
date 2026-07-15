export type Label = 'rumor' | 'non-rumor' | 'unverified';

export interface Tweet {
  id: string;
  text: string;
  user_screen_name: string;
  user_verified: boolean;
  user_followers_count: number;
  retweet_count: number;
  reply_count: number;
  favorite_count: number;
  created_at: string;
  dataset: 'PHEME' | 'Twitter15' | 'Twitter16';
  label: Label;
  
  // Propagation Graph features
  cascade_depth: number;
  cascade_size: number;
  verified_sharer_ratio: number;
  avg_time_between_retweets: number; // in minutes
  network_density: number; // graph metric
}

export interface PropagationNode {
  id: string;
  user_screen_name: string;
  is_verified: boolean;
  followers_count: number;
  created_at_offset: number; // minutes after root tweet
  type: 'root' | 'retweet' | 'reply';
  content?: string;
  influence: number; // calculated size factor
}

export interface PropagationEdge {
  source: string;
  target: string;
  type: 'retweet' | 'reply';
}

export interface PropagationTree {
  root_id: string;
  nodes: PropagationNode[];
  edges: PropagationEdge[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ModelComparisonRow {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  isCustom: boolean;
}

export interface ConfusionMatrix {
  labels: Label[];
  matrix: number[][]; // 3x3 matrix mapping counts
}

export interface EpochMetric {
  epoch: number;
  loss: number;
  val_loss: number;
  accuracy: number;
  val_accuracy: number;
}

export interface PredictionResult {
  tweet_id?: string;
  label: Label;
  confidence: number; // 0 to 1
  text_contribution: number; // e.g. 35 (%)
  graph_contribution: number; // e.g. 65 (%)
  explanation: string;
  estimated: boolean;
  features: {
    retweet_count: number;
    reply_count: number;
    cascade_depth: number;
    cascade_size: number;
    verified_sharer_ratio: number;
    avg_time_between_retweets: number;
    network_density: number;
  };
}

export interface HistoryRun {
  id: string;
  timestamp: string;
  text: string;
  label: Label;
  confidence: number;
  estimated: boolean;
  source: 'paste' | 'dataset' | 'batch';
}
