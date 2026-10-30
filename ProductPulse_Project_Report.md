# DATA SCIENCE MINOR PROJECT REPORT
*(Project Semester January-April 2025)*

# PRODUCTPULSE: AN INTERACTIVE DATA SCIENCE FRAMEWORK FOR E-COMMERCE CUSTOMER CHURN PREDICTION, BEHAVIORAL COHORT SEGMENTATION, AND REVENUE RETENTION OPTIMIZATION

**Submitted by:**  
**Arayana Sood**  
Registration No: **12412379**  
Programme: **B.Tech Computer Science and Engineering**  
Course Code: **INT345 (Data Science Minor Project)**  

**Under the Guidance of:**  
**Faculty Coordinator / Project Supervisor**  
Assistant Professor, Discipline of CSE/IT  

**Discipline of CSE/IT**  
**Lovely School of Computer Science & Engineering**  
**Lovely Professional University, Phagwara, Punjab**  

---

## CERTIFICATE

This is to certify that **Arayana Sood** bearing Registration no. **12412379** has completed **INT345 (Data Science Minor Project)** project titled, **“PRODUCTPULSE: AN INTERACTIVE DATA SCIENCE FRAMEWORK FOR E-COMMERCE CUSTOMER CHURN PREDICTION, BEHAVIORAL COHORT SEGMENTATION, AND REVENUE RETENTION OPTIMIZATION”** under my guidance and supervision. To the best of my knowledge, the present work is the result of his/her original development, effort and study.

<br>

**Signature and Name of the Supervisor:** _______________________________________  
**Designation of the Supervisor:** Assistant Professor  
**School of Computer Science & Engineering**  
**Lovely Professional University, Phagwara, Punjab**  
**Date:** ________________________  

---

## DECLARATION

I, **Arayana Sood**, student of **B.Tech Computer Science and Engineering** under **CSE/IT Discipline** at **Lovely Professional University, Punjab**, hereby declare that all the information furnished in this project report is based on my own intensive work and is genuine. The computational code, analytical models, mathematical deductions, and web application architecture presented in this report have been carried out independently and have not been submitted elsewhere for the award of any degree or diploma.

<br>

**Date:** ________________________  
**Place:** Phagwara, Punjab  

**Signature of the Student:** _______________________________________  
**Arayana Sood**  
Registration No: **12412379**  

---

## ACKNOWLEDGEMENT

I express my deepest sense of gratitude to my respected faculty coordinator and project supervisor for their invaluable guidance, constant motivation, and constructive critiques throughout the conceptualization and execution of this project. Their academic insights and relentless encouragement have provided the necessary rigor to realize this comprehensive data science system.

I also extend my sincere thanks to the Head of Department and the esteemed faculty members of the Discipline of CSE/IT, Lovely School of Computer Science & Engineering, Lovely Professional University, Phagwara, for providing state-of-the-art computational infrastructure, academic resources, and an intellectually vibrant environment that catalyzed the successful completion of this academic project.

Finally, I am indebted to my parents, family, and peers for their continuous moral support and understanding during countless hours of modeling, software development, and documentation.

**Arayana Sood**  
Registration No: **12412379**  

---

## TABLE OF CONTENTS

| Section | Title |
| :--- | :--- |
| **Certificate** | Certificate of Originality |
| **Declaration** | Student Declaration |
| **Acknowledgement** | Academic Acknowledgements |
| **List of Figures** | Index of Figures |
| **List of Tables** | Index of Tables |
| **Section 1** | **Introduction** |
| 1.1 | Context and Industry Landscape |
| 1.2 | The Economic Imperative: Retention vs. Acquisition |
| 1.3 | Project Motivation and Core Objectives |
| 1.4 | High-Level System Architecture and Technical Innovations |
| **Section 2** | **Source of Dataset** |
| 2.1 | Provenance and Domain Description |
| 2.2 | Temporal Observation and Target Labeling Windows |
| 2.3 | Event Taxonomy and User Action Hierarchies |
| 2.4 | Feature Engineering Pipeline and Mathematical Formulations |
| 2.5 | Scale, Volume, and Scalable Ingestion Pipeline |
| **Section 3** | **Exploratory Data Analysis (EDA) Process** |
| 3.1 | Interaction Volume and Activity Distributions |
| 3.2 | Funnel Drop-off and User Conversion Dynamics |
| 3.3 | Quantifying Class Imbalance in User Retention |
| 3.4 | Data Hygiene: Outliers, Missing Values, and Anomalies |
| 3.5 | Feature Correlation Structure and Multicollinearity |
| **Section 4** | **Analysis on Dataset** |
| 4.1 | Predictive Churn Classification |
| 4.2 | Behavioral Customer Segmentation (Clustering) |
| 4.3 | Dimensionality Reduction & Space Mapping (PCA) |
| 4.4 | Sensitivity Analysis & Decision Boundary Tipping-Point Simulation |
| 4.5 | Retention Economics & Business Impact Analysis |
| **Section 5** | **Conclusion** |
| 5.1 | Synthesis of Analytical Findings |
| 5.2 | Engineering Deliverables: Interactive Web Platform |
| 5.3 | Strategic & Managerial Recommendations |
| **Section 6** | **Future Scope** |
| 6.1 | Real-Time Streaming Ingestion with Apache Kafka |
| 6.2 | Sequential Recurrent & Graph Neural Network Modeling |
| 6.3 | Automated Multi-Channel Closed-Loop Marketing Integration |
| **Section 7** | **References** |

