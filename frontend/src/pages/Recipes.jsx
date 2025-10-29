
import React, { useState, useEffect } from "react";
import { Recipe } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChefHat,
    Search,
    Clock,
    Users,
    AlertTriangle,
    X,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureGuard } from "@/components/shared/FeatureGuard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AddToMealPlanDialog from "../components/recipes/AddToMealPlanDialog";

const ALLERGEN_LABELS = {
    celery: "Celery",
    cereals_gluten: "Gluten",
    crustaceans: "Crustaceans",
    eggs: "Eggs",
    fish: "Fish",
    lupin: "Lupin",
    milk: "Milk/Dairy",
    molluscs: "Molluscs",
    mustard: "Mustard",
    peanuts: "Peanuts",
    sesame_seeds: "Sesame",
    soybeans: "Soy",
    sulphur_dioxide_sulphites: "Sulphites",
    tree_nuts: "Tree Nuts"
};

const RecipeCard = ({ recipe, onClick }) => {
    const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm"
                onClick={() => onClick(recipe)}
            >
                {recipe.image_url && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        {totalTime > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{totalTime} min</span>
                            </div>
                        )}
                        {recipe.servings && (
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{recipe.servings} servings</span>
                            </div>
                        )}
                    </div>

                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {recipe.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {recipe.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{recipe.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    {recipe.allergens && recipe.allergens.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Contains allergens</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const RecipeDetailModal = ({ recipe, open, onClose }) => {
    const [showMealPlanDialog, setShowMealPlanDialog] = useState(false);

    if (!recipe) return null;

    const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl pr-8">{recipe.title}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {recipe.image_url && (
                            <img
                                src={recipe.image_url}
                                alt={recipe.title}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                            {recipe.prep_time_minutes > 0 && (
                                <div>
                                    <span className="font-semibold">Prep:</span> {recipe.prep_time_minutes} min
                                </div>
                            )}
                            {recipe.cook_time_minutes > 0 && (
                                <div>
                                    <span className="font-semibold">Cook:</span> {recipe.cook_time_minutes} min
                                </div>
                            )}
                            {totalTime > 0 && (
                                <div>
                                    <span className="font-semibold">Total:</span> {totalTime} min
                                </div>
                            )}
                            {recipe.servings && (
                                <div>
                                    <span className="font-semibold">Servings:</span> {recipe.servings}
                                </div>
                            )}
                        </div>

                        {recipe.tags && recipe.tags.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {recipe.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recipe.allergens && recipe.allergens.length > 0 && (
                            <Alert className="border-orange-200 bg-orange-50">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-800">
                                    <span className="font-semibold">Allergen Warning:</span> This recipe contains {recipe.allergens.map(a => ALLERGEN_LABELS[a]).join(", ")}
                                </AlertDescription>
                            </Alert>
                        )}

                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Ingredients</h4>
                                <ul className="space-y-1">
                                    {recipe.ingredients.map((ingredient, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-slate-400">•</span>
                                            <span>
                                                {ingredient.quantity && <span className="font-medium">{ingredient.quantity} </span>}
                                                {ingredient.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {recipe.description && (
                            <div>
                                <h4 className="font-semibold mb-2">Instructions</h4>
                                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                    {recipe.description}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                onClick={() => setShowMealPlanDialog(true)}
                            >
                                Add to Meal Plan
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AddToMealPlanDialog
                recipe={recipe}
                open={showMealPlanDialog}
                onClose={() => setShowMealPlanDialog(false)}
                onAdded={() => {
                    // Optionally navigate to meal plan page or show success toast/message
                    setShowMealPlanDialog(false); // Close the dialog after adding
                    // You might also want to close the RecipeDetailModal, or leave it open
                }}
            />
        </>
    );
};

function RecipesPageContent() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [filterTag, setFilterTag] = useState("all");
    const [excludeAllergens, setExcludeAllergens] = useState([]);

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        try {
            setLoading(true);
            const data = await Recipe.list("-created_date", 500);
            setRecipes(data || []);
        } catch (error) {
            console.error("Failed to load recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTag = filterTag === "all" || recipe.tags?.includes(filterTag);

        const hasExcludedAllergen = excludeAllergens.length > 0 &&
                                   recipe.allergens?.some(a => excludeAllergens.includes(a));

        return matchesSearch && matchesTag && !hasExcludedAllergen;
    });

    const allTags = [...new Set(recipes.flatMap(r => r.tags || []))];

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Recipes</h1>
                            <p className="text-slate-600">Browse curated recipes for your meal planning</p>
                        </div>
                    </div>
                </motion.div>

                {/* Disclaimer */}
                <Alert className="border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                        <strong>Important:</strong> All recipes are for informational purposes only. Please check ingredient packaging for allergen information before consuming. GroceryTrack does not guarantee the absence of allergens.
                    </AlertDescription>
                </Alert>

                {/* Search & Filters */}
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search recipes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={filterTag} onValueChange={setFilterTag}>
                                <SelectTrigger className="w-full md:w-48">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter by tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Recipes</SelectItem>
                                    {allTags.map(tag => (
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {excludeAllergens.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-600">Excluding:</span>
                                {excludeAllergens.map(allergen => (
                                    <Badge key={allergen} variant="secondary" className="flex items-center gap-1">
                                        {ALLERGEN_LABELS[allergen]}
                                        <button
                                            onClick={() => setExcludeAllergens(prev => prev.filter(a => a !== allergen))}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recipe Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="border-none shadow-lg">
                                <Skeleton className="h-48 w-full rounded-t-lg" />
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredRecipes.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AnimatePresence>
                            {filteredRecipes.map(recipe => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={setSelectedRecipe}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="text-center py-12">
                            <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No recipes found</h3>
                            <p className="text-slate-600">
                                {searchTerm || filterTag !== "all" || excludeAllergens.length > 0
                                    ? "Try adjusting your search or filters"
                                    : "No recipes available yet"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recipe Detail Modal */}
            <RecipeDetailModal
                recipe={selectedRecipe}
                open={!!selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />
        </div>
    );
}

export default function RecipesPage() {
    return (
        <FeatureGuard
            requires="recipes"
            fallbackTitle="Recipes & Meal Planning"
            fallbackDescription="Access to our curated recipe database and meal planning features is currently in beta. Contact us to request access."
        >
            <RecipesPageContent />
        </FeatureGuard>
    );
}
