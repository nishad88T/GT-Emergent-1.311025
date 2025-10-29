import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ShoppingBasket, Info, ArrowUp, ArrowDown } from "lucide-react";
import { User } from '@/api/entities';
import { formatCurrency } from '@/components/utils/currency';

const InsightInfo = ({ basketSize }) => (
    <div className="space-y-3 p-1">
        <h4 className="font-semibold text-slate-800">What is Personal Basket Inflation?</h4>
        <p className="text-sm text-slate-600">
            This metric calculates the inflation rate for <strong className="font-medium">your personal "Core Basket" of goods</strong>. It's more accurate than national CPI because it's based on what <em className="font-medium">you</em> actually buy.
        </p>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h5 className="font-semibold text-emerald-900 text-sm">How is the "Core Basket" determined?</h5>
            <p className="text-xs text-emerald-800 mt-1">
                The app analyzes your purchase history over the last 6 months to find your {basketSize ? `top ${basketSize}` : `most frequent`} staple items. This ensures a stable and realistic comparison, period over period.
            </p>
        </div>
        <p className="text-sm text-slate-600">
            The percentage shows how much more (or less) it cost to buy these same core items in the current period compared to what they would have cost in the comparison period.
        </p>
    </div>
);

export default function BasketInflationInsight({ insight, loading, receipts, comparisonPeriods }) {
    const [userCurrency, setUserCurrency] = useState('GBP');
    
    useEffect(() => { 
        User.me().then(user => user && user.currency && setUserCurrency(user.currency)); 
    }, []);

    if (loading) {
        return <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>;
    }

    if (!insight || !insight.itemBreakdown || insight.basketSize < 3) {
        return (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBasket className="w-5 h-5 text-emerald-600" />
                        Personal Basket Inflation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-slate-500">
                        <p>Not enough recurring core items found between the selected periods to calculate a reliable personal inflation rate.</p>
                        <p className="text-xs mt-2">Try selecting a different comparison period or ensure you have at least 3 identical staple items purchased in both periods.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const inflationValue = insight.value;
    const isInflation = inflationValue > 0;
    const detailedInflationData = insight; // Use the insight object directly

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBasket className="w-5 h-5 text-emerald-600" />
                        Personal Basket Inflation
                    </CardTitle>
                    <CardDescription>
                        Your inflation for a core basket of {detailedInflationData.basketSize} items.
                    </CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-500">
                            <Info className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <InsightInfo basketSize={detailedInflationData.basketSize} />
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {isInflation ? 
                            <TrendingUp className="w-12 h-12 text-red-500" /> : 
                            <TrendingDown className="w-12 h-12 text-green-500" />
                        }
                        <div>
                            <p className="text-4xl font-bold" style={{ color: isInflation ? '#ef4444' : '#22c55e' }}>
                                {isInflation ? '+' : ''}{(inflationValue * 100).toFixed(2)}%
                            </p>
                            <p className="text-slate-600">Your personal inflation rate</p>
                        </div>
                    </div>
                    
                    {detailedInflationData && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">View Breakdown</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle>Basket Inflation Breakdown</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="text-sm text-slate-600">Current Period Cost</p>
                                            <p className="text-xl font-bold">{formatCurrency(detailedInflationData.currentBasketCost, userCurrency)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600">Previous Period Equivalent Cost</p>
                                            <p className="text-xl font-bold">{formatCurrency(detailedInflationData.comparisonBasketCost, userCurrency)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="max-h-96 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead>Qty Bought</TableHead>
                                                    <TableHead>Previous Avg Price</TableHead>
                                                    <TableHead>Current Avg Price</TableHead>
                                                    <TableHead>Price Change</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {detailedInflationData.itemBreakdown.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell>{item.quantity.toFixed(0)}</TableCell>
                                                        <TableCell>{formatCurrency(item.comparisonAvgPrice, userCurrency)}</TableCell>
                                                        <TableCell>{formatCurrency(item.currentAvgPrice, userCurrency)}</TableCell>
                                                        <TableCell>
                                                            <Badge className={item.inflation > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                                                                {item.inflation > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                                                {item.inflation > 0 ? '+' : ''}{(item.inflation * 100).toFixed(1)}%
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}