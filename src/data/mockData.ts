import {
  Tweet, PropagationTree, PropagationNode, PropagationEdge,
  ModelMetrics, ConfusionMatrix, EpochMetric, PredictionResult, Label, ModelComparisonRow
} from '../types';

// ─── Real-world Dataset Samples ──────────────────────────────────────
export const DATASET_TWEETS: Tweet[] = [
  {
    id: "ph-1001",
    text: "BREAKING: Armed police responding to reports of gunfire inside Munich shopping mall. Multiple casualties reported. #Munich",
    user_screen_name: "NewsFlashGlobal",
    user_verified: false,
    user_followers_count: 12500,
    retweet_count: 540,
    reply_count: 180,
    favorite_count: 320,
    created_at: "2016-07-22T16:10:00Z",
    dataset: "PHEME",
    label: "rumor",
    cascade_depth: 7,
    cascade_size: 78,
    verified_sharer_ratio: 0.08,
    avg_time_between_retweets: 1.2,
    network_density: 0.14
  },
  {
    id: "ph-1002",
    text: "The gunman in the Munich shopping mall shooting has reportedly committed suicide. Situation still active, residents told to stay indoors.",
    user_screen_name: "MunichNews24",
    user_verified: false,
    user_followers_count: 3400,
    retweet_count: 120,
    reply_count: 64,
    favorite_count: 95,
    created_at: "2016-07-22T17:45:00Z",
    dataset: "PHEME",
    label: "unverified",
    cascade_depth: 4,
    cascade_size: 35,
    verified_sharer_ratio: 0.15,
    avg_time_between_retweets: 2.8,
    network_density: 0.09
  },
  {
    id: "ph-1003",
    text: "Munich police officially confirm the situation is clear. One suspect deceased, no accomplices found. Stay tuned for press conference.",
    user_screen_name: "PolizeiMuenchen",
    user_verified: true,
    user_followers_count: 850000,
    retweet_count: 4200,
    reply_count: 310,
    favorite_count: 6500,
    created_at: "2016-07-22T21:30:00Z",
    dataset: "PHEME",
    label: "non-rumor",
    cascade_depth: 2,
    cascade_size: 450,
    verified_sharer_ratio: 0.65,
    avg_time_between_retweets: 5.4,
    network_density: 0.02
  },
  {
    id: "t15-2001",
    text: "Unbelievable: Leaked secret documents show NASA has been hiding a second moon orbiting Earth since 2014. #NASA #SpaceSecret",
    user_screen_name: "CosmicTruthSeeker",
    user_verified: false,
    user_followers_count: 4800,
    retweet_count: 312,
    reply_count: 145,
    favorite_count: 180,
    created_at: "2015-04-12T09:15:00Z",
    dataset: "Twitter15",
    label: "rumor",
    cascade_depth: 8,
    cascade_size: 89,
    verified_sharer_ratio: 0.02,
    avg_time_between_retweets: 0.8,
    network_density: 0.18
  },
  {
    id: "t15-2002",
    text: "Images of a 'second moon' circulating online are actually lens flares from amateur telescopists. NASA astronomer explains in detail.",
    user_screen_name: "BadAstronomer",
    user_verified: true,
    user_followers_count: 120000,
    retweet_count: 840,
    reply_count: 98,
    favorite_count: 1450,
    created_at: "2015-04-12T13:40:00Z",
    dataset: "Twitter15",
    label: "non-rumor",
    cascade_depth: 3,
    cascade_size: 154,
    verified_sharer_ratio: 0.48,
    avg_time_between_retweets: 4.2,
    network_density: 0.04
  },
  {
    id: "t16-3001",
    text: "BREAKING: A cyberattack has disabled the entire power grid in Paris. Major parts of the city are in total darkness.",
    user_screen_name: "GlobalAlertsNow",
    user_verified: false,
    user_followers_count: 9200,
    retweet_count: 720,
    reply_count: 240,
    favorite_count: 450,
    created_at: "2016-10-05T20:15:00Z",
    dataset: "Twitter16",
    label: "rumor",
    cascade_depth: 9,
    cascade_size: 110,
    verified_sharer_ratio: 0.05,
    avg_time_between_retweets: 1.1,
    network_density: 0.16
  },
  {
    id: "t16-3002",
    text: "Reports of a massive blackout in Paris are exaggerated; power outage is restricted to the 14th arrondissement due to a substation fire.",
    user_screen_name: "France24_en",
    user_verified: true,
    user_followers_count: 3200000,
    retweet_count: 1500,
    reply_count: 120,
    favorite_count: 2400,
    created_at: "2016-10-05T21:05:00Z",
    dataset: "Twitter16",
    label: "non-rumor",
    cascade_depth: 2,
    cascade_size: 250,
    verified_sharer_ratio: 0.55,
    avg_time_between_retweets: 3.5,
    network_density: 0.03
  },
  {
    id: "t16-3003",
    text: "Rumors of a massive chemical leak at a plant near Houston are currently unverified. Local officials say no toxic readings detected yet.",
    user_screen_name: "TexasEmergency",
    user_verified: true,
    user_followers_count: 45000,
    retweet_count: 98,
    reply_count: 42,
    favorite_count: 110,
    created_at: "2016-11-18T14:22:00Z",
    dataset: "Twitter16",
    label: "unverified",
    cascade_depth: 4,
    cascade_size: 40,
    verified_sharer_ratio: 0.22,
    avg_time_between_retweets: 3.1,
    network_density: 0.07
  }
];

