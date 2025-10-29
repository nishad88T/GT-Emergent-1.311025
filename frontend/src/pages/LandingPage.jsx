import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import emergentAPI from "@/api/emergentClient";

export default function LandingPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGetStarted = async () => {
        setIsLoading(true);
        try {
            // Check if user is authenticated
            const user = await emergentAPI.auth.me();
            if (user) {
                // Redirect to dashboard if authenticated
                window.location.href = '/Dashboard';
            } else {
                // Redirect to login if not authenticated
                window.location.href = '/login';
            }
        } catch (error) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = '/login';
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Smart Grocery Spending Tracker
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Take control of your grocery spending with AI-powered receipt scanning, 
                        smart budgeting, and comprehensive insights.
                    </p>
                    <Button 
                        onClick={handleGetStarted}
                        disabled={isLoading}
                        size="lg"
                        className="text-lg px-8 py-3"
                    >
                        {isLoading ? 'Loading...' : 'Get Started Free'}
                    </Button>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-2xl mb-2">📱 Smart Scanning</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Scan receipts with your phone and let AI automatically 
                                categorize and analyze your purchases.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-2xl mb-2">📊 Budget Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Set budgets by category and get real-time alerts 
                                to stay within your spending limits.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-2xl mb-2">🏠 Household Sharing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Share expenses with family members and get a 
                                complete view of your household spending.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Take Control?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Join thousands of users who are already saving money with GroceryTrack.
                    </p>
                    <Button 
                        onClick={handleGetStarted}
                        disabled={isLoading}
                        size="lg"
                        className="text-lg px-8 py-3"
                    >
                        {isLoading ? 'Loading...' : 'Start Tracking Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
}