export interface StatsResponse {
  dataset: {
    source: string;
    observation_window: string;
    prediction_window: string;
    users_analyzed: number;
    retained_users: number;
    retention_rate: number;
    averages: {
      total_views: number;
      total_carts: number;
      total_purchases: number;
      total_removes: number;
      total_sessions: number;
      active_days: number;
      activity_duration_days: number;
      total_events: number;
      events_per_session: number;
      purchase_view_ratio: number;
      cart_view_ratio: number;
    };
  };
  segments: {
    key: string;
    cluster_id: number;
    label: string;
    size: number;
    pct: number;
    retention_rate: number;
  }[];
  model_output: {
    predicted_at_risk_rate_test: number;
    note: string;
  };
}

export interface PredictionRequest {
  total_views: number;
  total_carts: number;
  total_purchases: number;
  total_removes: number;
  total_sessions: number;
  active_days: number;
  activity_duration_days: number;
}

export interface PredictionResponse {
  prediction: {
    retained: number;
    verdict: string;
    decision_score: number;
    score_note: string;
  };
  segment: {
    key: string;
    label: string;
    cluster_id: number;
    segment_size: number;
    segment_percentage: number;
  };
  derived_features: {
    total_events: number;
    events_per_session: number;
    purchase_view_ratio: number;
    cart_view_ratio: number;
  };
  insights: string[];
  recommendations: { text: string; basis: string }[];
  warnings: string[];
}

export interface ModelMetricsResponse {
  selected_model: string;
  selection_note: string;
  evaluation: {
    test_size: number;
    positive_rate_test: number;
  };
  models: {
    key: string;
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
  }[];
  clustering: {
    chosen_k: number;
    features: string[];
  };
  pca: {
    pc1: number;
    pc2: number;
    total: number;
  };
}

export interface PcaSampleItem {
  x: number;
  y: number;
  segment: string;
}

export interface PcaSampleResponse {
  note: string;
  explained_variance: {
    pc1: number;
    pc2: number;
    total: number;
  };
  points: PcaSampleItem[];
}
