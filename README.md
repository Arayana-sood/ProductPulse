# ProductPulse — Predictive Product & User Analytics Console

[![Live Demo](https://img.shields.io/badge/Demo-Vercel-black?logo=vercel)](https://product-pulse-nine.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render-brightgreen?logo=render)](https://productpulse-api-tgbe.onrender.com/health)
[![LinkedIn Post](https://img.shields.io/badge/LinkedIn-Post-blue?logo=linkedin)](https://www.linkedin.com/feed/update/urn:li:activity:7523055555066720256/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ProductPulse is an enterprise-grade product intelligence and customer retention platform. It leverages machine learning to analyze customer behavioral sequences, predict churn risk, identify behavioral clusters, provide sensitivity analysis against decision boundaries, and project business impact through retention economics.

🔗 **Project Links & Updates:**
* **Live Web App:** [ProductPulse on Vercel](https://product-pulse-nine.vercel.app)
* **Live API Backend:** [ProductPulse API on Render](https://productpulse-api-tgbe.onrender.com) (API Docs: [Swagger UI](https://productpulse-api-tgbe.onrender.com/docs))
* **LinkedIn Announcement:** [Read the Project Post on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7523055555066720256/)

---

## 🌟 Core Architecture & Pipeline

$$\text{Behavior} \longrightarrow \text{Prediction} \longrightarrow \text{Segmentation} \longrightarrow \text{Insight} \longrightarrow \text{Action}$$

1. **Behavioral Ingestion & Feature Engineering:**
   * Tracks customer interactions across distinct sessions: views, cart additions, removals, purchases, session counts, and active days.
   * Derives key behavioral ratios: Events per Session, Purchase/View Ratio, and Cart/View Ratio.
2. **Predictive Modeling:**
   * Linear Support Vector Machine (LinearSVC) predicts 10-day retention return probability versus disengagement risk.
   * Model benchmarked against Logistic Regression, Decision Tree, and Random Forest on held-out test splits.
3. **Unsupervised Behavioral Clustering:**
   * K-Means Clustering ($k=2$) identifies macro customer archetypes: *Casual Explorers* ($94.41\%$) vs. *Highly Engaged Users* ($5.59\%$).
   * Principal Component Analysis (PCA) maps high-dimensional user interactions into a 2D behavioral space ($54.21\%$ explained variance).
4. **Decision Intelligence & Sensitivity:**
   * **Tipping-Point Explorer:** Live interactive sensitivity tool calculating hyperplane margin shifts ($\Delta$).
   * **Scenario Comparison Matrix:** Side-by-side behavioral delta analysis without heuristic recommendations.
   * **Retention Economics Calculator:** Models customer recovery and preserved revenue in Indian Rupees (₹) across the analyzed $273,366$ customer cohort.

---

## 🚀 Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
* **Backend:** FastAPI, Uvicorn, Python 3.12+.
* **Machine Learning & Analytics:** Scikit-Learn, Pandas, NumPy, Joblib.
* **Trained Models:** Linear Support Vector Classifier (`svm_model.pkl`), K-Means (`kmeans.pkl`), PCA (`pca.pkl`), StandardScaler (`scaler.pkl`, `cluster_scaler.pkl`).
* **Cloud & Deployment:** Render (FastAPI Backend), Vercel (React Frontend).

---

## 📂 Project Structure

```text
ProductPulse/
├── backend/
│   ├── app.py                   # FastAPI REST API & ML inference server
│   └── requirements.txt         # Python dependencies
├── models/
│   ├── svm_model.pkl            # Trained Linear Support Vector Classifier
│   ├── kmeans.pkl               # Trained K-Means Clustering model (k=2)
│   ├── pca.pkl                  # 2D PCA projection model
│   ├── scaler.pkl               # Feature StandardScaler
│   ├── cluster_scaler.pkl       # Cluster StandardScaler
│   ├── decision_tree.pkl        # Benchmark Decision Tree model
│   ├── logistic_regression.pkl  # Benchmark Logistic Regression model
│   ├── random_forest.pkl        # Benchmark Random Forest model
│   └── feature_config.pkl       # Feature schema & column metadata
├── artifacts/
│   ├── stats.json               # Empirical dataset statistics (273,366 users)
│   ├── model_metrics.json       # Comparative evaluation metrics (Accuracy, F1, ROC-AUC)
│   ├── pca_sample.json          # 2D PCA coordinate sample
│   └── segment_profiles.json    # Behavioral cluster centroid profiles
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API client & TypeScript contracts
│   │   ├── components/          # TopNav, SensitivityExplorer, BusinessImpactCalculator, Skeletons
│   │   ├── pages/               # Dashboard, AnalyzeUser, UserSegments, ModelPerformance, Insights, About
│   │   └── data/                # Strategy playbooks catalog
│   ├── package.json
│   └── vite.config.ts
├── run.py                       # Unified one-line launcher for both backend & frontend
├── ProductPulse_Academic_Project_Report.docx  # Full official academic project report
├── ProductPulse_Project_Report.md             # Complete academic report in Markdown
└── README.md
```

---

## 🛠️ Local Setup & Quick Start

### ⚡ One-Line Run (Recommended)
You can start both the FastAPI backend and React frontend with a single command:
```bash
python run.py
```
*(Or run `npm start` / `.\start.bat`)*

This launcher automatically:
1. Cleans up any leftover processes on ports `8000` and `5173`.
2. Starts the FastAPI backend and verifies health.
3. Starts the React Vite frontend.
4. Opens your default browser at `http://localhost:5173`.

---

### Manual Setup

#### 1. Backend Setup
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI server (runs on http://127.0.0.1:8000)
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
* Interactive API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 📊 Working API Endpoints

* `GET /health` — Service health check.
* `POST /predict` — Takes 7 behavioral features and returns SVM prediction, decision score, K-Means cohort, and derived ratios.
* `GET /stats` — Empirical cohort summary (273,366 users, 9.19% retention baseline).
* `GET /models/metrics` — Accuracy, Precision, Recall, F1-Score, and ROC-AUC comparisons.
* `GET /pca-sample` — 2D PCA projection coordinates and explained variance ($54.21\%$).

---

## 📜 Dataset & Academic Context
* **Source:** E-commerce Events History in Cosmetics Shop (Dec 2019).
* **Observation Window:** Dec 1 – Dec 21, 2019 ($273,366$ users analyzed).
* **Prediction Window:** Dec 22 – Dec 31, 2019 ($25,113$ returning retained users).
* **Baseline Retention Rate:** $9.19\%$ (High class imbalance addressed via F1-score and ROC-AUC optimization).

---

## 👤 Author & Connect

* **Arayana Sood**
* **LinkedIn:** [Project Post on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7523055555066720256/)
* **GitHub:** [@Arayana-sood](https://github.com/Arayana-sood)
