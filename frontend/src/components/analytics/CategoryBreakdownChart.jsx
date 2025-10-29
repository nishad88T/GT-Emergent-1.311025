
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, LabelList } from 'recharts';
import { formatCurrency } from '@/components/utils/currency';
import { User } from '@/api/entities';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'];
const COMPARISON_COLORS = { A: '#10b981', B: '#a78bfa' };

// Custom label component with dynamic color
const CustomLabel = (props) => {
    const { x, y, width, height, value, currency, totalSpend, fill } = props;
    const percentage = totalSpend > 0 ? ((value / totalSpend) * 100).toFixed(0) : 0;
    
    // Determine if label should be inside or outside based on bar size
    // For horizontal bars, 'width' is the relevant dimension.
    const isSmallBar = width < 80;
    
    // For small bars, place label outside (to the right) in dark color
    if (isSmallBar) {
        return (
            <text 
                x={x + width + 5} // Place to the right of the bar
                y={y + height / 2}
                fill="#334155" // Hardcoded dark grey for external labels
                textAnchor="start" // Align to start (left)
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
            >
                {`${formatCurrency(value, currency)} (${percentage}%)`}
            </text>
        );
    }
    
    // For larger bars, place label inside in white
    return (
        <text 
            x={x + width / 2} 
            y={y + height / 2} 
            fill="white" // Hardcoded white for internal labels
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="600"
        >
            {`${formatCurrency(value, currency)} (${percentage}%)`}
        </text>
    );
};

const processData = (receipts) => {
    if (!receipts || receipts.length === 0) return [];
    
    const categorySpending = {};
    receipts.forEach(receipt => {
        const items = receipt.items || [];
        items.forEach(item => {
            const category = item.category || 'other';
            const totalPrice = parseFloat(item.total_price) || 0;
            const formattedName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            if (!categorySpending[formattedName]) {
                categorySpending[formattedName] = { value: 0, originalName: category };
            }
            categorySpending[formattedName].value += totalPrice;
        });
    });

    return Object.entries(categorySpending)
        .filter(([name, data]) => data.value > 0)
        .map(([name, data]) => ({
            name,
            value: data.value,
            originalName: data.originalName
        }));
};

export default function CategoryBreakdownChart({ receiptsA, receiptsB, loading, onDrillDown }) {
    const [userCurrency, setUserCurrency] = useState('GBP');
    useEffect(() => { User.me().then(user => user && user.currency && setUserCurrency(user.currency)); }, []);

    const { data, totalSpendA, totalSpendB } = useMemo(() => {
        const dataA = processData(receiptsA || []);
        const totalA = dataA.reduce((sum, item) => sum + item.value, 0);
        
        if (!receiptsB || receiptsB.length === 0) {
            return { data: dataA.sort((a, b) => b.value - a.value), totalSpendA: totalA, totalSpendB: null };
        }
        
        const dataB = processData(receiptsB || []);
        const totalB = dataB.reduce((sum, item) => sum + item.value, 0);
        
        const mapA = {};
        const mapB = {};
        
        dataA.forEach(item => {
            mapA[item.name] = item;
        });
        
        dataB.forEach(item => {
            mapB[item.name] = item;
        });
        
        const allCategoryNames = new Set([
            ...dataA.map(item => item.name),
            ...dataB.map(item => item.name)
        ]);
        
        const comparisonData = Array.from(allCategoryNames).map(categoryName => {
            const itemA = mapA[categoryName];
            const itemB = mapB[categoryName];
            
            return {
                name: categoryName,
                spendA: itemA ? itemA.value : 0,
                spendB: itemB ? itemB.value : 0,
                originalName: itemA?.originalName || itemB?.originalName || categoryName.toLowerCase().replace(/ /g, '_')
            };
        }).filter(item => item.spendA > 0 || item.spendB > 0)
          .sort((a, b) => (b.spendA + b.spendB) - (a.spendA + a.spendB));
        
        return { data: comparisonData, totalSpendA: totalA, totalSpendB: totalB };
    }, [receiptsA, receiptsB]);

    if(loading) return <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>;

    const handleBarClick = (data, index) => {
        if (onDrillDown && data && data.originalName) {
            onDrillDown('category', data.originalName);
        }
    };

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Category Spending</CardTitle>
                <CardDescription>
                    {receiptsB ? 'Period A vs Period B' : 'Click a bar to see items'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <p>No category spending data for this period.</p>
                            <p className="text-sm mt-2">Receipts may not have detailed item information.</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            {receiptsB ? (
                                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 120, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                                        formatter={(value) => formatCurrency(value, userCurrency)}
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="spendA" name="Period A" fill={COMPARISON_COLORS.A} radius={[0, 4, 4, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                                        <LabelList dataKey="spendA" content={(props) => <CustomLabel {...props} currency={userCurrency} totalSpend={totalSpendA} fill={COMPARISON_COLORS.A} />} />
                                    </Bar>
                                    <Bar dataKey="spendB" name="Period B" fill={COMPARISON_COLORS.B} radius={[0, 4, 4, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                                        <LabelList dataKey="spendB" content={(props) => <CustomLabel {...props} currency={userCurrency} totalSpend={totalSpendB} fill={COMPARISON_COLORS.B} />} />
                                    </Bar>
                                </BarChart>
                            ) : (
                                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 120, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                                        formatter={(value) => formatCurrency(value, userCurrency)}
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" name="Spend" radius={[0, 4, 4, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        <LabelList dataKey="value" content={(props) => <CustomLabel {...props} currency={userCurrency} totalSpend={totalSpendA} fill={props.fill} />} />
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
