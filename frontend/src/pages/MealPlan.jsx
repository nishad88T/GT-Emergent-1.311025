
import React, { useState, useEffect } from "react";
import { MealPlan, Recipe } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, ChefHat, Plus, Trash2, ShoppingCart, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, isThisWeek } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FeatureGuard } from "@/components/shared/FeatureGuard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import GenerateShoppingListModal from "../components/mealplan/GenerateShoppingListModal";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

const MealSlot = ({ day, meal, selection, recipe, onRemove }) => {
    if (!selection || !recipe) {
        return (
            <div className="p-2 md:p-3 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs md:text-sm">
                No meal planned
            </div>
        );
    }

    const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-2 md:p-3 border border-emerald-200 bg-emerald-50/50 rounded-lg hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 text-xs md:text-sm line-clamp-2 mb-1">
                        {recipe.title}
                    </h4>
                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-slate-600">
                        {totalTime > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span>{totalTime}m</span>
                            </div>
                        )}
                        {selection.servings && (
                            <div className="flex items-center gap-1">
                                <Users className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span>{selection.servings}</span>
                            </div>
                        )}
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {recipe.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px] md:text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 md:h-7 md:w-7 text-slate-400 hover:text-red-600 flex-shrink-0"
                    onClick={() => onRemove(day, meal)}
                >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
            </div>
        </motion.div>
    );
};