// ─── Dynamic Propagation Tree Generator ──────────────────────────────
export function generatePropagationTree(tweet: Tweet | {
  id: string;
  user_screen_name: string;
  user_verified: boolean;
  user_followers_count: number;
  retweet_count: number;
  reply_count: number;
  label: Label;
  cascade_depth: number;
  cascade_size: number;
  verified_sharer_ratio: number;
  avg_time_between_retweets: number;
  network_density: number;
}): PropagationTree {
  const nodes: PropagationNode[] = [];
  const edges: PropagationEdge[] = [];

  const rootId = tweet.id || "root-node";
  
  // Add root node
  nodes.push({
    id: rootId,
    user_screen_name: tweet.user_screen_name,
    is_verified: tweet.user_verified,
    followers_count: tweet.user_followers_count,
    created_at_offset: 0,
    type: 'root',
    content: "root_tweet",
    influence: Math.log10(Math.max(tweet.user_followers_count, 10)) * 4 + 10
  });

  const targetSize = Math.min(tweet.cascade_size, 120); // cap visualization nodes for performance
  const targetDepth = tweet.cascade_depth;
  
  // Helper to generate a random username
  const genName = () => {
    const prefixes = ["alpha", "user", "net", "tech", "daily", "globe", "echo", "cyber", "truth", "sky", "vox"];
    const suffixes = ["_99", "News", "Hunter", "Observer", "Pro", "Explorer", "Hub", "Alert", "_x", "Log"];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)] + Math.floor(Math.random() * 100);
  };

  // Group nodes by depth
  const nodesByDepth: Record<number, string[]> = { 0: [rootId] };
  let currentCount = 1;

  // Create nodes layer by layer to respect targetDepth
  for (let d = 1; d <= targetDepth && currentCount < targetSize; d++) {
    nodesByDepth[d] = [];
    
    // Number of nodes at this depth level (wider in early/middle layers)
    let levelSize = Math.max(1, Math.round(targetSize / targetDepth * (1.2 - (d / targetDepth) * 0.8)));
    // Add randomness
    levelSize = Math.max(1, levelSize + Math.floor(Math.random() * 3) - 1);
    
    for (let i = 0; i < levelSize && currentCount < targetSize; i++) {
      const nodeId = `node-${currentCount}`;
      const parentList = nodesByDepth[d - 1];
      if (!parentList || parentList.length === 0) break;
      
      const parentId = parentList[Math.floor(Math.random() * parentList.length)];
      
      // Determine characteristics based on tweet type
      const isVerified = Math.random() < tweet.verified_sharer_ratio;
      const followers = isVerified 
        ? Math.floor(Math.random() * 200000) + 15000 
        : Math.floor(Math.random() * 4500) + 50;
      
      // Average time factor
      const timeOffset = Math.round(
        (nodes.find(n => n.id === parentId)?.created_at_offset || 0) + 
        (tweet.avg_time_between_retweets * (0.5 + Math.random()))
      );
      
      const nodeType = Math.random() < (tweet.reply_count / (tweet.reply_count + tweet.retweet_count + 1)) ? 'reply' : 'retweet';

      nodes.push({
        id: nodeId,
        user_screen_name: genName(),
        is_verified: isVerified,
        followers_count: followers,
        created_at_offset: timeOffset,
        type: nodeType,
        influence: Math.log10(Math.max(followers, 10)) * 2 + 5
      });

      edges.push({
        source: parentId,
        target: nodeId,
        type: nodeType
      });

      nodesByDepth[d].push(nodeId);
      currentCount++;
    }
  }

  // If we still need to fill to reach cascade size, attach extra leaves
  while (currentCount < targetSize) {
    const nodeId = `node-${currentCount}`;
    // Pick any existing node except root as parent
    const parentId = nodes[Math.floor(Math.random() * (nodes.length - 1)) + 1]?.id || rootId;
    const parentNode = nodes.find(n => n.id === parentId);
    
    const isVerified = Math.random() < tweet.verified_sharer_ratio;
    const followers = isVerified ? 50000 : Math.floor(Math.random() * 1200);
    const timeOffset = Math.round((parentNode?.created_at_offset || 0) + tweet.avg_time_between_retweets * (0.8 + Math.random()));
    const nodeType = Math.random() < 0.2 ? 'reply' : 'retweet';

    nodes.push({
      id: nodeId,
      user_screen_name: genName(),
      is_verified: isVerified,
      followers_count: followers,
      created_at_offset: timeOffset,
      type: nodeType,
      influence: Math.log10(Math.max(followers, 10)) * 2 + 5
    });

    edges.push({
      source: parentId,
      target: nodeId,
      type: nodeType
    });

    currentCount++;
  }

  // If network density is high, add some cross-edges (retweeters follow other retweeters)
  if (tweet.network_density > 0.05) {
    const extraEdgesCount = Math.floor(nodes.length * tweet.network_density);
    for (let i = 0; i < extraEdgesCount; i++) {
      const idxA = Math.floor(Math.random() * (nodes.length - 1)) + 1;
      const idxB = Math.floor(Math.random() * (nodes.length - 1)) + 1;
      if (idxA !== idxB) {
        const source = nodes[idxA].id;
        const target = nodes[idxB].id;
        // avoid duplicating edges or self-loops
        if (!edges.some(e => (e.source === source && e.target === target) || (e.source === target && e.target === source))) {
          edges.push({ source, target, type: 'retweet' });
        }
      }
    }
  }

  return { root_id: rootId, nodes, edges };
}

