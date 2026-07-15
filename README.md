# 🔍 Rumor Detection on Twitter
### Bidirectional LSTM with Graph-Based Propagation Features

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-orange?logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Domain](https://img.shields.io/badge/Domain-NLP%20%7C%20Social%20Media-purple)

> **Detect rumors early** by jointly modeling *what was said* (tweet text) and *how it spread* (propagation cascade structure) using a dual-branch Bidirectional LSTM with attention fusion.

---

## 📌 Overview

Unverified rumors on Twitter cause real-world harm before fact-checkers can respond. This project builds a model that catches rumors in the **first 30–60 minutes** — long before full propagation data is available — by reading both the source tweet text and the evolving cascade of retweets/replies as complementary signals.

### Key idea
False rumors spread **faster**, **deeper**, and through **lower-credibility accounts** than verified news (Vosoughi et al., *Science* 2018). The propagation branch encodes exactly this pattern as a learned feature, rather than hand-engineering it.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RumorDetectionBiLSTM                            │
│                                                                     │
│  Tweet Text Tokens                                                  │
│       │                                                             │
│  ┌────▼──────────┐      ┌───────────────────┐                      │
│  │  Embedding    │      │   Masking Layer    │                      │
│  │  (vocab, 128) │      │  (zero-pad aware)  │                      │
│  └────┬──────────┘      └────────┬──────────┘                      │
│       │                          │                                  │
│  ┌────▼──────────┐      ┌────────▼──────────┐                      │
│  │ BiLSTM (text) │      │ BiLSTM (prop)     │                      │
│  │ 64 units/dir  │      │ 64 units/dir      │                      │
│  └────┬──────────┘      └────────┬──────────┘                      │
│       │                          │                                  │
│  ┌────▼──────────┐      ┌────────▼──────────┐                      │
│  │   Attention   │      │   Attention       │                      │
│  │   Pooling     │      │   Pooling         │                      │
│  └────┬──────────┘      └────────┬──────────┘                      │
│       │                          │                                  │
│       └──────────┬───────────────┘                                  │
│                  │                                                  │
│           ┌──────▼──────┐                                           │
│           │  Concat     │  (256-dim)                               │
│           └──────┬──────┘                                           │
│                  │                                                  │
│           ┌──────▼──────┐                                           │
│           │ Dense (64)  │  ReLU + Dropout(0.4)                     │
│           └──────┬──────┘                                           │
│                  │                                                  │
│           ┌──────▼──────┐                                           │
│           │  Softmax(4) │  → non-rumor / true / false / unverified │
│           └─────────────┘                                           │
└─────────────────────────────────────────────────────────────────────┘

  Propagation Feature Vector (7-dim per cascade event):
  ┌───────────────────────────────────────────────────────┐
  │ 1. log(1 + time_delay_min)   — how fast it spread     │
  │ 2. depth / max_depth         — how deep it reached    │
  │ 3. is_retweet (binary)       — interaction type       │
  │ 4. is_reply   (binary)       — interaction type       │
  │ 5. log(1 + followers_count)  — account reach          │
  │ 6. log(1 + account_age_days) — account credibility    │
  │ 7. verified (binary)         — platform verification  │
  └───────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
rumor_detection/
│
├── config.py                        # All hyperparameters and paths — edit here first
│
├── data/
│   ├── generate_synthetic_data.py   # Generates realistic demo data (no download needed)
│   ├── raw/                         # ← Put PHEME / Twitter15-16 downloads here
│   └── processed/                   # Auto-generated: tokenizer, splits, tensors
│
├── src/
│   ├── propagation_features.py      # cascade event → 7-dim feature vector
│   ├── data_loader.py               # load unified JSON + PHEME → unified converter
│   ├── preprocessing.py             # tokenization, padding, early-detection cutoffs
│   ├── model.py                     # dual-branch BiLSTM + attention fusion model
│   ├── train.py                     # training entry point
│   └── evaluate.py                  # full eval + early-detection F1-vs-time curve
│
├── saved_models/                    # trained .keras checkpoints land here
├── outputs/                         # early_detection_curve.png + other plots
│
├── Evaluation.ipynb                 # step-by-step notebook: train → evaluate → visualize
├── requirements.txt
├── PROPOSAL.md
└── LITERATURE_SURVEY.md
```

---

## ⚡ Quickstart

```bash
# 1. Clone and install
git clone https://github.com/<your-username>/rumor-detection-bilstm.git
cd rumor-detection-bilstm
pip install -r requirements.txt

# 2. Train (auto-generates synthetic demo data on first run)
python src/train.py --epochs 30

# 3. Evaluate + generate early-detection curve
python src/evaluate.py
```

This works immediately with no dataset download. The synthetic generator produces realistic data where false rumors spread faster and deeper than non-rumors, giving the model something genuine to learn.

---

## 📊 Datasets

| Dataset | Stories | Classes | Download |
|---|---|---|---|
| **PHEME** | ~330 threads / 9 events | rumor / non-rumor + veracity | [Figshare](https://figshare.com/articles/dataset/PHEME_dataset_for_Rumour_Detection_and_Veracity_Classification/6392078) |
| **Twitter15** | 1,490 source tweets | true / false / unverified / non-rumor | [GitHub](https://github.com/majingCUHK/Rumor_RvNN) |
| **Twitter16** | 818 source tweets | true / false / unverified / non-rumor | [GitHub](https://github.com/majingCUHK/Rumor_RvNN) |

### Using PHEME (recommended)

```bash
# Download and extract to data/raw/pheme/
python src/data_loader.py --pheme_root data/raw/pheme --out data/processed/pheme_dataset.json
python src/train.py --data data/processed/pheme_dataset.json
```

---

## 🧪 Results

### Early Detection Curve (Macro-F1 vs. Time)

The headline result: performance improves as the cascade grows. The propagation branch is what drives the improvement between t=60min and t=360min.

```
Detection window │ Avg events │ Macro-F1 │ Accuracy
─────────────────┼────────────┼──────────┼─────────
≤ 15 min         │     ~1     │  ~0.39   │  ~0.49
≤ 30 min         │     ~2     │  ~0.39   │  ~0.49
≤ 60 min         │     ~4     │  ~0.38   │  ~0.48
≤ 3 hr           │    ~12     │  ~0.52   │  ~0.57
≤ 6 hr           │    ~24     │  ~0.60   │  ~0.67
≤ 12 hr          │    ~33     │  ~0.61   │  ~0.68
≤ 24 hr          │    ~36     │  ~0.61   │  ~0.67
```
> *Results shown on synthetic demo data. Expect significantly higher numbers on PHEME / Twitter15-16.*

### Full-propagation Classification Report (4-class)

| Class | Precision | Recall | F1-Score |
|---|---|---|---|
| non-rumor | — | — | — |
| true | — | — | — |
| false | — | — | — |
| unverified | — | — | — |
| **Macro avg** | — | — | **—** |

> Fill in with your real PHEME/Twitter15-16 results after training on the actual dataset.

---

## ⚙️ Configuration

All hyperparameters live in `config.py`. Key settings:

```python
LABEL_MODE = "fourclass"       # "binary" or "fourclass"
MAX_SEQ_LEN = 60               # tokens per tweet
MAX_PROP_LEN = 50              # max propagation events per story
EMBEDDING_DIM = 128
TEXT_LSTM_UNITS = 64           # per direction (total: 128)
PROP_LSTM_UNITS = 64           # per direction
DROPOUT_RATE = 0.4
USE_ATTENTION = True           # attention pooling vs. global max pooling
EPOCHS = 30
BATCH_SIZE = 32
LEARNING_RATE = 1e-3
```

---

## 📈 Ablation Study

To run baselines and compare against the full model:

```bash
# Text-only baseline: set PROP_LSTM_UNITS=0 in config and retrain
# Propagation-only: comment out text_input in model.py and retrain
# Full model (default): python src/train.py
```

| Model Variant | Macro-F1 |
|---|---|
| Text-only BiLSTM | — |
| Propagation-only BiLSTM | — |
| **Dual-branch (proposed)** | **—** |

---

## 🔭 Future Work

- Replace the embedding layer with **BERT/RoBERTa** frozen or fine-tuned embeddings for the text branch.
- Replace the propagation BiLSTM with a **GCN/GAT** over the actual tree structure to capture branching topology.
- Add **cross-event evaluation** on PHEME (leave-one-event-out) for generalization testing.
- Visualize attention weights over the propagation timeline for interpretability.
- Add a **RumourEval 2019 stance sub-task** head for multi-task learning.

---

## 📚 Key References

- Vosoughi, Roy & Aral (2018). *The spread of true and false news online.* Science.
- Ma et al. (2016). *Detecting Rumors from Microblogs with Recurrent Neural Networks.* IJCAI.
- Bian et al. (2020). *Rumor Detection on Social Media with Bi-Directional Graph Convolutional Networks.* AAAI.
- Zubiaga et al. (2016). *Analysing How People Orient to and Spread Rumours.* PLOS ONE.
- Kochkina et al. (2018). *All-in-one: Multi-task Learning for Rumour Verification.* COLING.

See [`LITERATURE_SURVEY.md`](LITERATURE_SURVEY.md) for a full 15-paper annotated survey.

---

## 👤 Author

**Jason Paul B** — B.E. CSE (AI & ML), Sri Krishna College of Technology, Coimbatore
GitHub: [@realvchris1x](https://github.com/realvchris1x)

---


