import warnings
from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings('ignore', category=InconsistentVersionWarning)

from pathlib import Path
from typing import List

import joblib
import json
import numpy as np
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODELS_DIR = PROJECT_ROOT / "models"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"


# ============================================================
# LOAD MODELS
# ============================================================

logistic_model = joblib.load(
    MODELS_DIR / "logistic_regression.pkl"
)

decision_tree_model = joblib.load(
    MODELS_DIR / "decision_tree.pkl"
)

random_forest_model = joblib.load(
    MODELS_DIR / "random_forest.pkl"
)

svm_model = joblib.load(
    MODELS_DIR / "svm_model.pkl"
)

scaler = joblib.load(
    MODELS_DIR / "scaler.pkl"
)

cluster_scaler = joblib.load(
    MODELS_DIR / "cluster_scaler.pkl"
)

kmeans = joblib.load(
    MODELS_DIR / "kmeans.pkl"
)

pca = joblib.load(
    MODELS_DIR / "pca.pkl"
)

feature_config = joblib.load(
    MODELS_DIR / "feature_config.pkl"
)


# ============================================================
# LOAD ARTIFACTS
# ============================================================

with open(
    ARTIFACTS_DIR / "stats.json",
    "r",
    encoding="utf-8"
) as f:
    stats = json.load(f)


with open(
    ARTIFACTS_DIR / "model_metrics.json",
    "r",
    encoding="utf-8"
) as f:
    model_metrics = json.load(f)


with open(
    ARTIFACTS_DIR / "segment_profiles.json",
    "r",
    encoding="utf-8"
) as f:
    segment_profiles = json.load(f)


with open(
    ARTIFACTS_DIR / "pca_sample.json",
    "r",
    encoding="utf-8"
) as f:
    pca_sample = json.load(f)


# ============================================================
# FEATURE CONFIGURATION
# ============================================================

CLASSIFICATION_FEATURES = feature_config[
    "classification_features"
]

CLUSTERING_FEATURES = feature_config[
    "clustering_features"
]


# ============================================================
# SAFETY CHECK
# ============================================================

EXPECTED_CLASSIFICATION_FEATURES = [
    "total_views",
    "total_carts",
    "total_purchases",
    "total_removes",
    "total_sessions",
    "active_days",
    "activity_duration_days",
    "total_events",
    "events_per_session",
    "purchase_view_ratio",
    "cart_view_ratio"
]

EXPECTED_CLUSTERING_FEATURES = [
    "total_views",
    "total_carts",
    "total_purchases",
    "total_removes",
    "total_sessions",
    "active_days",
    "activity_duration_days",
    "events_per_session",
    "purchase_view_ratio",
    "cart_view_ratio"
]

if CLASSIFICATION_FEATURES != EXPECTED_CLASSIFICATION_FEATURES:
    raise RuntimeError(
        "Classification feature configuration does not match "
        "the ProductPulse model pipeline."
    )

