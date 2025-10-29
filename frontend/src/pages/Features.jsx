import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine, TrendingUp, Lightbulb, HeartPulse, Users, Check, X } from 'lucide-react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const Feature = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4 p-6 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex-shrink-0">
            <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
            <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);

export default function FeaturesPage() {
    const navigate = useNavigate();

    const handleGetStarted = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) {
                navigate(createPageUrl('Dashboard'));
            } else {
                await base44.auth.redirectToLogin();
            }
        } catch (error) {
            await base44.auth.redirectToLogin();
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why GroceryTrack™</h1>
                    <p className="text-xl md:text-2xl text-slate-700">
                        Detailed Grocery Insights That Budget Apps Miss
                    </p>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Comparison: Traditional Apps vs GroceryTrack™</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200">
                                            <th className="text-left py-4 px-4 font-semibold text-slate-700">Traditional Budget Apps</th>
                                            <th className="text-left py-4 px-4 font-semibold text-emerald-700">GroceryTrack™</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="py-4 px-4 text-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <span>Show only total grocery spend</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-900">
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium">Break down every receipt, item, and trend</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 text-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <span>Manual categorisation</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-900">
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium">Instant, AI-powered receipt scanning</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 text-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <span>Generic spending categories</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-900">
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium">True grocery taxonomy by item, store, and brand</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 text-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <span>No visibility on price changes</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-900">
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium">Track your personal inflation and volatility</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 px-4 text-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <span>No link to nutrition or value</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-900">
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium">Combine financial and nutritional insights</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* What You Get */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">What You Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Feature
                            icon={ScanLine}
                            title="Effortless Receipt Scanning"
                            description="Snap any grocery receipt; get an instant, itemised breakdown."
                        />
                        <Feature
                            icon={TrendingUp}
                            title="Personal Inflation Tracking"
                            description="See how your basket's prices evolve over time."
                        />
                        <Feature
                            icon={Lightbulb}
                            title="Smart Financial Insights"
                            description="Identify rising costs, better store options, and smarter swaps."
                        />
                        <Feature
                            icon={HeartPulse}
                            title="Nutrition Meets Value"
                            description="Link spending patterns with the nutritional quality of your food."
                        />
                        <Feature
                            icon={Users}
                            title="Household Sharing"
                            description="Sync spending and insights across your family for complete visibility."
                        />
                    </div>
                </motion.div>

                {/* Why It Matters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <Card className="border-none shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Why It Matters</h2>
                            <p className="text-lg text-slate-700 leading-relaxed mb-4">
                                Groceries make up roughly <strong>12–15% of household budgets</strong> — one of the few expenses you can truly control.
                            </p>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                Small, consistent changes <strong>(10–15% improvement)</strong> can save hundreds each year, reduce waste, and promote healthier eating habits.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Button
                        onClick={handleGetStarted}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg px-8 py-6 text-lg font-semibold"
                    >
                        Get Started →
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}