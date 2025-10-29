import emergentAPI from './emergentClient';

// Export functions from our new Emergent API client
export const onsDataFetcher = emergentAPI.onsDataFetcher;
export const calorieNinjasNutrition = emergentAPI.calorieNinjasNutrition;

// Placeholder function (not implemented in backend yet)
export const feedbackAnalyzer = async (data) => {
    console.log('feedbackAnalyzer called:', data);
    return { status: 'placeholder', message: 'Function not implemented yet' };
};

export const generateModeledData = emergentAPI.generateModeledData;
export const deleteUserAccount = emergentAPI.deleteUserAccount;
export const sendInvitation = emergentAPI.sendInvitation;
export const assignHouseholdToOldReceipts = emergentAPI.assignHouseholdToOldReceipts;
export const getComprehensiveCreditReport = emergentAPI.getComprehensiveCreditReport;

// Placeholder function (not implemented in backend yet)
export const rolloverBudget = async (data) => {
    console.log('rolloverBudget called:', data);
    return { status: 'placeholder', message: 'Function not implemented yet' };
};

export const processReceiptInBackground = emergentAPI.processReceiptInBackground;

// Placeholder functions (these are internal backend functions)
export const textractOCR = async (data) => {
    console.log('textractOCR called:', data);
    return { status: 'internal', message: 'Internal backend function' };
};

export const enhanceReceiptWithLLM = async (data) => {
    console.log('enhanceReceiptWithLLM called:', data);
    return { status: 'internal', message: 'Internal backend function' };
};

export const aggregateGroceryData = async (data) => {
    console.log('aggregateGroceryData called:', data);
    return { status: 'internal', message: 'Internal backend function' };
};

export const generateReceiptInsightsInBackground = emergentAPI.generateReceiptInsightsInBackground;

// Email functions (placeholders)
export const sendWelcomeEmail = async (data) => {
    console.log('sendWelcomeEmail called:', data);
    return emergentAPI.integrations.Core.SendEmail(data);
};

export const sendTestEmail = async (data) => {
    console.log('sendTestEmail called:', data);
    return emergentAPI.integrations.Core.SendEmail(data);
};

// Recipe functions (placeholders)
export const extractCalorieNinjasRecipes = async (data) => {
    console.log('extractCalorieNinjasRecipes called:', data);
    return { status: 'placeholder', message: 'Recipe extraction not implemented yet' };
};

export const canonicalizeRecipeIngredients = async (data) => {
    console.log('canonicalizeRecipeIngredients called:', data);
    return { status: 'placeholder', message: 'Recipe canonicalization not implemented yet' };
};

export const extractCalorieNinjasNutrition = emergentAPI.calorieNinjasNutrition;
export const importCuratedRecipes = async (data) => {
    console.log('importCuratedRecipes called:', data);
    return { status: 'placeholder', message: 'Recipe import not implemented yet' };
};

// OCR Testing functions
export const createTestRun = async (data) => {
    return emergentAPI.functions.invoke('createTestRun', data);
};

export const submitOCRQualityFeedback = async (data) => {
    return emergentAPI.functions.invoke('submitOCRQualityFeedback', data);
};

export const analyzeOCRFeedbackBatch = async (data) => {
    return emergentAPI.functions.invoke('analyzeOCRFeedbackBatch', data);
};

export const rerunTestRun = async (data) => {
    console.log('rerunTestRun called:', data);
    return { status: 'placeholder', message: 'Test run rerun not implemented yet' };
};

