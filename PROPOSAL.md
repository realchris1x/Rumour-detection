# Project Proposal

## Title
**Rumor Detection on Twitter Using Bidirectional LSTM with Graph-Based Propagation Features**

---

## 1. Problem Statement

Unverified rumors spread rapidly on social media platforms like Twitter, often causing public panic, misinformation, and real-world harm before fact-checking agencies can respond. The challenge is not only to distinguish rumors from verified news, but to do so **early** — ideally within the first few minutes or hours of a rumor's lifecycle, when intervention is still impactful.

Existing detection systems either rely solely on **text content** (missing the behavioral and structural signals in how content spreads) or require **full propagation trees** that only become available long after a rumor has already gone viral. This project addresses both limitations.

---

## 2. Objectives

- Build a **dual-branch deep learning model** that jointly models textual content and propagation behavior of tweets.
- Implement a **Bidirectional LSTM (BiLSTM)** for sequential modeling of both tweet text and time-ordered cascade events.
- Extract **graph-based propagation features** (spread speed, tree depth, user credibility, branching pattern) from retweet/reply cascades and encode them as a time-ordered feature sequence.
- Use **attention pooling** on both branches to identify which text tokens and which cascade moments are most diagnostic.
- Classify each story into four categories: **Non-Rumor / True Rumor / False Rumor / Unverified Rumor**.
- Evaluate detection performance as a function of time since posting (**early-detection curve**) — the primary result.

---

## 3. Motivation

| Challenge | Why It Matters |
|---|---|
| Speed of spread | False rumors travel 6× faster than true news (Vosoughi et al., *Science*, 2018) |
| Text alone is insufficient | Rumors and non-rumors often use similar language; structural signals break the tie |
| Early detection gap | Most systems need full propagation history; early detection with partial data is unsolved |
| Class imbalance & veracity | Multi-class veracity (true/false/unverified) is harder than binary but more useful |

---

## 4. Proposed Architecture

```
Tweet Text Tokens ──► Embedding Layer
                            │
                       BiLSTM (text)
                            │
                    Attention Pooling ──────────────────────────┐
                                                                 │
                                                           Concatenate
                                                                 │
Propagation Events ──► Feature Extraction (7-dim per event)    │
  (time delay,              │                             Dense (64, ReLU)
   tree depth,         BiLSTM (propagation)                     │
   followers,               │                               Dropout (0.4)
   account age,     Attention Pooling ─────────────────────────┘
   verified,                                                     │
   type)                                                   Softmax (4 classes)
```

**Propagation feature vector (7 dimensions per cascade event):**

| # | Feature | Encoding |
|---|---|---|
| 1 | Time since source post | log(1 + delay\_min) |
| 2 | Depth in propagation tree | depth / max\_depth |
| 3 | Is retweet | binary |
| 4 | Is reply | binary |
| 5 | Follower count | log(1 + followers) |
| 6 | Account age | log(1 + age\_days) |
| 7 | Verified status | binary |

---

## 5. Dataset

| Dataset | Stories | Labels | Source |
|---|---|---|---|
| **PHEME** | ~330 threads / 9 events | rumour / non-rumour + veracity | Zubiaga et al., 2016 |
| **Twitter15** | 1,490 source tweets | true / false / unverified / non-rumor | Liu et al., 2015 |
| **Twitter16** | 818 source tweets | true / false / unverified / non-rumor | Liu et al., 2016 |

Primary dataset: **PHEME** (for cross-event generalization testing via event-leave-one-out evaluation).
Synthetic dataset is provided for pipeline validation without requiring the real download.

---

## 6. Evaluation Methodology

### 6.1 Standard Metrics
- Per-class Precision, Recall, F1-Score
- Macro-averaged F1 (primary metric, standard in literature)
- Confusion matrix

### 6.2 Early Detection Curve (Headline Result)
Re-run inference at cascade truncation points: **15 min, 30 min, 1 hr, 3 hr, 6 hr, 12 hr, 24 hr** after the source tweet was posted. Plot Macro-F1 vs. time (log scale) to show how quickly the model can confidently detect rumors.

### 6.3 Ablation Study
Compare:
- Text-only BiLSTM (no propagation branch)
- Propagation-only BiLSTM (no text branch)
- **Full dual-branch model (proposed)**

---

## 7. Technology Stack

| Component | Tool |
|---|---|
| Deep Learning | TensorFlow 2.x / Keras |
| Text Tokenization | Keras Tokenizer (GloVe embeddings, future) |
| Graph Feature Extraction | Python + NetworkX |
| Evaluation & Visualization | scikit-learn, Matplotlib |
| Notebook | Jupyter |
| Version Control | GitHub |

---

## 8. Expected Outcomes

- A functional BiLSTM model achieving competitive Macro-F1 on PHEME/Twitter15/16 benchmarks.
- An early-detection curve demonstrating reasonable performance at the 30–60 minute detection window.
- An ablation table confirming the propagation branch contribution over text-only baseline.
- Reproducible codebase with synthetic data generator for running without the real dataset.

---

## 9. Timeline

| Week | Milestone |
|---|---|
| 1 | Dataset download, preprocessing pipeline, synthetic data generator |
| 2 | Text branch (BiLSTM + attention) implementation and baseline training |
| 3 | Propagation feature extraction, second BiLSTM branch, fusion layer |
| 4 | Full training on PHEME, early-detection evaluation, ablation study |
| 5 | Report writing, GitHub documentation, final submission |

---

## 10. References

1. Zubiaga, A. et al. (2016). *Analysing How People Orient to and Spread Rumours in Social Media by Looking at Conversational Threads.* PLOS ONE.
2. Vosoughi, S., Roy, D., & Aral, S. (2018). *The spread of true and false news online.* Science, 359(6380), 1146–1151.
3. Bian, T. et al. (2020). *Rumor Detection on Social Media with Bi-Directional Graph Convolutional Networks.* AAAI.
4. Liu, X. et al. (2015). *Real-time Rumor Debunking on Twitter.* CIKM.
5. Kochkina, E. et al. (2018). *All-in-one: Multi-task Learning for Rumour Verification.* COLING.
