import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import emergentAPI from "@/api/emergentClient";

export default function AboutPage() {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">About GroceryTrack</h1>
                <p className="text-gray-600">Your intelligent grocery spending companion</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">
                            GroceryTrack helps you take control of your grocery spending through 
                            intelligent receipt scanning, AI-powered insights, and comprehensive 
                            budget management.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Smart receipt scanning with OCR technology</li>
                            <li>AI-powered expense categorization</li>
                            <li>Budget tracking and alerts</li>
                            <li>Nutrition analysis and insights</li>
                            <li>Household expense sharing</li>
                            <li>Comprehensive analytics and reporting</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}