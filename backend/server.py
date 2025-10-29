from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import shutil

# Import models
from models import (
    Receipt, ReceiptCreate, Budget, BudgetCreate,
    Household, HouseholdCreate, HouseholdInvitation, HouseholdInvitationCreate,
    CreditLog, CreditLogCreate, CorrectionLog, CorrectionLogCreate,
    OCRFeedback, OCRFeedbackCreate, OCRQualityLog, OCRQualityLogCreate,
    TestRun, TestRunCreate, NutritionFact, NutritionFactCreate,
    FailedNutritionLookup, FailedNutritionLookupCreate,
    Recipe, RecipeCreate, IngredientMap, IngredientMapCreate,
    MealPlan, MealPlanCreate, AggregatedGroceryData, AggregatedGroceryDataCreate,
    FailedScanLog, FailedScanLogCreate
)

# Import functions
from functions import (
    process_receipt_in_background,
    generate_receipt_insights_in_background,
    ons_data_fetcher,
    send_invitation,
    delete_user_account,
    assign_household_to_old_receipts,
    generate_modeled_data,
    get_comprehensive_credit_report,
    create_test_run,
    submit_ocr_quality_feedback,
    analyze_ocr_feedback_batch,
    send_welcome_email,
    send_test_email,
    rollover_budget,
    aggregate_grocery_data,
    calorie_ninjas_nutrition_placeholder
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'grocerytrack_db')]

