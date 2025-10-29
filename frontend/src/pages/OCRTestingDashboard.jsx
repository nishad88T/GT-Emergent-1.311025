import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import emergentAPI from "@/api/emergentClient";

function OCRTestingDashboard() {
    const [testRuns, setTestRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTestRuns();
    }, []);

    const loadTestRuns = async () => {
        try {
            // This would load test runs when the backend supports them
            setTestRuns([]);
        } catch (error) {
            console.error("Error loading test runs:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading OCR testing dashboard...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">OCR Testing Dashboard</h1>
                <p className="text-gray-600">Monitor and analyze OCR performance</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Test Run Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">OCR testing features coming soon...</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Test results will appear here...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default OCRTestingDashboard;