if CLUSTERING_FEATURES != EXPECTED_CLUSTERING_FEATURES:
    raise RuntimeError(
        "Clustering feature configuration does not match "
        "the ProductPulse model pipeline."
    )


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="ProductPulse API",
    description=(
        "Predictive Product and User Analytics API"
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INPUT MODEL
# ============================================================

class UserInput(BaseModel):

    total_views: int = Field(
        ge=0,
        description="Total product views"
    )

    total_carts: int = Field(
        ge=0,
        description="Total cart additions"
    )

    total_purchases: int = Field(
        ge=0,
        description="Total purchases"
    )

    total_removes: int = Field(
        ge=0,
        description="Total cart removals"
    )

    total_sessions: int = Field(
        ge=0,
        description="Number of sessions"
    )

    active_days: int = Field(
        ge=0,
        description="Number of active days"
    )

    activity_duration_days: float = Field(
        ge=0,
        description="Duration between first and last activity"
    )


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def build_features(user: UserInput):

    total_events = (
        user.total_views
        + user.total_carts
        + user.total_purchases
        + user.total_removes
    )

    if user.total_sessions > 0:
        events_per_session = (
            total_events / user.total_sessions
        )
    else:
        events_per_session = 0.0

    if user.total_views > 0:
        purchase_view_ratio = (
            user.total_purchases
            / user.total_views
        )

        cart_view_ratio = (
            user.total_carts
            / user.total_views
        )

    else:
        purchase_view_ratio = 0.0
        cart_view_ratio = 0.0

    data = {
        "total_views": user.total_views,
        "total_carts": user.total_carts,
        "total_purchases": user.total_purchases,
        "total_removes": user.total_removes,
        "total_sessions": user.total_sessions,
        "active_days": user.active_days,
        "activity_duration_days": user.activity_duration_days,
        "total_events": total_events,
        "events_per_session": events_per_session,
        "purchase_view_ratio": purchase_view_ratio,
        "cart_view_ratio": cart_view_ratio
    }

    return pd.DataFrame([data])


def get_segment(cluster_id: int):

    for segment in segment_profiles["segments"].values():

        if segment["cluster_id"] == cluster_id:
            return segment

    return None


def generate_warnings(user: UserInput):

    warnings = []

    if (
        user.active_days > user.total_sessions
        and user.total_sessions > 0
    ):
        warnings.append(
            "Active days are greater than total sessions."
        )

    if (
        user.total_purchases > user.total_carts
    ):
        warnings.append(
            "Purchases are greater than cart additions."
        )

    if (
        user.total_carts > user.total_views
        and user.total_views > 0
    ):
        warnings.append(
            "Cart additions are greater than product views."
        )

    if (
        user.total_removes > user.total_carts
        and user.total_carts > 0
    ):
        warnings.append(
            "Cart removals are greater than cart additions."
        )

    return warnings


def generate_insights(
    features: pd.DataFrame,
    segment: dict
):

    insights = []

    means = segment["means"]

    comparisons = [
        (
            "total_views",
            "Product views"
        ),
        (
            "total_sessions",
            "Sessions"
        ),
        (
            "total_purchases",
            "Purchases"
        ),
        (
            "active_days",
            "Active days"
        )
    ]

    for feature, label in comparisons:

        user_value = float(
            features.iloc[0][feature]
        )

        segment_average = float(
            means[feature]
        )

        if segment_average == 0:
            continue

        difference = (
            user_value - segment_average
        ) / segment_average

        if difference >= 0.25:

            insights.append(
                f"{label} are significantly above "
                f"the average for this segment."
            )

        elif difference <= -0.25:

            insights.append(
                f"{label} are below the average "
                f"for this segment."
            )

    if not insights:

        insights.append(
            "This user's activity is broadly "
            "consistent with the assigned segment."
        )

    return insights[:3]


def generate_recommendations(
    predicted_retained: int,
    segment_key: str
):

    recommendations = []

    if predicted_retained == 0:

        recommendations.append({
            "text": (
                "Consider a targeted re-engagement "
                "campaign."
            ),
            "basis": "business_suggestion"
        })

        recommendations.append({
            "text": (
                "Use personalized product recommendations "
                "to encourage another session."
            ),
            "basis": "business_suggestion"
        })

    elif segment_key == "engaged":

        recommendations.append({
            "text": (
                "Strengthen retention with personalized "
                "offers and loyalty incentives."
            ),
            "basis": "business_suggestion"
        })

        recommendations.append({
            "text": (
                "Prioritize this user for high-value "
                "engagement campaigns."
            ),
            "basis": "business_suggestion"
        })

    else:

        recommendations.append({
            "text": (
                "Encourage repeat visits with personalized "
                "content or product suggestions."
            ),
            "basis": "business_suggestion"
        })

        recommendations.append({
            "text": (
                "Use relevant offers to move the user "
                "toward deeper engagement."
            ),
            "basis": "business_suggestion"
        })

    return recommendations


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "ProductPulse API"
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(user: UserInput):

    features = build_features(user)

    # -------------------------
    # Classification
    # -------------------------

    classification_data = features[
        CLASSIFICATION_FEATURES
    ]

    scaled_features = scaler.transform(
        classification_data
    )

    prediction = int(
        svm_model.predict(
            scaled_features
        )[0]
    )

    decision_score = float(
        svm_model.decision_function(
            scaled_features
        )[0]
    )


    # -------------------------
    # Clustering
    # -------------------------

    clustering_data = features[
        CLUSTERING_FEATURES
    ]

    cluster_scaled = cluster_scaler.transform(
        clustering_data
    )

    cluster_id = int(
        kmeans.predict(
            cluster_scaled
        )[0]
    )

    segment = get_segment(
        cluster_id
    )

    if segment is None:

        raise RuntimeError(
            "Unable to determine user segment."
        )


    # -------------------------
    # Insights
    # -------------------------

    insights = generate_insights(
        features,
        segment
    )


    # -------------------------
    # Recommendations
    # -------------------------

    recommendations = generate_recommendations(
        prediction,
        segment["key"]
    )


    # -------------------------
    # Warnings
    # -------------------------

    warnings = generate_warnings(
        user
    )


    # -------------------------
    # Final response
    # -------------------------

    if prediction == 1:

        verdict = "Predicted to Return"

    else:

        verdict = "Predicted to Disengage"


    return {

        "prediction": {

            "retained": prediction,

            "verdict": verdict,

            "decision_score": round(
                decision_score,
                4
            ),

            "score_note": (
                "SVM decision score, not a probability. "
                "Positive values indicate stronger "
                "movement toward the returning class."
            )
        },

        "segment": {

            "key": segment["key"],

            "label": segment["label"],

            "cluster_id": segment["cluster_id"],

            "segment_size": segment["size"],

            "segment_percentage": segment["pct"]
        },

        "derived_features": {

            "total_events": int(
                features.iloc[0]["total_events"]
            ),

            "events_per_session": round(
                float(
                    features.iloc[0][
                        "events_per_session"
                    ]
                ),
                4
            ),

            "purchase_view_ratio": round(
                float(
                    features.iloc[0][
                        "purchase_view_ratio"
                    ]
                ),
                4
            ),

            "cart_view_ratio": round(
                float(
                    features.iloc[0][
                        "cart_view_ratio"
                    ]
                ),
                4
            )
        },

        "insights": insights,

        "recommendations": recommendations,

        "warnings": warnings
    }


# ============================================================
# DASHBOARD STATS
# ============================================================

@app.get("/stats")
def get_stats():

    return stats


# ============================================================
# MODEL METRICS
# ============================================================

@app.get("/models/metrics")
def get_model_metrics():

    return model_metrics


# ============================================================
# PCA SAMPLE
# ============================================================

@app.get("/pca-sample")
def get_pca_sample():

    return pca_sample