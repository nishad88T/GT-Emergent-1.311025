from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Helper function for UUID generation
def generate_uuid():
    return str(uuid.uuid4())

# ==================== RECEIPT ====================
class ReceiptItem(BaseModel):
    name: str
    canonical_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    pack_size: Optional[str] = None
    price_per_unit: Optional[float] = None
    discount_applied: bool = False
    offer_description: Optional[str] = None
    approval_state: str = 'pending'
    approved_at: Optional[datetime] = None

class Receipt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    supermarket: str
    store_location: Optional[str] = None
    purchase_date: str
    total_amount: float
    items: List[ReceiptItem] = []
    receipt_image_urls: List[str] = []
    currency: str = 'GBP'
    notes: Optional[str] = None
    is_test_data: bool = False
    validation_status: str = 'processing_background'
    receipt_insights: Optional[Dict[str, Any]] = None
    household_id: str
    user_email: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class ReceiptCreate(BaseModel):
    supermarket: str
    store_location: Optional[str] = None
    purchase_date: str
    total_amount: float
    items: List[ReceiptItem] = []
    receipt_image_urls: List[str] = []
    currency: str = 'GBP'
    notes: Optional[str] = None
    validation_status: str = 'processing_background'
    household_id: str
    user_email: str

# ==================== BUDGET ====================
class Budget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    household_id: str
    user_email: str
    type: str = 'monthly'  # monthly, weekly
    amount: float
    currency: str = 'GBP'
    period_start: str
    period_end: str
    start_day: Optional[int] = None
    category_limits: Optional[Dict[str, float]] = None
    is_active: bool = True
    total_spent: float = 0
    is_test_data: bool = False
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class BudgetCreate(BaseModel):
    household_id: str
    user_email: str
    type: str = 'monthly'
    amount: float
    currency: str = 'GBP'
    period_start: str
    period_end: str
    start_day: Optional[int] = None
    category_limits: Optional[Dict[str, float]] = None