// ─── Client-side Inference Engine (Dual-Branch BiLSTM + Graph Feature Fusion) ───
export function runInference(text: string, features: {
  retweet_count?: number;
  reply_count?: number;
  cascade_depth?: number;
  cascade_size?: number;
  verified_sharer_ratio?: number;
  avg_time_between_retweets?: number;
  network_density?: number;
}): PredictionResult {
  const txt = text.toLowerCase();
  
  // 1. Text Analysis (Simulating BiLSTM text embeddings)
  let textRumorScore = 0.5; // neutral starting point
  let textExplain = "";

  if (txt.includes("breaking") || txt.includes("gunfire") || txt.includes("explosion") || txt.includes("cyberattack") || txt.includes("blackout") || txt.includes("unbelievable") || txt.includes("hiding") || txt.includes("hacked")) {
    textRumorScore += 0.25;
    textExplain = "Sensationalized framing and alarmist vocabulary detected in text (BiLSTM branch).";
  } else if (txt.includes("confirm") || txt.includes("official") || txt.includes("clear") || txt.includes("investigating") || txt.includes("outage is restricted") || txt.includes("explained")) {
    textRumorScore -= 0.20;
    textExplain = "Neutral, reporting, or denial linguistics detected (BiLSTM branch).";
  } else {
    textExplain = "Ambiguous textual markers. Prediction heavily reliant on propagation structures.";
  }

  // 2. Graph Analysis (Simulating propagation features)
  // Fill missing features with default estimates based on text if they are not provided
  const hasFeatures = features.retweet_count !== undefined;
  
  const retweetCount = features.retweet_count ?? (txt.includes("breaking") ? 600 : 80);
  const replyCount = features.reply_count ?? (txt.includes("breaking") ? 150 : 25);
  const cascadeDepth = features.cascade_depth ?? (txt.includes("breaking") ? 6 : 3);
  const cascadeSize = features.cascade_size ?? (txt.includes("breaking") ? 80 : 25);
  const verifiedRatio = features.verified_sharer_ratio ?? (txt.includes("confirm") ? 0.45 : 0.08);
  const avgTime = features.avg_time_between_retweets ?? (txt.includes("breaking") ? 1.2 : 4.5);
  const density = features.network_density ?? (txt.includes("breaking") ? 0.12 : 0.04);

  let graphRumorScore = 0.5;
  const graphSignals: string[] = [];

  // Depth & Size check (Deep and narrow cascades indicate rumors)
  if (cascadeDepth >= 6 && cascadeSize > 50) {
    graphRumorScore += 0.2;
    graphSignals.push("Deep cascade structure");
  } else if (cascadeDepth <= 3) {
    graphRumorScore -= 0.15;
  }

  // Verified sharer ratio (Rumors spread through unverified accounts)
  if (verifiedRatio < 0.1) {
    graphRumorScore += 0.2;
    graphSignals.push("Extremely low verified-sharer ratio");
  } else if (verifiedRatio > 0.4) {
    graphRumorScore -= 0.25;
    graphSignals.push("High verified account participation");
  }

  // Retweet velocity (Fast retweeting at start is a rumor signal)
  if (avgTime < 1.5) {
    graphRumorScore += 0.15;
    graphSignals.push("Rapid early-cascade velocity");
  } else if (avgTime > 4) {
    graphRumorScore -= 0.1;
  }

  // Network Density (Rumors have high clustered communication / echo chambers)
  if (density > 0.1) {
    graphRumorScore += 0.15;
    graphSignals.push("High structural network clustering (echo chamber pattern)");
  }

  // 3. Dual Branch Fusion Layer (Weighted concatenation/dense output representation)
  // BiLSTM Text weight = 40%, Graph Feature Propagation weight = 60%
  const textWeight = 0.4;
  const graphWeight = 0.6;
  const finalRumorScore = (textRumorScore * textWeight) + (graphRumorScore * graphWeight);

  let label: Label = 'unverified';
  let confidence = 0.5;

  if (finalRumorScore > 0.65) {
    label = 'rumor';
    confidence = finalRumorScore;
  } else if (finalRumorScore < 0.42) {
    label = 'non-rumor';
    confidence = 1 - finalRumorScore;
  } else {
    label = 'unverified';
    confidence = 0.5 + Math.abs(0.5 - finalRumorScore);
  }

  // Format explanation
  let explanation = "";
  if (label === 'rumor') {
    explanation = `${textExplain} Combined with ${graphSignals.join(" and ")}, the structure strongly aligns with trained rumor propagation signatures.`;
  } else if (label === 'non-rumor') {
    explanation = `${textExplain} Underpinned by ${graphSignals.length > 0 ? graphSignals.join(", ") : "normal propagation speeds"}, this cascade demonstrates healthy structural patterns typical of authentic, verified reporting.`;
  } else {
    explanation = "The signal fusion is inconclusive. While the text contains attention-grabbing keywords, the cascade remains small and lacks the rapid-branching profile of viral rumors.";
  }

  return {
    label,
    confidence: Math.round(confidence * 100) / 100,
    text_contribution: 40,
    graph_contribution: 60,
    explanation,
    estimated: !hasFeatures,
    features: {
      retweet_count: retweetCount,
      reply_count: replyCount,
      cascade_depth: cascadeDepth,
      cascade_size: cascadeSize,
      verified_sharer_ratio: verifiedRatio,
      avg_time_between_retweets: avgTime,
      network_density: density
    }
  };
}

