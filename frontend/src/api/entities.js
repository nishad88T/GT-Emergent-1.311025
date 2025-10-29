import emergentAPI from './emergentClient';

// Export entities from our new Emergent API client
export const Receipt = emergentAPI.Receipt;
export const Budget = emergentAPI.Budget;
export const CorrectionLog = emergentAPI.CorrectionLog;
export const OCRFeedback = emergentAPI.OCRFeedback;
export const FailedScanLog = emergentAPI.FailedScanLog;
export const NutritionFact = emergentAPI.NutritionFact;
export const FailedNutritionLookup = emergentAPI.FailedNutritionLookup;
export const Household = emergentAPI.Household;
export const HouseholdInvitation = emergentAPI.HouseholdInvitation;
export const CreditLog = emergentAPI.CreditLog;
export const AggregatedGroceryData = emergentAPI.AggregatedGroceryData;
export const Recipe = emergentAPI.Recipe;
export const IngredientMap = emergentAPI.IngredientMap;
export const MealPlan = emergentAPI.MealPlan;
export const TestRun = emergentAPI.TestRun;
export const OCRQualityLog = emergentAPI.OCRQualityLog;

// auth sdk:
export const User = emergentAPI.auth;