// Mobile day view component
const MobileDayView = ({ day, dayIndex, currentWeekStart, mealPlan, recipes, onRemoveMeal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dayDate = addDays(currentWeekStart, dayIndex);
    
    const mealsForDay = MEALS.map(meal => {
        const selection = mealPlan?.recipe_selections?.find(
            sel => sel.day === day && sel.meal === meal
        );
        const recipe = selection ? recipes[selection.recipe_id] : null;
        return { meal, selection, recipe };
    }).filter(m => m.selection && m.recipe);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-slate-200 rounded-lg">
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                    <div>
                        <h3 className="font-semibold text-slate-900 capitalize">{day}</h3>
                        <p className="text-xs text-slate-500">{format(dayDate, "MMM d")}</p>
                        {mealsForDay.length > 0 && (
                            <Badge variant="outline" className="mt-1 text-xs">
                                {mealsForDay.length} meal{mealsForDay.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                    {MEALS.map(meal => {
                        const selection = mealPlan?.recipe_selections?.find(
                            sel => sel.day === day && sel.meal === meal
                        );
                        const recipe = selection ? recipes[selection.recipe_id] : null;
                        
                        return (
                            <div key={meal}>
                                <h4 className="text-xs font-medium text-slate-600 mb-1.5 capitalize">{meal}</h4>
                                <MealSlot
                                    day={day}
                                    meal={meal}
                                    selection={selection}
                                    recipe={recipe}
                                    onRemove={onRemoveMeal}
                                />
                            </div>
                        );
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

function MealPlanPageContent() {
    const [mealPlans, setMealPlans] = useState([]);
    const [recipes, setRecipes] = useState({});
    const [loading, setLoading] = useState(true);
    // Initialize with a default value to prevent null issues on first render
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [currentUser, setCurrentUser] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    useEffect(() => {
        const initializeWeek = async () => {
            try {
                const user = await base44.auth.me();
                setCurrentUser(user);
                const weekStartsOn = user?.week_starts_on ?? 1; // Default to Monday (1)
                setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn }));
            } catch (error) {
                console.error("Failed to load user or set initial week:", error);
                // Fallback to default Monday if user loading fails. currentWeekStart already initialized.
                // explicitly setting it again for clarity in error case.
                setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
            }
        };
        initializeWeek();
    }, []); // Run only once on component mount

    useEffect(() => {
        // loadData should only run after currentWeekStart has been properly initialized
        if (currentWeekStart) {
            loadData();
        }
    }, [currentWeekStart]);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await base44.auth.me(); // Re-fetches user, ensuring currentUser state is up-to-date
            setCurrentUser(user);

            if (!user || !user.household_id) {
                setMealPlans([]);
                setRecipes({});
                setLoading(false);
                return;
            }

            const plans = await MealPlan.filter({
                household_id: user.household_id,
                week_start_date: format(currentWeekStart, "yyyy-MM-dd")
            });

            setMealPlans(plans || []);

            if (plans && plans.length > 0) {
                const recipeIds = [...new Set(
                    plans.flatMap(p => (p.recipe_selections || []).map(s => s.recipe_id))
                )];

                const recipeData = {};
                for (const id of recipeIds) {
                    try {
                        const recipe = await Recipe.filter({ id });
                        if (recipe && recipe.length > 0) {
                            recipeData[id] = recipe[0];
                        }
                    } catch (err) {
                        console.error(`Failed to fetch recipe ${id}:`, err);
                    }
                }
                setRecipes(recipeData);
            } else {
                setRecipes({}); // Clear recipes if no plans
            }
        } catch (error) {
            console.error("Error loading meal plan:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = mealPlans.length > 0 ? mealPlans[0] : null;

    const handleRemoveMeal = async (day, meal) => {
        if (!currentPlan) return;

        try {
            const updatedSelections = (currentPlan.recipe_selections || []).filter(
                sel => !(sel.day === day && sel.meal === meal)
            );

            await MealPlan.update(currentPlan.id, {
                recipe_selections: updatedSelections
            });

            toast.success("Meal removed from plan");
            loadData();
        } catch (error) {
            console.error("Error removing meal:", error);
            toast.error("Failed to remove meal");
        }
    };

    const getMealForSlot = (day, meal) => {
        if (!currentPlan) return null;
        return (currentPlan.recipe_selections || []).find(
            sel => sel.day === day && sel.meal === meal
        );
    };

    const handleGenerateList = () => {
        if (!currentPlan || !currentPlan.recipe_selections || currentPlan.recipe_selections.length === 0) {
            toast.error("Please add some recipes to your meal plan first");
            return;
        }
        setShowGenerateModal(true);
    };

    const handleDateSelect = (date) => {
        if (date && currentUser) {
            const weekStartsOn = currentUser?.week_starts_on ?? 1;
            const weekStart = startOfWeek(date, { weekStartsOn });
            setCurrentWeekStart(weekStart);
            setCalendarOpen(false);
        } else if (date) { // Fallback if currentUser is not yet loaded, use default
            const weekStart = startOfWeek(date, { weekStartsOn: 1 });
            setCurrentWeekStart(weekStart);
            setCalendarOpen(false);
        }
    };

    return (
        <div className="p-3 sm:p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4"
                >
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">Meal Plan</h1>
                            <p className="text-xs md:text-sm text-slate-600">Plan your meals for the week</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex-1 md:flex-none">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">
                                        {isThisWeek(currentWeekStart, { weekStartsOn: currentUser?.week_starts_on ?? 1 }) 
                                            ? "This Week" 
                                            : format(currentWeekStart, "MMM d, yyyy")}
                                    </span>
                                    <span className="sm:hidden">
                                        {format(currentWeekStart, "MMM d")}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={currentWeekStart}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                    weekStartsOn={currentUser?.week_starts_on ?? 1}
                                />
                            </PopoverContent>
                        </Popover>

                        <Link to={createPageUrl("Recipes")} className="flex-1 md:flex-none">
                            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Add Recipes</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Generate Shopping List Button */}
                {currentPlan && currentPlan.recipe_selections && currentPlan.recipe_selections.length > 0 && (
                    <Card className="border-emerald-200 bg-emerald-50/80 shadow-lg">
                        <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm md:text-base">Ready to shop?</h3>
                                <p className="text-xs md:text-sm text-slate-600">Generate a smart shopping list from your meal plan</p>
                            </div>
                            <Button 
                                onClick={handleGenerateList}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Generate List
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Meal Plan Grid/List */}
                {loading ? (
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24 md:h-32 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Desktop Grid View */}
                        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm hidden md:block">
                            <CardContent className="p-4 md:p-6">
                                <div className="overflow-x-auto">
                                    <div className="min-w-[800px]">
                                        {/* Header Row */}
                                        <div className="grid grid-cols-8 gap-2 md:gap-3 mb-4">
                                            <div className="font-semibold text-slate-700"></div>
                                            {DAYS.map((day, idx) => (
                                                <div key={day} className="text-center">
                                                    <div className="font-semibold text-slate-900 text-sm md:text-base">
                                                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {format(addDays(currentWeekStart, idx), "MMM d")}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Meal Rows */}
                                        {MEALS.map(meal => (
                                            <div key={meal} className="grid grid-cols-8 gap-2 md:gap-3 mb-2 md:mb-3">
                                                <div className="flex items-center">
                                                    <span className="font-medium text-slate-700 capitalize text-xs md:text-sm">
                                                        {meal}
                                                    </span>
                                                </div>
                                                {DAYS.map(day => {
                                                    const selection = getMealForSlot(day, meal);
                                                    const recipe = selection ? recipes[selection.recipe_id] : null;
                                                    return (
                                                        <MealSlot
                                                            key={`${day}-${meal}`}
                                                            day={day}
                                                            meal={meal}
                                                            selection={selection}
                                                            recipe={recipe}
                                                            onRemove={handleRemoveMeal}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {(!currentPlan || !currentPlan.recipe_selections || currentPlan.recipe_selections.length === 0) && (
                                    <div className="text-center py-8 md:py-12">
                                        <ChefHat className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">No meals planned yet</h3>
                                        <p className="text-sm md:text-base text-slate-600 mb-4">
                                            Start by browsing recipes and adding them to your meal plan
                                        </p>
                                        <Link to={createPageUrl("Recipes")}>
                                            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Browse Recipes
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mobile List View */}
                        <div className="md:hidden space-y-3">
                            {DAYS.map((day, idx) => (
                                <MobileDayView
                                    key={day}
                                    day={day}
                                    dayIndex={idx}
                                    currentWeekStart={currentWeekStart}
                                    mealPlan={currentPlan}
                                    recipes={recipes}
                                    onRemoveMeal={handleRemoveMeal}
                                />
                            ))}
                            
                            {(!currentPlan || !currentPlan.recipe_selections || currentPlan.recipe_selections.length === 0) && (
                                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardContent className="text-center py-8 p-4">
                                        <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-base font-semibold text-slate-900 mb-2">No meals planned yet</h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Start by browsing recipes and adding them to your meal plan
                                        </p>
                                        <Link to={createPageUrl("Recipes")}>
                                            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Browse Recipes
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Generate Shopping List Modal */}
            {currentPlan && (
                <GenerateShoppingListModal
                    mealPlan={currentPlan}
                    open={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                />
            )}
        </div>
    );
}

export default function MealPlanPage() {
    return (
        <FeatureGuard
            requires="recipes"
            fallbackTitle="Meal Planning"
            fallbackDescription="Access to meal planning features is currently in beta. Contact us to request access."
        >
            <MealPlanPageContent />
        </FeatureGuard>
    );
}