---

## SECTION 1: INTRODUCTION

### 1.1 Context and Industry Landscape
Over the past decade, the global digital commerce ecosystem has undergone a profound structural transformation. The proliferation of smartphones, ubiquitous broadband connectivity, frictionless one-click mobile payments, and sophisticated logistics networks have lowered consumer switching barriers to virtually zero. Modern consumers can navigate between competing digital retailers within milliseconds, evaluating price differentials, catalog variety, and promotional offers with unprecedented transparency. While this consumer autonomy fosters intense market dynamism, it presents an existential challenge for enterprise digital retailers: an acute surge in customer volatility, cart abandonment, and churn rate.

In domains characterized by high frequency and moderate basket sizes—such as personal cosmetics, fashion apparel, and specialized consumables—customer lifetime value (CLV) is heavily concentrated in recurring multi-period purchases. Empirical market research across consumer retail verticals demonstrates that acquiring a new transacting customer costs between 500% to 700% more than retaining an existing one. Furthermore, a modest 5% improvement in customer retention can augment enterprise profitability by 25% to 95%, as loyal customers exhibit higher purchase frequencies, reduced price sensitivity, and lower customer support overhead.

### 1.2 The Economic Imperative: Retention vs. Acquisition
Historically, digital retail organizations adopted an acquisition-centric growth paradigm, relying on aggressive performance marketing expenditure (e.g., search engine advertising, social media sponsored placements, influencer endorsements) to drive top-of-funnel traffic. However, macroeconomic shifts, including rising advertising costs per click (CPC), stringent data privacy frameworks (such as Apple's App Tracking Transparency and GDPR), and saturated consumer attention, have severely inflated Customer Acquisition Cost (CAC).

Under these economic realities, a high churn rate creates a "leaky bucket" phenomenon: substantial marketing capital is expended to acquire customers who transact once or explore the platform briefly, only to defect permanently to competitors. To establish sustainable unit economics and positive operational free cash flows, modern enterprises must pivot towards algorithmic retention intelligence—systems capable of preemptively identifying behavioral precursors to defection and prescribing surgical, economically viable re-engagement interventions before the customer relationship terminates.

### 1.3 Project Motivation and Core Objectives
The foundational motivation of the **ProductPulse** project is to dismantle the conventional dichotomy between static predictive modeling and tactical business decision-making. In conventional enterprise workflows, predictive models are frequently deployed as black-box batch scoring scripts that output binary predictions without explaining the causal mechanisms driving defection or quantifying the specific behavioral changes needed to reverse customer trajectory.

To overcome these systemic limitations, ProductPulse is engineered around five core scientific and engineering objectives:
1. **Rigorous Formulation of Temporal Retention:** Formulate an un-confounded temporal observation and prediction window over real-world high-volume e-commerce event streams ($N = 273,366$ users), transforming unstructured clickstream logs into rich behavioral feature representations.
2. **Transparent Linear Classification with Hyperplane Geometric Diagnostics:** Develop, benchmark, and deploy a calibrated Linear Support Vector Classifier (SVM) that balances recall and precision over highly imbalanced class distributions ($9.19\%$ retention prevalence), exposing continuous hyperplane distance scores rather than uncalibrated probabilities.
3. **Unsupervised Behavioral Cohort Segmentation:** Implement K-Means clustering ($k=2$) guided by rigorous Silhouette validation ($s = 0.8174$) to dissect the customer base into distinct macro-segments ("Casual Explorers" vs. "Highly Engaged Users") and isolate systemic behavioral disparities.
4. **Latent Feature Space Mapping via Principal Component Analysis (PCA):** Project multi-dimensional customer behavioral dynamics into a 2D orthogonal latent space, capturing $54.21\%$ of global variance (PC1: $36.03\%$, PC2: $18.18\%$) to facilitate human-interpretable topological visualization.
5. **Decision Boundary Tipping-Point Simulation & Retention Economics:** Pioneer an interactive local perturbation engine that solves for the minimal actionable behavioral delta required to flip an at-risk customer across the SVM decision boundary, dynamically connecting micro-level behavioral nudges with macro-level enterprise financial recovery.

### 1.4 High-Level System Architecture and Technical Innovations
ProductPulse is designed from first principles as an end-to-end, decoupled full-stack data science software system:
* **Analytical Pipeline:** Automated data cleaning, sessionization, Laplace-smoothed ratio calculation, standard scaling, and artifact serialization.
* **Inference Server (FastAPI):** High-throughput asynchronous Python microservice executing sub-10ms predictions, scenario counterfactual evaluations, and latent space sampling.
* **Modern Web Interface (React 19 & TypeScript):** Interactive dashboard with sensitivity sliders, dynamic scenario comparison, PCA topological maps, and financial ROI calculators.

---

## SECTION 2: SOURCE OF DATASET

### 2.1 Provenance and Domain Description
The foundational empirical data underpinning the ProductPulse framework is derived from the publicly verified **E-Commerce Events History in Cosmetics Shop** repository, hosted on Kaggle and sourced from a leading multi-category online beauty and personal care retailer. Digital cosmetics retail represents an exemplary domain for customer retention analytics due to its rich micro-conversion dynamics: consumers frequently browse product catalogs, inspect ingredient profiles, add items to personalized wishlists or shopping baskets, remove incompatible goods, and execute multi-item purchases.

### 2.2 Temporal Observation and Target Labeling Windows
To eliminate data leakage and lookahead bias, the dataset is split into two non-overlapping temporal windows:
$$\text{Observation Window } T_{obs} = [\text{2019-12-01 00:00:00 UTC}, \text{2019-12-21 23:59:59 UTC}]$$
$$\text{Target Window } T_{target} = [\text{2019-12-22 00:00:00 UTC}, \text{2019-12-31 23:59:59 UTC}]$$

A user $u$ is labeled as Retained ($y_u = 1$) if they perform $\ge 1$ interaction during $T_{target}$, and Churned / At-Risk ($y_u = 0$) if they perform zero interactions.

### 2.3 Event Taxonomy
Each atomic clickstream record contains: `timestamp`, `event_type`, `product_id`, `category_id`, `category_code`, `brand`, `price`, `user_id`, and `user_session`. The four discrete event types are:
* `view`: Product detail page view (browsing discovery).
* `cart`: Item addition to shopping cart (purchase intent).
* `remove_from_cart`: Item deletion from cart (hesitation / friction).
* `purchase`: Successful transaction checkout (final conversion).

### 2.4 Feature Engineering Pipeline
We engineer 11 fixed-dimensional behavioral metrics per user:
1. `total_views`: $\sum \mathbb{I}(\text{event} = \text{'view'})$
2. `total_carts`: $\sum \mathbb{I}(\text{event} = \text{'cart'})$
3. `total_purchases`: $\sum \mathbb{I}(\text{event} = \text{'purchase'})$
4. `total_removes`: $\sum \mathbb{I}(\text{event} = \text{'remove\_from\_cart'})$
5. `total_sessions`: $\text{Count}(\text{distinct user\_session})$
6. `active_days`: $\text{Count}(\text{distinct date})$
7. `activity_duration_days`: $(\max(t) - \min(t)) / 86400$
8. `total_events`: $\sum \text{all events}$
9. `events_per_session`: $\text{total\_events} / \text{total\_sessions}$
10. `purchase_view_ratio`: $\text{total\_purchases} / (\text{total\_views} + 1)$
11. `cart_view_ratio`: $\text{total\_carts} / (\text{total\_views} + 1)$

---

## SECTION 3: EDA PROCESS (EXPLORATORY DATA ANALYSIS)

### 3.1 Interaction Volume and Summary Statistics
The user base displays extreme right-skewed Pareto distributions across $N = 273,366$ users:
* Mean Total Views: $4.71$ (Median: $1.0$, Max: $482.0$)
* Mean Total Carts: $2.58$ (Median: $0.0$, Max: $390.0$)
* Mean Total Purchases: $0.60$ (Median: $0.0$, Max: $165.0$)
* Mean Total Sessions: $2.24$ (Median: $1.0$, Max: $148.0$)
* Mean Active Days: $1.39$ days (Median: $1.0$, Max: $21.0$)

### 3.2 Conversion Funnel and Drop-Off Dynamics
* **Views Stage:** $100.0\%$ of users recorded product views.
* **Cart Stage:** $15.2\%$ of users proceeded to add items to cart ($84.8\%$ drop-off).
* **Purchase Stage:** $6.8\%$ of users completed a transaction ($55.3\%$ drop-off from cart).
* **Target Retention Stage:** $9.19\%$ of users engaged during the subsequent window.

### 3.3 Class Imbalance Quantification
* **Churned / At-Risk Users ($y = 0$):** $248,253$ users ($90.81\%$).
* **Retained Active Users ($y = 1$):** $25,113$ users ($9.19\%$).
* Imbalance ratio is approximately $10:1$, making standard accuracy an invalid optimization objective.

---

## SECTION 4: ANALYSIS ON DATASET

### 4.1 Predictive Churn Classification
#### 4.1.1 Introduction
Supervised classification to predict customer defection using holdout evaluation ($80\%$ train, $20\%$ test: $N_{test} = 54,674$).

#### 4.1.2 General Description
Benchmarking four diverse algorithm families: Logistic Regression, Decision Tree (CART), Random Forest, and Linear Support Vector Classifier (SVM).

#### 4.1.3 Mathematical Formulas
* **Linear SVM Optimization:**
$$\min_{w, b, \xi} \frac{1}{2} \|w\|^2 + C \sum_{i=1}^N \xi_i \quad \text{s.t.} \quad y_i(w^T x_i + b) \ge 1 - \xi_i, \quad \xi_i \ge 0$$
* **Decision Function:**
$$f(x) = w^T x + b, \quad \hat{y} = \text{sign}(f(x))$$

#### 4.1.4 Benchmark Results
| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression | 0.9119 | 0.6113 | 0.1121 | 0.1894 | 0.7429 |
| Decision Tree | 0.7733 | 0.2235 | 0.5935 | 0.3248 | 0.7404 |
| Random Forest | 0.8001 | 0.2415 | 0.5495 | 0.3355 | 0.7389 |
| **Linear SVM (Selected)** | **0.8391** | **0.2829** | **0.4895** | **0.3586** | **0.7430** |

*Selection Justification:* Linear SVM achieved the best ROC-AUC ($0.7430$) and highest F1-score ($0.3586$), maintaining balanced recall ($48.95\%$) over Logistic Regression's collapsed recall ($11.21\%$).

#### 4.1.5 SVM Feature Importance
Dominant positive retention drivers: `active_days` ($+1.42$), `activity_duration_days` ($+1.15$), `total_purchases` ($+0.88$). Major disengagement signals: `total_removes` ($-0.65$), `total_views` ($-0.34$).

---

### 4.2 Behavioral Customer Segmentation (Clustering)
#### 4.2.1 Introduction & Setup
Unsupervised clustering using K-Means across 10 standardized behavioral dimensions.

#### 4.2.2 Mathematical Formulas
* **WCSS Objective:** $J = \sum_{k=1}^K \sum_{x \in S_k} \|x - \mu_k\|^2$
* **Silhouette Score:** $s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$

#### 4.2.3 Results
* Parameter sweep proved $k=2$ achieves maximum Silhouette score of **0.8174**.
* **Cluster 0: "Casual Explorer"** ($94.41\%$ of users, $N=258,093$):
  - Retention Rate: $7.40\%$
  - Mean Sessions: $1.69$, Mean Purchases: $0.17$, Mean Views: $2.86$
* **Cluster 1: "Highly Engaged User"** ($5.59\%$ of users, $N=15,273$):
  - Retention Rate: $39.36\%$ ($5.3\times$ higher)
  - Mean Sessions: $11.53$, Mean Purchases: $7.85$, Mean Views: $36.02$

---

### 4.3 Dimensionality Reduction & Space Mapping (PCA)
#### 4.3.1 Mathematical Mechanics
* Covariance Matrix: $\mathbf{\Sigma} = \frac{1}{N-1}\mathbf{X}^T\mathbf{X}$
* Eigendecomposition: $\mathbf{\Sigma}\mathbf{v}_i = \lambda_i \mathbf{v}_i$
* Explained Variance: $\text{EVR}_i = \lambda_i / \sum \lambda_j$

#### 4.3.2 Empirical Findings
* **PC1:** Explains **36.03%** variance (Represents gross engagement volume).
* **PC2:** Explains **18.18%** variance (Represents conversion efficiency).
* **Cumulative 2D Explained Variance:** **54.21%**.
* Allows pristine 2D visualization of customer distributions and SVM hyperplane separation.

---

### 4.4 Sensitivity Analysis & Decision Boundary Tipping-Point Simulation
#### 4.4.1 Mechanics of Perturbation Engine
The SVM decision boundary is affine: $f(x) = w^T x + b = 0$.
The marginal gradient is:
$$\frac{\partial f(x)}{\partial x_j} = \frac{w_j}{\sigma_j}$$
The minimal step required to flip an at-risk user ($f(x) < 0$) into retained ($f(x) \ge 0$) is:
$$\Delta x_j^* = \frac{-f(x) \cdot \sigma_j}{w_j}$$

#### 4.4.2 Strategic Findings
* Incrementing purchases produces a **$2.1\times$ higher boundary-crossing velocity** than incrementing passive sessions.
* An abandoned-cart customer with $f(x) = -0.76$ flips to retained ($f(x) = +0.18$) with a single completed purchase.

---

### 4.5 Retention Economics & Business Impact Analysis
#### 4.5.1 Financial Formulations
* **Revenue at Risk:** $R_{risk} = 248,253 \times \text{AOV} = \text{₹620.6 Crore}$ (at $\text{AOV} = \text{₹2,500}$).
* **Recovered GMV:** $R_{recov}(L) = N_{at-risk} \times (L / 100) \times \text{AOV}$
* **CAC Avoidance Savings:** $S_{CAC}(L) = N_{at-risk} \times (L / 100) \times \text{CAC}$ (at $\text{CAC} = \text{₹800}$).

#### 4.5.2 Sensitivity Impact
* **At 1.0% Lift:** 2,483 users preserved $\rightarrow$ ₹6.21 Cr GMV recovered $\rightarrow$ ₹8.20 Cr Total Economic Value.
* **At 5.0% Benchmark Lift:** **12,413 users preserved** $\rightarrow$ **₹31.03 Cr GMV recovered** $\rightarrow$ **₹40.96 Cr Total Economic Value**.
* **At 10.0% Lift:** 24,825 users preserved $\rightarrow$ ₹62.06 Cr GMV recovered $\rightarrow$ ₹81.92 Cr Total Economic Value.

---

## SECTION 5: CONCLUSION
ProductPulse provides an end-to-end operational framework that bridges the gap between statistical modeling and commercial enterprise value. By coupling a margin-maximizing Linear SVM classifier with K-Means cohort segmentation, PCA topological projection, real-time sensitivity tipping-point exploration, and parametric financial impact modeling, the system delivers both predictive accuracy and prescriptively actionable intervention roadmaps.

---

## SECTION 6: FUTURE SCOPE
1. **Real-time Kafka Event Streaming:** Dynamic state updates and instant sub-second churn scoring on active browser sessions.
2. **Deep Sequential Models:** Transformer (BERT4Rec) and Graph Neural Network architectures to capture intra-session event order.
3. **Automated Closed-Loop CDP Integration:** Automated webhook triggers to dispatch targeted retention discounts via marketing platforms (Braze/Klaviyo).

---

## SECTION 7: REFERENCES
1. C. Cortes and V. Vapnik, “Support-vector networks,” *Machine Learning*, vol. 20, no. 3, pp. 273–297, Sep. 1995.
2. J. MacQueen, “Some methods for classification and analysis of multivariate observations,” in *Proc. 5th Berkeley Symp. Math. Statist. Prob.*, vol. 1, 1967, pp. 281–297.
3. K. Pearson, “On lines and planes of closest fit to systems of points in space,” *Philosophical Magazine*, vol. 2, no. 11, pp. 559–572, 1901.
4. F. Pedregosa et al., “Scikit-learn: Machine learning in Python,” *J. Mach. Learn. Res.*, vol. 12, pp. 2825–2830, 2011.
5. P. J. Rousseeuw, “Silhouettes: A graphical aid to the interpretation and validation of cluster analysis,” *J. Comput. Appl. Math.*, vol. 20, pp. 53–65, 1987.
6. A. Mishra and U. S. Reddy, “A review on customer churn prediction in e-commerce using machine learning,” in *ICSCAN*, 2021, pp. 1–6.
7. F. F. Reichheld and P. Schefter, “E-loyalty: Your secret weapon on the web,” *Harvard Business Review*, vol. 78, no. 4, pp. 105–113, 2000.
8. S. A. Neslin et al., “Defending the customer base: Assessing the value of customer churn prediction models,” *J. Mark. Res.*, vol. 43, no. 2, pp. 204–218, 2006.
9. Kaggle, “E-commerce events history in cosmetics shop dataset,” Kaggle Dataset Repository, Dec. 2019.
10. T. Hastie, R. Tibshirani, and J. Friedman, *The Elements of Statistical Learning*, 2nd ed. Springer, 2009.
