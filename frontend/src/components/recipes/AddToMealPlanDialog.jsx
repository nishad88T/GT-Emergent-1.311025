import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import emergentAPI from "@/api/emergentClient";

export default function AddToMealPlanDialog({ recipe, onClose, onAdded }) {
    const [selectedDate, setSelectedDate] = useState('');
    const [mealType, setMealType] = useState('dinner');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!selectedDate) {
            alert('Please select a date');
            return;
        }

        setLoading(true);
        try {
            // This would add recipe to meal plan when backend supports it
            console.log('Adding recipe to meal plan:', {
                recipe: recipe,
                date: selectedDate,
                mealType: mealType
            });
            onAdded && onAdded();
            onClose && onClose();
        } catch (error) {
            console.error('Error adding to meal plan:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Add to Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Meal Type</label>
                        <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                        {loading ? 'Adding...' : 'Add to Plan'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}