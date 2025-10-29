import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import emergentAPI from "@/api/emergentClient";

export default function GenerateShoppingListModal({ mealPlan, onClose, onGenerated }) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // This would generate a shopping list when backend supports it
            console.log('Generating shopping list for meal plan:', mealPlan);
            onGenerated && onGenerated();
            onClose && onClose();
        } catch (error) {
            console.error('Error generating shopping list:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Generate Shopping List</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-4">
                    Generate a smart shopping list based on your meal plan for this week.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate List'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}