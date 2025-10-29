import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import emergentAPI from "@/api/emergentClient";

export default function MealPlan() {
    const [mealPlans, setMealPlans] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await emergentAPI.auth.me();
            setCurrentUser(userData);
            
            // Meal plans would be implemented when backend supports them
            setMealPlans([]);
        } catch (error) {
            console.error('Error loading meal plan data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading meal plans...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Meal Planning</h1>
                <p className="text-gray-600">Plan your meals and generate smart shopping lists</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Meal Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Meal planning calendar coming soon...</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recipe Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Recipe suggestions coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}