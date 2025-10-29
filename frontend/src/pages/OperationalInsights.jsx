import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, TrendingUp, DollarSign, Users, Activity } from "lucide-react";
import { getComprehensiveCreditReport } from "@/api/functions";
import emergentAPI from "@/api/emergentClient";

function OperationalInsights() {
    const [creditReport, setCreditReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadCreditReport();
    }, [dateRange]);

    const loadCreditReport = async () => {
        try {
            setLoading(true);
            const report = await getComprehensiveCreditReport(dateRange.startDate, dateRange.endDate);
            setCreditReport(report);
        } catch (error) {
            console.error("Error loading credit report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const exportReport = async () => {
        try {
            const reportData = JSON.stringify(creditReport, null, 2);
            const blob = new Blob([reportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `credit_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting report:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading operational insights...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Operational Insights</h1>
                    <p className="text-gray-600">Monitor platform usage and credit consumption</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium">From:</label>
                        <input
                            id="startDate"
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                            className="border rounded px-3 py-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium">To:</label>
                        <input
                            id="endDate"
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                            className="border rounded px-3 py-1"
                        />
                    </div>
                    <Button onClick={exportReport} disabled={!creditReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {creditReport ? (
                <div className="grid gap-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Credits</p>
                                        <p className="text-2xl font-bold">{creditReport.total_credits_consumed?.toLocaleString() || 0}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                                        <p className="text-2xl font-bold">{creditReport.total_events?.toLocaleString() || 0}</p>
                                    </div>
                                    <Activity className="w-8 h-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                                        <p className="text-2xl font-bold">{Object.keys(creditReport.by_user || {}).length}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Credits/Event</p>
                                        <p className="text-2xl font-bold">
                                            {creditReport.total_events > 0 
                                                ? (creditReport.total_credits_consumed / creditReport.total_events).toFixed(2)
                                                : '0.00'
                                            }
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Analytics */}
                    <div className="grid gap-6">
                        <AdminCreditAnalytics creditReport={creditReport} />
                        <AdminUsageMetrics creditReport={creditReport} />
                    </div>
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                            <p className="text-gray-600">No operational data found for the selected date range.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default OperationalInsights;