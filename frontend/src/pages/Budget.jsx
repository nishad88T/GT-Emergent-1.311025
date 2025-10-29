import React, { useState, useEffect, useCallback } from "react";
import { User, Budget as BudgetEntity } from "@/api/entities";
import { rolloverBudget, generateModeledData } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Target } from "lucide-react";
import emergentAPI from "@/api/emergentClient";

function Budget() {
    const [currentUser, setCurrentUser] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentBudget, setCurrentBudget] = useState(null);
    const [budgetStatus, setBudgetStatus] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const userData = await User.me();
            setCurrentUser(userData);

            if (!userData || !userData.household_id) {
                setBudgets([]);
                setCurrentBudget(null);
                setBudgetStatus(null);
                setLoading(false);
                return;
            }

            const budgetData = await BudgetEntity.filter({ household_id: userData.household_id }, "-created_date", 10);
            setBudgets(budgetData || []);

            // Find active budget
            const activeBudget = budgetData?.find(b => b.is_active) || null;
            setCurrentBudget(activeBudget);

            // Calculate budget status if we have an active budget
            if (activeBudget) {
                const status = {
                    totalSpent: activeBudget.total_spent || 0,
                    totalBudget: activeBudget.amount,
                    remainingBudget: activeBudget.amount - (activeBudget.total_spent || 0),
                    percentageUsed: Math.round(((activeBudget.total_spent || 0) / activeBudget.amount) * 100),
                    daysRemaining: calculateDaysRemaining(activeBudget.period_end),
                    categoryBreakdown: activeBudget.category_limits || {}
                };
                setBudgetStatus(status);
            } else {
                setBudgetStatus(null);
            }

        } catch (error) {
            console.error("Error loading budget data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const handleBudgetCreated = () => {
        loadData();
    };

    const handleRolloverBudget = async () => {
        if (!currentUser || !currentBudget) return;

        try {
            await rolloverBudget({
                household_id: currentUser.household_id,
                user_email: currentUser.email
            });
            await loadData();
        } catch (error) {
            console.error("Error rolling over budget:", error);
        }
    };

    const handleGenerateTestData = async () => {
        if (!currentUser) return;

        try {
            await generateModeledData({
                action: "generate",
                user_email: currentUser.email,
                household_id: currentUser.household_id
            });
            await loadData();
        } catch (error) {
            console.error("Error generating test data:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading budget data...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Budget Management</h1>
                    <p className="text-gray-600">Track your spending and stay within your limits</p>
                </div>
                
                {currentBudget && (
                    <div className="flex gap-2">
                        <Button onClick={handleRolloverBudget} variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Rollover Budget
                        </Button>
                        <Button onClick={handleGenerateTestData} variant="outline">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Generate Test Data
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="current" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="current">Current Budget</TabsTrigger>
                    <TabsTrigger value="setup">Setup Budget</TabsTrigger>
                    <TabsTrigger value="history">Budget History</TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="space-y-6">
                    {currentBudget && budgetStatus ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-gray-600">Budget status display coming soon...</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No Active Budget</h3>
                                    <p className="text-gray-600 mb-4">Create your first budget to start tracking your spending.</p>
                                    <Button onClick={() => document.querySelector('[data-state="inactive"][value="setup"]')?.click()}>
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Create Budget
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="setup" className="space-y-6">
                    <BudgetSetup 
                        currentUser={currentUser}
                        onBudgetCreated={handleBudgetCreated}
                        existingBudget={currentBudget}
                    />
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <BudgetHistory 
                        budgets={budgets}
                        onUpdate={loadData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Budget;