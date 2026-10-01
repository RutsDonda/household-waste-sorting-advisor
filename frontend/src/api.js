import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const WasteAPI = {
  // AI Inference
  predictWaste: async (formData) => {
    const res = await api.post('/api/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  sampleTest: async (itemSample, householdId = 'HH-101') => {
    const formData = new FormData();
    formData.append('item_sample', itemSample);
    formData.append('household_id', householdId);
    const res = await api.post('/api/predict/sample-test', formData);
    return res.data;
  },

  confirmCategory: async (predictionId, confirmedCategory, notes = '') => {
    const res = await api.post('/api/predict/confirm', {
      prediction_id: predictionId,
      confirmed_category: confirmedCategory,
      notes,
    });
    return res.data;
  },

  // History
  getHistory: async (params = {}) => {
    const res = await api.get('/api/history', { params });
    return res.data;
  },

  deletePrediction: async (id) => {
    const res = await api.delete(`/api/history/${id}`);
    return res.data;
  },

  // Categories & Guides
  getCategories: async () => {
    const res = await api.get('/api/categories');
    return res.data;
  },

  getDisposalGuides: async (params = {}) => {
    const res = await api.get('/api/disposal-guide', { params });
    return res.data;
  },

  // Analytics
  getSummary: async () => {
    const res = await api.get('/api/analytics/summary');
    return res.data;
  },

  getCategoryDistribution: async () => {
    const res = await api.get('/api/analytics/categories');
    return res.data;
  },

  getTrends: async (timeframe = 'daily') => {
    const res = await api.get('/api/analytics/trends', { params: { timeframe } });
    return res.data;
  },

  getTopItems: async () => {
    const res = await api.get('/api/analytics/top-items');
    return res.data;
  },

  getHouseholdStats: async () => {
    const res = await api.get('/api/analytics/households');
    return res.data;
  },

  getSingleHousehold: async (householdId) => {
    const res = await api.get(`/api/analytics/households/${householdId}`);
    return res.data;
  },

  getAdminAnalytics: async () => {
    const res = await api.get('/api/analytics/admin');
    return res.data;
  },

  triggerBatchJob: async () => {
    const res = await api.post('/api/analytics/run-batch-job');
    return res.data;
  },

  checkHealth: async () => {
    const res = await api.get('/api/health');
    return res.data;
  }
};
