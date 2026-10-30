import axios from 'axios';
import type { StatsResponse, PredictionRequest, PredictionResponse, ModelMetricsResponse, PcaSampleResponse } from './types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getStats: async (): Promise<StatsResponse> => {
    const response = await apiClient.get<StatsResponse>('/stats');
    return response.data;
  },
  
  predictUser: async (data: PredictionRequest): Promise<PredictionResponse> => {
    const response = await apiClient.post<PredictionResponse>('/predict', data);
    return response.data;
  },
  
  getModelMetrics: async (): Promise<ModelMetricsResponse> => {
    const response = await apiClient.get<ModelMetricsResponse>('/models/metrics');
    return response.data;
  },
  
  getPcaSample: async (): Promise<PcaSampleResponse> => {
    const response = await apiClient.get<PcaSampleResponse>('/pca-sample');
    return response.data;
  }
};