# Create the main app
app = FastAPI(title="GroceryTrack API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== HEALTH CHECK ====================
@api_router.get("/")
async def root():
    return {
        "message": "GroceryTrack API v1.0",
        "status": "running",
        "endpoints": {
            "receipts": "/api/receipts",
            "budgets": "/api/budgets",
            "households": "/api/households",
            "functions": "/api/functions/*"
        }
    }

@api_router.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# ==================== RECEIPT ENDPOINTS ====================
@api_router.post("/receipts", response_model=Receipt)
async def create_receipt(receipt: ReceiptCreate, background_tasks: BackgroundTasks):
    """Create a new receipt"""
    try:
        receipt_dict = receipt.model_dump()
        receipt_obj = Receipt(**receipt_dict)
        
        doc = receipt_obj.model_dump()
        doc['created_date'] = doc['created_date'].isoformat()
        doc['updated_date'] = doc['updated_date'].isoformat()
        
        await db.receipts.insert_one(doc)
        
        # Trigger background processing if needed
        if receipt_obj.validation_status == 'processing_background':
            background_tasks.add_task(
                process_receipt_in_background,
                receipt_obj.id,
                receipt_obj.receipt_image_urls,
                receipt_obj.supermarket,
                receipt_obj.total_amount,
                receipt_obj.household_id,
                receipt_obj.user_email,
                db
            )
        
        return receipt_obj
    except Exception as e:
        logger.error(f"Error creating receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/receipts/{receipt_id}", response_model=Receipt)
async def get_receipt(receipt_id: str):
    """Get a single receipt by ID"""
    receipt = await db.receipts.find_one({"id": receipt_id}, {"_id": 0})
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Convert ISO strings back to datetime
    if isinstance(receipt.get('created_date'), str):
        receipt['created_date'] = datetime.fromisoformat(receipt['created_date'])
    if isinstance(receipt.get('updated_date'), str):
        receipt['updated_date'] = datetime.fromisoformat(receipt['updated_date'])
    
    return receipt

@api_router.get("/receipts", response_model=List[Receipt])
async def get_receipts(household_id: Optional[str] = None, limit: int = 100):
    """Get all receipts, optionally filtered by household"""
    try:
        query = {}
        if household_id:
            query["household_id"] = household_id
        
        receipts = await db.receipts.find(query, {"_id": 0}).sort("created_date", -1).limit(limit).to_list(limit)
        
        # Convert ISO strings to datetime
        for receipt in receipts:
            if isinstance(receipt.get('created_date'), str):
                receipt['created_date'] = datetime.fromisoformat(receipt['created_date'])
            if isinstance(receipt.get('updated_date'), str):
                receipt['updated_date'] = datetime.fromisoformat(receipt['updated_date'])
        
        return receipts
    except Exception as e:
        logger.error(f"Error fetching receipts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/receipts/{receipt_id}")
async def update_receipt(receipt_id: str, update_data: Dict[str, Any]):
    """Update a receipt"""
    try:
        update_data['updated_date'] = datetime.utcnow().isoformat()
        
        result = await db.receipts.update_one(
            {"id": receipt_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        return {"status": "success", "message": "Receipt updated"}
    except Exception as e:
        logger.error(f"Error updating receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/receipts/{receipt_id}")
async def delete_receipt(receipt_id: str):
    """Delete a receipt"""
    result = await db.receipts.delete_one({"id": receipt_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return {"status": "success", "message": "Receipt deleted"}

# ==================== BUDGET ENDPOINTS ====================
@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate):
    """Create a new budget"""
    try:
        budget_dict = budget.model_dump()
        budget_obj = Budget(**budget_dict)
        
        doc = budget_obj.model_dump()
        doc['created_date'] = doc['created_date'].isoformat()
        doc['updated_date'] = doc['updated_date'].isoformat()
        
        await db.budgets.insert_one(doc)
        return budget_obj
    except Exception as e:
        logger.error(f"Error creating budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/budgets/{budget_id}", response_model=Budget)
async def get_budget(budget_id: str):
    """Get a single budget by ID"""
    budget = await db.budgets.find_one({"id": budget_id}, {"_id": 0})
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    if isinstance(budget.get('created_date'), str):
        budget['created_date'] = datetime.fromisoformat(budget['created_date'])
    if isinstance(budget.get('updated_date'), str):
        budget['updated_date'] = datetime.fromisoformat(budget['updated_date'])
    
    return budget

@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets(household_id: Optional[str] = None):
    """Get all budgets, optionally filtered by household"""
    query = {}
    if household_id:
        query["household_id"] = household_id
    
    budgets = await db.budgets.find(query, {"_id": 0}).to_list(100)
    
    for budget in budgets:
        if isinstance(budget.get('created_date'), str):
            budget['created_date'] = datetime.fromisoformat(budget['created_date'])
        if isinstance(budget.get('updated_date'), str):
            budget['updated_date'] = datetime.fromisoformat(budget['updated_date'])
    
    return budgets

@api_router.put("/budgets/{budget_id}")
async def update_budget(budget_id: str, update_data: Dict[str, Any]):
    """Update a budget"""
    update_data['updated_date'] = datetime.utcnow().isoformat()
    
    result = await db.budgets.update_one(
        {"id": budget_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    return {"status": "success", "message": "Budget updated"}

@api_router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    """Delete a budget"""
    result = await db.budgets.delete_one({"id": budget_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"status": "success", "message": "Budget deleted"}

# ==================== HOUSEHOLD ENDPOINTS ====================
@api_router.post("/households", response_model=Household)
async def create_household(household: HouseholdCreate):
    """Create a new household"""
    try:
        household_dict = household.model_dump()
        household_obj = Household(**household_dict)
        
        doc = household_obj.model_dump()
        doc['created_date'] = doc['created_date'].isoformat()
        doc['updated_date'] = doc['updated_date'].isoformat()
        
        await db.households.insert_one(doc)
        return household_obj
    except Exception as e:
        logger.error(f"Error creating household: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/households/{household_id}", response_model=Household)
async def get_household(household_id: str):
    """Get a single household by ID"""
    household = await db.households.find_one({"id": household_id}, {"_id": 0})
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    
    if isinstance(household.get('created_date'), str):
        household['created_date'] = datetime.fromisoformat(household['created_date'])
    if isinstance(household.get('updated_date'), str):
        household['updated_date'] = datetime.fromisoformat(household['updated_date'])
    
    return household

@api_router.get("/households")
async def get_households():
    """Get all households"""
    households = await db.households.find({}, {"_id": 0}).to_list(100)
    
    for household in households:
        if isinstance(household.get('created_date'), str):
            household['created_date'] = datetime.fromisoformat(household['created_date'])
        if isinstance(household.get('updated_date'), str):
            household['updated_date'] = datetime.fromisoformat(household['updated_date'])
    
    return households

# ==================== FILE UPLOAD ====================
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (receipt image)"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = Path("/app/uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        import uuid
        file_ext = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # In production, you'd upload to S3 or similar
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "file_url": file_url,
            "filename": unique_filename,
            "original_filename": file.filename
        }
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FUNCTION INVOCATION ENDPOINTS ====================
@api_router.post("/functions/processReceiptInBackground")
async def invoke_process_receipt(data: Dict[str, Any], background_tasks: BackgroundTasks):
    """Invoke processReceiptInBackground function"""
    try:
        background_tasks.add_task(
            process_receipt_in_background,
            data['receiptId'],
            data['imageUrls'],
            data['storeName'],
            data['totalAmount'],
            data['householdId'],
            data['userEmail'],
            db
        )
        return {"status": "processing", "message": "Receipt processing started in background"}
    except Exception as e:
        logger.error(f"Error invoking function: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/calorieNinjasNutrition")
async def invoke_nutrition_lookup(data: Dict[str, Any]):
    """Invoke calorieNinjasNutrition function"""
    try:
        result = await calorie_ninjas_nutrition_placeholder(
            data['canonical_name'],
            data['household_id']
        )
        return result
    except Exception as e:
        logger.error(f"Error invoking nutrition lookup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/functions/onsDataFetcher")
async def invoke_ons_data():
    """Fetch ONS inflation data"""
    try:
        result = await ons_data_fetcher()
        return result
    except Exception as e:
        logger.error(f"Error fetching ONS data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/sendInvitation")
async def invoke_send_invitation(data: Dict[str, Any]):
    """Send household invitation"""
    try:
        result = await send_invitation(
            data['invitee_email'],
            data['inviter_name'],
            data['invitation_link'],
            data['household_id'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error sending invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/deleteUserAccount")
async def invoke_delete_account(data: Dict[str, Any]):
    """Delete user account and all data"""
    try:
        result = await delete_user_account(
            data['user_id'],
            data['user_email'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/assignHouseholdToOldReceipts")
async def invoke_assign_household(data: Dict[str, Any]):
    """Assign household to old receipts"""
    try:
        result = await assign_household_to_old_receipts(
            data['user_email'],
            data['household_id'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error assigning household: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/generateModeledData")
async def invoke_generate_data(data: Dict[str, Any]):
    """Generate or remove test data"""
    try:
        result = await generate_modeled_data(
            data['action'],
            data['user_email'],
            data['household_id'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error with modeled data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/functions/getComprehensiveCreditReport")
async def invoke_credit_report(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Get comprehensive credit report"""
    try:
        result = await get_comprehensive_credit_report(start_date, end_date, db)
        return result
    except Exception as e:
        logger.error(f"Error generating credit report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/createTestRun")
async def invoke_create_test_run(data: Dict[str, Any]):
    """Create OCR test run"""
    try:
        result = await create_test_run(
            data['name'],
            data.get('description', ''),
            data['created_by_email'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error creating test run: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/submitOCRQualityFeedback")
async def invoke_submit_feedback(data: Dict[str, Any]):
    """Submit OCR quality feedback"""
    try:
        result = await submit_ocr_quality_feedback(
            data['test_run_id'],
            data['receipt_id'],
            data['feedback_items'],
            data['receipt_quality'],
            data['receipt_length_category'],
            data['store_name'],
            data['reviewer_id'],
            data['reviewer_email'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/analyzeOCRFeedbackBatch")
async def invoke_analyze_feedback(data: Dict[str, Any]):
    """Analyze OCR feedback batch"""
    try:
        result = await analyze_ocr_feedback_batch(data['test_run_id'], db)
        return result
    except Exception as e:
        logger.error(f"Error analyzing feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/sendWelcomeEmail")
async def invoke_welcome_email(data: Dict[str, Any]):
    """Send welcome email"""
    try:
        result = await send_welcome_email(
            data['user_email'],
            data['user_name']
        )
        return result
    except Exception as e:
        logger.error(f"Error sending welcome email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/rolloverBudget")
async def invoke_rollover_budget(data: Dict[str, Any]):
    """Rollover budget to next period"""
    try:
        result = await rollover_budget(
            data['household_id'],
            data['user_email'],
            db
        )
        return result
    except Exception as e:
        logger.error(f"Error rolling over budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/functions/aggregateGroceryData")
async def invoke_aggregate_data():
    """Aggregate grocery data (admin/cron job)"""
    try:
        result = await aggregate_grocery_data(db)
        return result
    except Exception as e:
        logger.error(f"Error aggregating data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ADDITIONAL ENTITY ENDPOINTS ====================
# Credit Logs
@api_router.post("/credit-logs", response_model=CreditLog)
async def create_credit_log(log: CreditLogCreate):
    """Create a credit log entry"""
    try:
        log_dict = log.model_dump()
        log_obj = CreditLog(**log_dict)
        
        doc = log_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.credit_logs.insert_one(doc)
        return log_obj
    except Exception as e:
        logger.error(f"Error creating credit log: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/credit-logs")
async def get_credit_logs(household_id: Optional[str] = None, user_email: Optional[str] = None):
    """Get credit logs"""
    query = {}
    if household_id:
        query["household_id"] = household_id
    if user_email:
        query["user_email"] = user_email
    
    logs = await db.credit_logs.find(query, {"_id": 0}).to_list(1000)
    
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    
    return logs

# Nutrition Facts
@api_router.get("/nutrition-facts")
async def get_nutrition_facts(household_id: Optional[str] = None):
    """Get nutrition facts"""
    query = {}
    if household_id:
        query["household_id"] = household_id
    
    facts = await db.nutrition_facts.find(query, {"_id": 0}).to_list(1000)
    return facts

# Recipes
@api_router.post("/recipes", response_model=Recipe)
async def create_recipe(recipe: RecipeCreate):
    """Create a new recipe"""
    try:
        recipe_dict = recipe.model_dump()
        recipe_obj = Recipe(**recipe_dict)
        
        doc = recipe_obj.model_dump()
        doc['created_date'] = doc['created_date'].isoformat()
        doc['updated_date'] = doc['updated_date'].isoformat()
        
        await db.recipes.insert_one(doc)
        return recipe_obj
    except Exception as e:
        logger.error(f"Error creating recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/recipes")
async def get_recipes():
    """Get all recipes"""
    recipes = await db.recipes.find({}, {"_id": 0}).to_list(100)
    return recipes

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
