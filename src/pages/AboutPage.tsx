import React from 'react';
import {
  Info, Cpu, Network, Database, Layers, GitBranch
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      
      {/* Introduction Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3 text-accent-gold">
          <Info className="h-6 w-6" />
          <h3 className="text-base font-bold uppercase tracking-wider font-mono">Project Objective</h3>
        </div>
        
        <p className="text-sm text-text-secondary leading-relaxed">
          <strong>RumorLens</strong> is an analyst-grade demonstration platform designed to illustrate how integrating <strong>structural propagation cascades (network features)</strong> with <strong>linguistic content (text embeddings)</strong> yields superior rumor detection accuracy compared to standard NLP models alone.
        </p>

        <p className="text-sm text-text-secondary leading-relaxed">
          In social networks, rumors do not merely possess suspicious text; they spread differently. Rumors cascade rapidly through dense, isolated clusters (echo chambers) comprised mostly of unverified, low-follower accounts. Authentic news, conversely, branches widely but remains shallow, supported by high ratios of verified hubs. RumorLens exposes these signals.
        </p>
      </div>

      {/* SVG Neural Network Architecture Diagram */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-primary flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent-gold" /> Neural Fusion Architecture
          </h3>
          <p className="text-xs text-text-secondary mt-1">Schematic layout of the dual-signal deep neural network</p>
        </div>

        {/* SVG Schematic */}
        <div className="bg-background-base p-4 rounded-xl border border-border-muted overflow-x-auto flex justify-center">
          <svg width="680" height="340" viewBox="0 0 680 340" fill="none" className="min-w-[680px]">
            {/* Background Grid Lines */}
            <line x1="100" y1="30" x2="100" y2="310" stroke="#22252B" strokeDasharray="3 3" />
            <line x1="260" y1="30" x2="260" y2="310" stroke="#22252B" strokeDasharray="3 3" />
            <line x1="420" y1="30" x2="420" y2="310" stroke="#22252B" strokeDasharray="3 3" />
            <line x1="560" y1="30" x2="560" y2="310" stroke="#22252B" strokeDasharray="3 3" />

            {/* Inputs Label */}
            <text x="100" y="25" fill="#5A5E67" fontSize="10" fontFamily="monospace" textAnchor="middle">INPUT LAYER</text>
            <text x="260" y="25" fill="#5A5E67" fontSize="10" fontFamily="monospace" textAnchor="middle">ENCODING LAYER</text>
            <text x="420" y="25" fill="#5A5E67" fontSize="10" fontFamily="monospace" textAnchor="middle">FUSION LAYER</text>
            <text x="560" y="25" fill="#5A5E67" fontSize="10" fontFamily="monospace" textAnchor="middle">OUTPUT</text>

            {/* BRANCH 1: TEXT SIGNAL */}
            {/* Input Box 1 */}
            <rect x="20" y="55" width="160" height="40" rx="6" fill="#131519" stroke="#22252B" strokeWidth="1.5" />
            <text x="100" y="78" fill="#ECEDEE" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Raw Tweet Text</text>
            
            {/* Arrow */}
            <path d="M180 75 L220 75" stroke="#E8B23D" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* BiLSTM Encoding Box */}
            <rect x="220" y="55" width="80" height="80" rx="6" fill="rgba(232,178,61,0.06)" stroke="#E8B23D" strokeWidth="1.5" />
            <text x="260" y="92" fill="#E8B23D" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">BiLSTM</text>
            <text x="260" y="108" fill="#8E939E" fontSize="9" fontFamily="monospace" textAnchor="middle">Word Embs</text>

            {/* BRANCH 2: GRAPH PROPAGATION SIGNAL */}
            {/* Input Box 2 */}
            <rect x="20" y="215" width="160" height="60" rx="6" fill="#131519" stroke="#22252B" strokeWidth="1.5" />
            <text x="100" y="235" fill="#ECEDEE" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Propagation Tree</text>
            <text x="100" y="252" fill="#8E939E" fontSize="9" fontFamily="monospace" textAnchor="middle">Depth, Density, Ratios</text>

            {/* Arrow */}
            <path d="M180 245 L220 245" stroke="#8F48E5" strokeWidth="1.5" />

            {/* Graph Features Box */}
            <rect x="220" y="205" width="80" height="80" rx="6" fill="rgba(143,72,229,0.06)" stroke="#8F48E5" strokeWidth="1.5" />
            <text x="260" y="242" fill="#B882FF" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Graph MLP</text>
            <text x="260" y="258" fill="#8E939E" fontSize="9" fontFamily="monospace" textAnchor="middle">NetworkX</text>

            {/* FUSION AND DENSE LAYERS */}
            {/* Arrow from BiLSTM */}
            <path d="M300 95 L370 145" stroke="#E8B23D" strokeWidth="1.5" strokeDasharray="2,2" />
            
            {/* Arrow from Graph MLP */}
            <path d="M300 245 L370 175" stroke="#8F48E5" strokeWidth="1.5" strokeDasharray="2,2" />

            {/* Fusion Concatenate Node */}
            <rect x="370" y="130" width="100" height="60" rx="6" fill="#131519" stroke="#22252B" strokeWidth="1.5" />
            <text x="420" y="158" fill="#ECEDEE" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Feature Fusion</text>
            <text x="420" y="174" fill="#8E939E" fontSize="9" fontFamily="monospace" textAnchor="middle">Concatenation</text>

            {/* Arrow from Fusion to Dense */}
            <path d="M470 160 L510 160" stroke="#3DD68C" strokeWidth="1.5" />

            {/* Output Softmax Classifier */}
            <rect x="510" y="130" width="100" height="60" rx="6" fill="rgba(61,214,140,0.06)" stroke="#3DD68C" strokeWidth="1.5" />
            <text x="560" y="155" fill="#3DD68C" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Dense Softmax</text>
            <text x="560" y="172" fill="#8E939E" fontSize="8" fontFamily="monospace" textAnchor="middle">3-Way Output</text>

            {/* Output Branches */}
            <path d="M610 150 L640 120" stroke="#E5484D" strokeWidth="1.5" />
            <path d="M610 160 L645 160" stroke="#3DD68C" strokeWidth="1.5" />
            <path d="M610 170 L640 200" stroke="#E8B23D" strokeWidth="1.5" />

            <text x="645" y="115" fill="#E5484D" fontSize="9" fontFamily="monospace" fontWeight="bold">RUMOR</text>
            <text x="650" y="163" fill="#3DD68C" fontSize="9" fontFamily="monospace" fontWeight="bold">NON-RUMOR</text>
            <text x="645" y="205" fill="#E8B23D" fontSize="9" fontFamily="monospace" fontWeight="bold">UNVERIFIED</text>

            {/* Definitions marker definition for arrowheads */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#E8B23D" />
              </marker>
            </defs>
          </svg>
        </div>

      </div>

      {/* Dataset & Benchmarks Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PHEME */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-accent-gold font-mono font-bold text-xs uppercase">
            <Database className="h-4 w-4" /> PHEME Dataset
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Focuses on breaking rumor threads across major events (e.g., Munich shooting, Ottawa shooting, Charlie Hebdo). Annotations include temporal reply threads classified as rumors or non-rumors.
          </p>
        </div>

        {/* Twitter15 */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-accent-gold font-mono font-bold text-xs uppercase">
            <GitBranch className="h-4 w-4" /> Twitter15
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Consists of rumor propagation trees collected during 2015. Categorized into 4 labels: True Rumor, False Rumor, Unverified, and Non-Rumor, providing a rich testing ground for structural models.
          </p>
        </div>

        {/* Twitter16 */}
        <div className="bg-background-surface border border-border-muted p-5 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-accent-gold font-mono font-bold text-xs uppercase">
            <Cpu className="h-4 w-4" /> Twitter16
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            An updated cohort following Twitter15's schema, capturing subsequent rumor cycles in 2016. Used to validate the model's performance on shifted, newer event distributions.
          </p>
        </div>

      </div>

      {/* Tech Stack Details */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-primary flex items-center gap-2">
          <Cpu className="h-5 w-5 text-accent-gold" /> System Specifications
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-text-secondary">
          <div className="p-3 bg-background-base rounded-lg border border-border-muted">
            <strong className="text-text-primary">Backend Layer:</strong>
            <ul className="list-disc pl-4 mt-1.5 space-y-1">
              <li>Python 3.11 + FastAPI</li>
              <li>NetworkX (Graph metric calculations)</li>
              <li>Keras / PyTorch (BiLSTM branch inference)</li>
            </ul>
          </div>
          
          <div className="p-3 bg-background-base rounded-lg border border-border-muted">
            <strong className="text-text-primary">Frontend Layer:</strong>
            <ul className="list-disc pl-4 mt-1.5 space-y-1">
              <li>React 18 + TypeScript + Vite</li>
              <li>Tailwind CSS (Visual Design System)</li>
              <li>D3.js (Force-Directed Graph layouts)</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