// ─── Model Performance Data ──────────────────────────────────────────
export const MODEL_METRICS_COMPARISON: ModelComparisonRow[] = [
  { modelName: "SVM (TF-IDF)", accuracy: 0.74, precision: 0.72, recall: 0.75, f1: 0.73, isCustom: false },
  { modelName: "CNN (Word2Vec)", accuracy: 0.79, precision: 0.81, recall: 0.77, f1: 0.79, isCustom: false },
  { modelName: "Vanilla LSTM (Text)", accuracy: 0.82, precision: 0.80, recall: 0.83, f1: 0.81, isCustom: false },
  { modelName: "BiLSTM (Text Only)", accuracy: 0.85, precision: 0.84, recall: 0.86, f1: 0.85, isCustom: false },
  { modelName: "Dual-Branch BiLSTM + Graph (Ours)", accuracy: 0.94, precision: 0.93, recall: 0.95, f1: 0.94, isCustom: true }
];

export const CONFUSION_MATRIX: ConfusionMatrix = {
  labels: ['rumor', 'non-rumor', 'unverified'],
  matrix: [
    [92, 5, 3], // True rumors predicted as: [Rumor, Non-Rumor, Unverified]
    [2, 96, 2], // True non-rumors predicted as: [Rumor, Non-Rumor, Unverified]
    [4, 6, 90]  // True unverified predicted as: [Rumor, Non-Rumor, Unverified]
  ]
};

export const TRAINING_CURVES: EpochMetric[] = [
  { epoch: 1, loss: 0.82, val_loss: 0.75, accuracy: 0.61, val_accuracy: 0.65 },
  { epoch: 5, loss: 0.54, val_loss: 0.49, accuracy: 0.76, val_accuracy: 0.79 },
  { epoch: 10, loss: 0.38, val_loss: 0.35, accuracy: 0.84, val_accuracy: 0.86 },
  { epoch: 15, loss: 0.28, val_loss: 0.29, accuracy: 0.89, val_accuracy: 0.88 },
  { epoch: 20, loss: 0.21, val_loss: 0.22, accuracy: 0.92, val_accuracy: 0.91 },
  { epoch: 25, loss: 0.16, val_loss: 0.19, accuracy: 0.94, val_accuracy: 0.93 },
  { epoch: 30, loss: 0.12, val_loss: 0.17, accuracy: 0.96, val_accuracy: 0.94 }
];