# ==================== HOUSEHOLD ====================
class Household(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    name: str
    admin_id: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class HouseholdCreate(BaseModel):
    name: str
    admin_id: str

# ==================== HOUSEHOLD INVITATION ====================
class HouseholdInvitation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    household_id: str
    invitee_email: str
    inviter_name: str
    token: str
    status: str = 'pending'
    expires_at: datetime
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class HouseholdInvitationCreate(BaseModel):
    household_id: str
    invitee_email: str
    inviter_name: str
    expires_at: datetime

# ==================== CREDIT LOG ====================
class CreditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    user_id: str
    user_email: str
    household_id: str
    event_type: str
    credits_consumed: int
    reference_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CreditLogCreate(BaseModel):
    user_id: str
    user_email: str
    household_id: str
    event_type: str
    credits_consumed: int
    reference_id: Optional[str] = None

# ==================== CORRECTION LOG ====================
class CorrectionLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    receipt_id: str
    original_data: Dict[str, Any]
    corrected_data: Dict[str, Any]
    success_rate: Optional[float] = None
    items_corrected: List[str] = []
    approval_stats: Optional[Dict[str, Any]] = None
    review_duration_ms: Optional[int] = None
    extraction_accuracy_score: Optional[float] = None
    household_id: str
    user_email: str
    created_date: datetime = Field(default_factory=datetime.utcnow)

class CorrectionLogCreate(BaseModel):
    receipt_id: str
    original_data: Dict[str, Any]
    corrected_data: Dict[str, Any]
    household_id: str
    user_email: str

# ==================== OCR FEEDBACK ====================
class OCRFeedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    receipt_id: str
    rating: int
    issues: List[str] = []
    feedback_text: Optional[str] = None
    correction_count: int = 0
    total_items: int = 0
    scan_was_perfect: bool = False
    user_email: str
    created_date: datetime = Field(default_factory=datetime.utcnow)

class OCRFeedbackCreate(BaseModel):
    receipt_id: str
    rating: int
    issues: List[str] = []
    feedback_text: Optional[str] = None
    user_email: str

# ==================== OCR QUALITY LOG ====================
class OCRQualityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    test_run_id: str
    receipt_id: str
    item_index: Optional[int] = None
    error_origin: str
    error_type: str
    original_value: str
    corrected_value: str
    comment: Optional[str] = None
    is_critical_error: bool = False
    receipt_quality: str
    receipt_length_category: str
    store_name: str
    reviewer_id: str
    reviewer_email: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class OCRQualityLogCreate(BaseModel):
    test_run_id: str
    receipt_id: str
    error_origin: str
    error_type: str
    original_value: str
    corrected_value: str
    receipt_quality: str
    receipt_length_category: str
    store_name: str
    reviewer_id: str
    reviewer_email: str

# ==================== TEST RUN ====================
class TestRun(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    name: str
    description: Optional[str] = None
    version: str = '1.0'
    parent_test_run_id: Optional[str] = None
    status: str = 'pending_receipts'
    receipt_ids: List[str] = []
    total_receipts: int = 0
    total_items: int = 0
    reviewed_receipts: int = 0
    batch_analysis_summary: Optional[Dict[str, Any]] = None
    analysis_error: Optional[str] = None
    created_by_email: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class TestRunCreate(BaseModel):
    name: str
    description: Optional[str] = None
    created_by_email: str

# ==================== NUTRITION FACT ====================
class NutritionFact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    canonical_name: str
    source: str = 'CalorieNinjas'
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbohydrate_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    sugar_g: Optional[float] = None
    sodium_mg: Optional[float] = None
    serving_size_g: Optional[float] = None
    household_id: str
    user_email: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class NutritionFactCreate(BaseModel):
    canonical_name: str
    household_id: str
    user_email: str

# ==================== FAILED NUTRITION LOOKUP ====================
class FailedNutritionLookup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    canonical_name: str
    last_attempt_date: datetime = Field(default_factory=datetime.utcnow)
    attempt_count: int = 1
    source: str = 'CalorieNinjas'
    household_id: str
    user_email: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class FailedNutritionLookupCreate(BaseModel):
    canonical_name: str
    household_id: str
    user_email: str

# ==================== RECIPE ====================
class Recipe(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    title: str
    description: Optional[str] = None
    ingredients: List[Dict[str, Any]] = []
    servings: Optional[int] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    tags: List[str] = []
    allergens: List[str] = []
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    external_id: Optional[str] = None
    is_curated: bool = False
    canonicalized: bool = False
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: List[Dict[str, Any]] = []
    servings: Optional[int] = None

# ==================== INGREDIENT MAP ====================
class IngredientMap(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    raw_ingredient_string: str
    canonical_name: str
    category: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class IngredientMapCreate(BaseModel):
    raw_ingredient_string: str
    canonical_name: str
    category: str

# ==================== MEAL PLAN ====================
class MealPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    user_email: str
    household_id: str
    week_start_date: str
    recipe_selections: Dict[str, Any] = {}
    shopping_frequency: str = 'weekly'
    last_shopping_list_generated: Optional[datetime] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class MealPlanCreate(BaseModel):
    user_email: str
    household_id: str
    week_start_date: str
    shopping_frequency: str = 'weekly'

# ==================== AGGREGATED GROCERY DATA ====================
class AggregatedGroceryData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    store_name: str
    location_city: Optional[str] = None
    item_canonical_name: str
    category: str
    latest_price: float
    price_observations: List[Dict[str, Any]] = []
    last_updated_date: datetime = Field(default_factory=datetime.utcnow)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class AggregatedGroceryDataCreate(BaseModel):
    store_name: str
    item_canonical_name: str
    category: str
    latest_price: float

# ==================== FAILED SCAN LOG ====================
class FailedScanLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=generate_uuid)
    user_email: str
    household_id: str
    image_urls: List[str] = []
    error_message: str
    error_stage: str  # 'upload', 'ocr', 'llm_enhancement'
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FailedScanLogCreate(BaseModel):
    user_email: str
    household_id: str
    image_urls: List[str] = []
    error_message: str
    error_stage: str
