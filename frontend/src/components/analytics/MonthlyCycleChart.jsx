
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/components/utils/currency';
import { User } from '@/api/entities';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays } from 'lucide-react';

const CATEGORY_COLORS = {
    meat_fish: '#ef4444',
    vegetables_fruits: '#84cc16',
    dairy_eggs: '#f59e0b',
    bakery: '#d97706',
    snacks_sweets: '#ec4899',
    beverages: '#3b82f6',
    household_cleaning: '#06b6d4',
    personal_care: '#8b5cf6',
    frozen_foods: '#60a5fa',
    pantry_staples: '#a16207',
    other: '#6b7280',
};

const processDataForCycle = (receipts) => {
    if (!receipts || receipts.length === 0) return [];

    const dailyData = {};

    receipts.forEach(receipt => {
        if (!receipt.purchase_date) return;
        
        try {
            const date = format(parseISO(receipt.purchase_date), 'yyyy-MM-dd');
            if (!dailyData[date]) {
                dailyData[date] = {
                    date: format(parseISO(date), 'dd/MM'), // Changed from 'MMM dd' to 'dd/MM'
                    total: 0,
                    sortKey: date,
                    supermarkets: {},
                    ...Object.keys(CATEGORY_COLORS).reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
                };
            }

            dailyData[date].total += receipt.total_amount || 0;
            if (receipt.supermarket) {
                dailyData[date].supermarkets[receipt.supermarket] = (dailyData[date].supermarkets[receipt.supermarket] || 0) + (receipt.total_amount || 0);
            }

            (receipt.items || []).forEach(item => {
                const category = item.category || 'other';
                const totalPrice = item.total_price || 0;
                if (CATEGORY_COLORS[category]) {
                    dailyData[date][category] += totalPrice;
                } else {
                    dailyData[date]['other'] += totalPrice;
                }
            });
        } catch (e) {
            console.warn("Could not parse date for receipt:", receipt.id);
        }
    });

    return Object.values(dailyData).map(day => {
        // Determine top supermarket for the label
        const topSupermarket = Object.entries(day.supermarkets).sort(([, a], [, b]) => b - a)[0];
        day.topSupermarketLabel = topSupermarket ? `${topSupermarket[0]}` : '';
        return day;
    }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
};

export default function MonthlyCycleChart({ receipts, loading }) {
    const [userCurrency, setUserCurrency] = useState('GBP');
    useEffect(() => { User.me().then(user => user && user.currency && setUserCurrency(user.currency)); }, []);
    
    const chartData = useMemo(() => processDataForCycle(receipts), [receipts]);

    if (loading) {
        return <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>;
    }
    
    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Spending Cycle</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <CalendarDays className="h-4 w-4" />
                        <AlertDescription>
                            No spending data available for this period to display the daily cycle.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Daily Spending Cycle</CardTitle>
                <CardDescription>Breakdown of your spending by category for each day in the period.</CardDescription>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 30, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => formatCurrency(val, userCurrency)} />
                            <Tooltip
                                cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                                formatter={(value, name) => [formatCurrency(value, userCurrency), name.replace(/_/g, ' ')]}
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            
                            {Object.keys(CATEGORY_COLORS).map(category => (
                                <Bar key={category} dataKey={category} stackId="a" fill={CATEGORY_COLORS[category]} name={category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
                                    {/* Only add the LabelList to the last bar in the stack to avoid duplication */}
                                    {category === 'other' && (
                                        <LabelList 
                                            dataKey="total" 
                                            position="top"
                                            formatter={(value) => formatCurrency(value, userCurrency)}
                                            style={{ fill: '#334155', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                    )}
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
