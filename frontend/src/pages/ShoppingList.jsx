import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import emergentAPI from "@/api/emergentClient";

function ShoppingList() {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await emergentAPI.auth.me();
            setCurrentUser(userData);
            
            // Shopping lists would be implemented when backend supports them
            setShoppingLists([]);
        } catch (error) {
            console.error("Error loading shopping lists:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading shopping lists...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Shopping Lists</h1>
                <p className="text-gray-600">Plan your shopping with AI-powered lists</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Shopping List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Shopping list creation coming soon...</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Shopping Lists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {shoppingLists.length > 0 ? (
                            <p className="text-gray-600">Shopping list view coming soon...</p>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No shopping lists yet.</p>
                                <p>Create your first list above!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ShoppingList;