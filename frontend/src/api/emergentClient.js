// API adapter to replace Base44 SDK with Emergent REST API calls
import axios from 'axios';

// Get backend URL from environment - Vite uses import.meta.env
const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ENTITIES API ====================

// Receipt entity
export const Receipt = {
  async create(data) {
    const response = await apiClient.post('/receipts', data);
    return response.data;
  },
  
  async find(query = {}, sort = '-created_date', limit = 100) {
    const params = new URLSearchParams();
    if (query.household_id) params.append('household_id', query.household_id);
    if (limit) params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/receipts?${params.toString()}`);
    return response.data;
  },
  
  async filter(query = {}, sort = '-created_date', limit = 100) {
    return this.find(query, sort, limit);
  },
  
  async get(id) {
    const response = await apiClient.get(`/receipts/${id}`);
    return response.data;
  },
  
  async update(id, data) {
    const response = await apiClient.put(`/receipts/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    const response = await apiClient.delete(`/receipts/${id}`);
    return response.data;
  }
};

// Budget entity
export const Budget = {
  async create(data) {
    const response = await apiClient.post('/budgets', data);
    return response.data;
  },
  
  async find(query = {}) {
    const params = new URLSearchParams();
    if (query.household_id) params.append('household_id', query.household_id);
    
    const response = await apiClient.get(`/budgets?${params.toString()}`);
    return response.data;
  },
  
  async filter(query = {}, sort = '-created_date', limit = 10) {
    return this.find(query);
  },
  
  async get(id) {
    const response = await apiClient.get(`/budgets/${id}`);
    return response.data;
  },
  
  async update(id, data) {
    const response = await apiClient.put(`/budgets/${id}`, data);
    return response.data;
  },
  
  async delete(id) {
    const response = await apiClient.delete(`/budgets/${id}`);
    return response.data;
  }
};

// Household entity
export const Household = {
  async create(data) {
    const response = await apiClient.post('/households', data);
    return response.data;
  },
  
  async find(query = {}) {
    const response = await apiClient.get('/households');
    return response.data;
  },
  
  async get(id) {
    const response = await apiClient.get(`/households/${id}`);
    return response.data;
  }
};

// CreditLog entity
export const CreditLog = {
  async create(data) {
    const response = await apiClient.post('/credit-logs', data);
    return response.data;
  },
  
  async find(query = {}) {
    const params = new URLSearchParams();
    if (query.household_id) params.append('household_id', query.household_id);
    if (query.user_email) params.append('user_email', query.user_email);
    
    const response = await apiClient.get(`/credit-logs?${params.toString()}`);
    return response.data;
  }
};

// Placeholder entities (to be implemented as needed)
export const CorrectionLog = {
  async create(data) {
    console.log('CorrectionLog.create called:', data);
    return { id: 'placeholder', ...data };
  }
};

export const OCRFeedback = {
  async create(data) {
    console.log('OCRFeedback.create called:', data);
    return { id: 'placeholder', ...data };
  }
};

export const FailedScanLog = {
  async create(data) {
    console.log('FailedScanLog.create called:', data);
    return { id: 'placeholder', ...data };
  }
};

export const NutritionFact = {
  async find(query = {}) {
    const params = new URLSearchParams();
    if (query.household_id) params.append('household_id', query.household_id);
    
    const response = await apiClient.get(`/nutrition-facts?${params.toString()}`);
    return response.data;
  }
};

export const FailedNutritionLookup = {
  async find(query = {}) {
    console.log('FailedNutritionLookup.find called:', query);
    return [];
  }
};

export const AggregatedGroceryData = {
  async find(query = {}) {
    console.log('AggregatedGroceryData.find called:', query);
    return [];
  }
};

export const Recipe = {
  async create(data) {
    const response = await apiClient.post('/recipes', data);
    return response.data;
  },
  
  async find(query = {}) {
    const response = await apiClient.get('/recipes');
    return response.data;
  }
};

export const IngredientMap = {
  async find(query = {}) {
    console.log('IngredientMap.find called:', query);
    return [];
  }
};

export const MealPlan = {
  async find(query = {}) {
    console.log('MealPlan.find called:', query);
    return [];
  }
};

export const TestRun = {
  async create(data) {
    const response = await apiClient.post('/functions/createTestRun', data);
    return response.data;
  }
};

export const OCRQualityLog = {
  async create(data) {
    console.log('OCRQualityLog.create called:', data);
    return { id: 'placeholder', ...data };
  }
};

export const HouseholdInvitation = {
  async find(query = {}) {
    console.log('HouseholdInvitation.find called:', query);
    return [];
  }
};

// ==================== FUNCTIONS API ====================

// Function invocations
export const functions = {
  async invoke(functionName, data) {
    const response = await apiClient.post(`/functions/${functionName}`, data);
    return response.data;
  }
};

// Specific function wrappers
export const processReceiptInBackground = {
  async invoke(data) {
    return functions.invoke('processReceiptInBackground', data);
  }
};

export const calorieNinjasNutrition = async function(data) {
  return functions.invoke('calorieNinjasNutrition', data);
};

export const onsDataFetcher = async function() {
  const response = await apiClient.get('/functions/onsDataFetcher');
  return response.data;
};

export const sendInvitation = async function(data) {
  return functions.invoke('sendInvitation', data);
};

export const deleteUserAccount = async function(data) {
  return functions.invoke('deleteUserAccount', data);
};

export const assignHouseholdToOldReceipts = async function(data) {
  return functions.invoke('assignHouseholdToOldReceipts', data);
};

export const generateModeledData = async function(data) {
  return functions.invoke('generateModeledData', data);
};

export const getComprehensiveCreditReport = async function(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const response = await apiClient.get(`/functions/getComprehensiveCreditReport?${params.toString()}`);
  return response.data;
};

// ==================== FILE UPLOAD ====================

export const UploadFile = async function({ file }) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// ==================== AUTH API ====================

// Mock auth implementation (to be replaced with real auth)
export const auth = {
  async me() {
    // Mock user data - replace with real authentication
    return {
      id: 'mock_user_123',
      email: 'test@grocerytrack.app',
      full_name: 'Test User',
      currency: 'GBP',
      tier: 'free',
      household_id: 'c756604e-d3e8-4e6e-918e-12d7d96c877d', // Use the test household we created
      monthly_scan_count: 0,
      last_scan_reset_date: new Date().toISOString(),
      welcome_email_sent: true
    };
  },
  
  async updateMe(data) {
    console.log('Auth update called:', data);
    return { ...await this.me(), ...data };
  }
};

// ==================== INTEGRATIONS API ====================

export const integrations = {
  Core: {
    async UploadFile({ file }) {
      return UploadFile({ file });
    },
    
    async InvokeLLM(data) {
      console.log('LLM invocation called (placeholder):', data);
      return {
        data: {
          completion: JSON.stringify({
            summary: "This is a mock LLM response",
            analysis: "Placeholder analysis"
          })
        }
      };
    },
    
    async SendEmail(data) {
      console.log('Email send called (placeholder):', data);
      return { sent: true, message: "Email sent (placeholder)" };
    }
  }
};

// ==================== ERROR HANDLING ====================

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default {
  Receipt,
  Budget,
  Household,
  CreditLog,
  CorrectionLog,
  OCRFeedback,
  FailedScanLog,
  NutritionFact,
  FailedNutritionLookup,
  AggregatedGroceryData,
  Recipe,
  IngredientMap,
  MealPlan,
  TestRun,
  OCRQualityLog,
  HouseholdInvitation,
  functions,
  auth,
  integrations
};